<!--
  Draft. Submit it by hand on the tracker.
  Tracker: WebKit Bugzilla
  New bug form: https://bugs.webkit.org/enter_bug.cgi?product=WebKit
  Product / Component: WebKit / Layout and Rendering (the component of the closest existing bug, 314641)
  Fields to set (version, hardware, keywords): Version: Safari 26; Hardware: Mac (Apple Silicon), macOS 26
  Attach: repro.html
-->

# Transition of an anchor-positioned ::after does not start when a :has() rule matches its originating element

## Steps to reproduce

1. Open the attached testcase (also available at https://tak-dcxi.github.io/css-browser-bugs/bugs/anchor-pseudo-transition-has-originating/repro.html).
2. Look at groups 1 to 5 and the result lines at the top of the page. After the page loads, the script moves `anchor-name` from the link "One" to the link "Three". The `left` of the highlight is `anchor(left)` and has a transition with a very long duration and a negative delay of half the duration, so a running transition stays at its midpoint (over "Two").
3. For a manual check, move the pointer from "One" to "Three" in lists H1 to H5.

The relevant part of group 2:

```css
ul { position: relative; }
ul .current { anchor-name: --a2; }
ul::after {
  content: "";
  position: absolute;
  position-anchor: --a2;
  left: anchor(left);
  transition: left 10000s linear -5000s;
}
ul:has(a.current) { --flag: on; } /* any rule; the value is never used */
```

## Actual results

In group 2 the highlight jumps to "Three", and no transition is created:

```text
Group 2: left 0px -> 192px, running transitions of left: 0
```

The only difference from group 1 (control, passes) is the `:has()` rule that matches the `ul`, the originating element of the `::after`. The declarations in the rule do not matter: a declaration of an unused custom property is enough. In my own page, a rule that changes `color` had the same effect (not included in the testcase).

The transition does start in these cases:

- Group 3 / H4: the same `:has()` rule on the parent of the `ul`.
- Group 4 / H5: a real child element positioned with `anchor()` instead of `::after`, with the `:has()` rule on the `ul`.
- H3: `ul:hover` instead of `ul:has(a:hover)`.
- Group 5: an `::after` whose `left` changes through a class, without anchor positioning, with the `:has()` rule on the `ul`.

With `:hover` (H2, `ul:has(a:hover)`), the highlight also jumps from link to link instead of sliding, while it slides in H1, H3, H4 and H5.

## Expected results

In groups 1 to 5 the highlight should be over "Two", the same as in the Reference, with one running transition of `left` in each group:

```text
Expected: left 0px -> 96px, running transitions of left: 1
```

In H1 to H5 the highlight should slide over 1 second.

## Specification

CSS Anchor Positioning Module Level 1, §3.2 Anchor-relative Insets: the anchor() function: https://drafts.csswg.org/css-anchor-position-1/#anchor-pos

A resolvable `anchor()` function "resolves at computed value time (using style & layout interleaving)" to a `<length>`. The note in the same section says that transitions of a property using an anchor function work for changes such as "the anchor-name property being changed on anchors". So moving `anchor-name` changes the computed value of `left` on the `::after`, and a transition starts (CSS Transitions Level 1, §3 Starting of transitions: https://drafts.csswg.org/css-transitions-1/#starting). Whether a `:has()` rule matches the originating element does not change the before-change or after-change value of `left`.

## Environment

- Safari 26.5 (21624.2.5.11.4), macOS 26.5.1: fails (group 2 and H2).
- Safari Technology Preview 27.0 (21627.1.6.3), macOS 26.5.1: fails (group 2 and H2).
- No settings changed.

## Other browsers

- Chrome 157.0.8103.80 and Chrome Canary 160.0.8168.0: pass (a transition starts in all groups).
- Firefox 160.0.1 and Firefox Nightly 162.0a1: transitions of `anchor()` values are not supported yet, with or without `:has()` (https://bugzilla.mozilla.org/show_bug.cgi?id=1924226). Group 5, without anchor positioning, passes.

Possibly related WebKit bugs:

- Bug 314641 (Transition does not work properly for anchor positioning): an anchor-positioned `fieldset::before` whose anchor is set by `label:has(:checked)` transitions only some of the time. The `:has()` there matches the anchor, not the originating element, so I am filing this separately.
- Bug 300845: while a `display` transition runs, `left: anchor(...)` fails to resolve; its description points at the code in StyleTreeResolver.cpp that skips applying animations while the anchor position is unresolved.
- Bug 328203: the anchor-positioned element's resolution is restarted on each style update, and `anchor()` first computes to `auto` before the interleaved layout resolves it. I have not checked whether this is the cause here.

## Web Platform Tests

No test covers a transition of an anchor-positioned pseudo-element, or a `:has()` rule on the originating element. The closest tests in `css/css-anchor-position/` pass in Safari Technology Preview 256 on wpt.fyi (2026-11-16):

- `anchor-transition-name.html` (transition when the dereferenced anchor name changes, real elements): 1/1. This corresponds to group 1.
- `anchor-transition-focus.html` (`body:has(:focus) { --unused: foo; }` with a transition, real elements, values without `anchor()`): 1/1.

The testcase is released under CC0 and can be turned into a WPT test.
