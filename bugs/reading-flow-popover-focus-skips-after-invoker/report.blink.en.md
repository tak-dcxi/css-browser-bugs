<!--
  Draft. Submit it by hand on the tracker.
  Tracker: Chromium Issue Tracker
  New bug form: https://issues.chromium.org/issues/new
  Product / Component: Blink>HTML>Focus (the component of the related reading-flow and popover focus bugs 335909581 and 436071736)
  Fields to set (version, hardware, keywords): Type: Bug; OS: Mac; Found In: 158.0.8127.88, 160.0.8186.0
  See Also: https://issues.chromium.org/issues/335909581
  Attach: repro.html
-->

# reading-flow: Tab out of a popover nested in a reading flow item skips the elements between the popover trigger and the popover, and Shift+Tab never returns to the trigger

## Steps to reproduce

1. Open the attached testcase (also available at https://tak-dcxi.github.io/css-browser-bugs/bugs/reading-flow-popover-focus-skips-after-invoker/repro.html).
2. The page has two copies of the same markup. In the "Test" copy, a column flex container has `reading-flow: flex-visual`. In the "Reference" copy, it does not. No item has `order`, so the reading order is the DOM order in both copies.
3. In each copy, the flex container has one child `div`. Inside it, a "Start here" link is followed by a paragraph that contains a button "1" (`popovertarget`) and then a "link after the button". The popover element comes right after that paragraph. It contains an "inner link" and a "Close" button. After the popover come a button "2" and a "Link in the next paragraph". The script prints these elements as start, button1, after, inner, close, button2, and next.
4. In the Test copy, click "Start here", press Tab to focus the "1" button, and press Enter to open the popover.
5. Press Tab four times, then press Shift+Tab four times.
6. Repeat steps 4 and 5 in the Reference copy.

A script prints the focus order under each copy, plus two checks: which element Tab from "Close" moves to, and which element Shift+Tab from "inner link" moves to. The script only records focus events; the browser's own Tab handling moves the focus.

## Actual results

In the Test copy:

- Tab: start > button1 > inner > close > button2 > next. After "Close", focus moves to the element that follows the popover element in the DOM ("button2"), so the "link after the button" is skipped.
- Shift+Tab from there: button2 > close > inner > after. From "inner link", focus moves to the "link after the button", not to the "1" button. Pressing Shift+Tab again repeats close > inner > after, so the "1" button and everything before it cannot be reached with Shift+Tab while the popover is open.

The two check lines under the Test copy read `Tab from "close": button2 (FAIL, expected after)` and `Shift+Tab from "inner": after (FAIL, expected button1)`.

The Reference copy gives start > button1 > inner > close > after > button2 for Tab, and after > close > inner > button1 for Shift+Tab.

## Expected results

The Test copy should give the same focus order as the Reference copy. After the last focusable element in the popover, Tab should move to the element after the "1" button (the "link after the button"). Shift+Tab from the first focusable element in the popover should move to the "1" button.

## Specification

HTML Standard, 6.6.2 Data model (focus navigation scope owner, associated focus navigation owner, flattened tabindex-ordered focus navigation scope):
https://html.spec.whatwg.org/multipage/interaction.html#flattened-tabindex-ordered-focus-navigation-scope

The popover trigger of a showing popover is a focus navigation scope owner, and the associated focus navigation owner of that popover is its trigger. The flattened tabindex-ordered focus navigation scope algorithm inserts the contents of a focusable scope owner right after that owner. So the popover's contents come right after the "1" button, and the element after the button comes after the popover's contents. No single sentence states this for popovers; it follows from the algorithm.

CSS Display Level 4 (https://drafts.csswg.org/css-display-4/#reading-flow) reorders the children of a reading flow container. It says nothing about popovers, and with `flex-visual` and no `order`, the reading order is the DOM order. So nothing in either spec explains why adding `reading-flow` changes the order here.

whatwg/html PR 10613 (https://github.com/whatwg/html/pull/10613, not merged) makes reading flow containers and reading flow items focus navigation scope owners. In its "associated focus navigation owner" steps, as of the 2025-03-28 preview (https://whatpr.org/html/10613/interaction.html#associated-focus-navigation-owner), the popover step comes before the reading flow steps, and the reading flow steps look only at the element's parent. So, under that text too, a showing popover with a trigger does not belong to the scope of the reading flow item that contains it. That preview still uses the older wording ("popover invoker", and the popover step returns the popover itself), but the popover is outside the reading flow item's scope either way.

Issue 335909581 (popover that is itself a reading flow container) was fixed by using the popover trigger as the scope owner. This bug is a different case: the popover is not a reading flow container but is inside a reading flow item.

## Environment

- Chrome 158.0.8127.88, macOS 27.2.1
- Chrome Canary 160.0.8186.0, macOS 27.2.1
- Chromium 159.0.8154.6 (bundled with Playwright 1.65.1), macOS 27.2.1

No settings changed. Results were taken with Playwright in headless mode by focusing the "Start here" link and pressing the keys (Chrome and Chrome Canary through the `chrome` and `chrome-canary` channels). The same results were then reproduced by hand in Chrome 158.0.8127.88, following the steps above.

The bug depends on where the popover element is. The following variations are not in the attached testcase; they were checked in Chromium 159.0.8154.6 only, with the popover opened by `popovertarget` unless noted:

- It happens with `flex-visual` and `flex-flow` (flex container), `grid-rows`, `grid-columns`, and `grid-order` (grid container), and `source-order` (flex or block container), as long as the popover element is a descendant of a child of the reading flow container.
- It happens when the popover element is inside the same paragraph as the button, when the button is outside the reading flow container, and when a flex container without `reading-flow` sits between the reading flow container and the popover element.
- It does not happen when the paragraph and the popover element are direct children of the reading flow container, when the popover element is outside the reading flow container, or with `reading-flow: normal`.
- Opening the popover with `commandfor`/`command="show-popover"` or with `showPopover({source: button})` gives the same result as `popovertarget`.

## Other browsers

Firefox (161.0, and 159.0 bundled with Playwright), Safari 27.2, Safari Technology Preview 27.0, and WebKit 27.2 bundled with Playwright do not support `reading-flow` (`CSS.supports('reading-flow', 'flex-visual')` is false), so they cannot be compared. In Firefox 159.0 and WebKit 27.2, the Test copy behaves like the Reference copy.

## Web Platform Tests

shadow-dom/focus-navigation/reading-flow/grid-order-with-popover.html is the only test that combines reading-flow and a popover (Chrome 2/2, Firefox 0/2, Safari 0/2 on wpt.fyi, 2026-11-26 runs). In that test the popover element is outside the reading flow container, which Chromium handles correctly. There is no test with the popover element inside a reading flow item.
