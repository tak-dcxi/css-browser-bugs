<!--
  Draft. Submit it by hand on the tracker.
  Tracker: WebKit Bugzilla
  New bug form: https://bugs.webkit.org/enter_bug.cgi?product=WebKit
  Product / Component: WebKit / CSS (the component of bug 255419, a sizing bug of checkboxes in flexbox)
  Fields to set (version, hardware, keywords): Version: Safari 27; Hardware: Mac (Apple Silicon), macOS 27
  Attach: repro.html
-->

# aspect-ratio is ignored on checkboxes and radio buttons with appearance: auto (the auto dimension stays at 12px)

## Steps to reproduce

1. Open the attached testcase (also available at https://tak-dcxi.github.io/css-browser-bugs/bugs/checkbox-radio-aspect-ratio-collapses/repro.html).
2. Look at the table. Each row has a test control with `inline-size: 36px; aspect-ratio: 1` and a reference control with `inline-size: 36px; block-size: 36px`. The rows cover checkboxes and radio buttons, `appearance: auto` and `appearance: none`, and five containers (block, flex with `align-items: start`, flex with a one-line label, flex with a two-line label, grid). The controls have `flex: none`, so they do not shrink in the flex rows.
3. In the rows marked "square expected", compare the test control with the reference control. In all rows, read the "Test size", "Expected", and "Result" columns, which a script fills in from `getBoundingClientRect()` and `getComputedStyle()`.

## Actual results

In the 10 rows with `appearance: auto`, the test control is 36px wide and 12px tall, and the row says FAIL. `getComputedStyle()` reports `block-size: 12px`. This is the same in all five containers, including the flex rows marked "stretched".

In the 10 rows with `appearance: none`, the test control has the expected size, and the row says PASS.

So with the native appearance, `aspect-ratio` has no effect on a checkbox or a radio button. The dimension that the author left as `auto` stays at 12px, which appears to be the control's default size, instead of the size given by the ratio. I also checked these declarations outside the testcase in Safari 27.2, on `<input type="checkbox">` and `<input type="radio">` with `margin: 0`:

- `width: 36px; aspect-ratio: 2 / 1` gives 36 × 12 (expected 36 × 18).
- `height: 36px; aspect-ratio: 1` gives 12 × 36 (expected 36 × 36).
- `<button>` and `<input type="range">` with `width: 100px; aspect-ratio: 1` are 100 × 100, so `aspect-ratio` works on these controls with the native appearance.

## Expected results

In the rows marked "square expected", the test control should be a 36px square, the same as the reference control.

In the rows marked "stretched", Firefox and Chrome make the test control 36px wide and as tall as the flex line (the height in the "Expected" column: 36px with the one-line label, where the control itself is the tallest item in the flex line, and the height of the label with the two-line label). The testcase expects the same in Safari. With `appearance: none`, Safari already gives these sizes.

## Specification

CSS Box Sizing Module Level 4, 4.1 Preferred Aspect Ratios: the aspect-ratio property:
https://drafts.csswg.org/css-sizing-4/#aspect-ratio

`aspect-ratio` applies to all elements except inline boxes and internal ruby or table boxes, and the preferred aspect ratio is used in the calculation of auto sizes. When the value is a `<ratio>` alone, the preferred aspect ratio is the specified ratio. Only `auto` and `auto <ratio>` defer to the natural aspect ratio of a replaced element.

CSS Basic User Interface Module Level 4, 7.2 Switching appearance: the appearance property:
https://drafts.csswg.org/css-ui-4/#appearance-switching

For `appearance: auto`, the element's box is laid out like a regular replaced element, and the native appearance is drawn within that box. The same section says: "CSS properties that impact the box sizing or position of the widget's box (such as the sizing properties) [...] must be applied to widgets rendered with their native appearance. The widget's box participates in the rest of layout like any other replaced element." The properties that user agents may disregard are the ones that size and paint the contents of the widget, such as `box-sizing`, `padding`, `border` or `margin`. So the native appearance does not change how the box is sized.

HTML, 15.5.10 The input element as checkbox, switch, and radio button widgets:
https://html.spec.whatwg.org/multipage/rendering.html#the-input-element-as-a-checkbox-and-radio-button-widgets

A checkbox and a radio button are expected to render as an `inline-block` box containing a single control. The section does not give these controls a fixed size.

In the rows marked "square expected", the testcase does not set `block-size` on the test control, so it is `auto`, and it should be resolved from `inline-size: 36px` and `aspect-ratio: 1`. In the grid row, the control is not stretched: CSS Grid Layout Module Level 2, 6.2 Grid Item Sizing (https://drafts.csswg.org/css-grid-2/#grid-item-sizing) sizes a grid item that has a preferred aspect ratio by the rules for block-level elements under normal alignment.

For the rows marked "stretched": CSS Box Alignment Module Level 3, 6.2.4 (https://drafts.csswg.org/css-align-3/#align-flex) says that `align-self: normal` behaves as `stretch` on flex items. I did not work out from the flex layout algorithm how the stretched cross size combines with `aspect-ratio`, so for these rows I rely on the result in Firefox and Chrome, not on a specific sentence of a specification.

## Environment

- Safari 27.2 (22625.2.8.11.9), macOS 27.2.1
- Safari Technology Preview 27.0 (22627.1.6.3), macOS 27.2.1

No settings changed.

## Other browsers

- Firefox 160.0.1 (macOS 27.2.1): all 20 rows pass.
- Chrome 157.0.8103.80 (macOS 27.2.1): all 20 rows pass.

## Web Platform Tests

I found no test that checks `aspect-ratio` on a checkbox or a radio button. I searched wpt.fyi on 2026-11-25 for `aspect-ratio checkbox` (no results), `css-sizing/aspect-ratio/flex-aspect-ratio` (59 tests) and `aspect-ratio/replaced-element` (50 tests). None of the test names mention form controls. I did not read the contents of those tests.
