<!--
  Draft. Submit it by hand on the tracker.
  Tracker: WebKit Bugzilla
  New bug form: https://bugs.webkit.org/enter_bug.cgi?product=WebKit
  Product / Component: WebKit / Animations (the component of the content-visibility animation bugs 266712 and 268366)
  Fields to set (version, hardware, keywords): Version: Safari 27; Hardware: Mac (Apple Silicon), macOS 27
  See Also: https://bugs.webkit.org/show_bug.cgi?id=292713
  Attach: repro.html
-->

# Contents are not painted during a content-visibility transition to hidden, so the contents of ::details-content disappear as soon as details starts closing

## Steps to reproduce

1. Open the attached testcase (also available at https://tak-dcxi.github.io/css-browser-bugs/bugs/details-content-visibility-transition-hides-early/repro.html).
2. Look at the first test. It is a `<details>` element whose `::details-content` has `transition: content-visibility 1000s allow-discrete`. A script closes it right after load. The transition lasts 1000s, so it is still running while you look at it.
3. Look at the second test. It is a plain `<div>` with the same transition and a fixed `block-size`, so that its size cannot collapse. A script sets `content-visibility: hidden` on it right after load.
4. Compare both tests with the reference, an open `<details>` with no transition.
5. In the interactive case (the last one), click the summary to close the `<details>`. Its `::details-content` has a 3s transition.

## Actual results

In both tests, the green box is not painted, and there is an empty gap where it should be. In the interactive case (the last one), the green box disappears as soon as you click the summary.

While the transition runs, `getComputedStyle()` returns `visible` for `content-visibility` on the transitioning element (`::details-content` and the `<div>`), as expected. But `checkVisibility()` on the green box returns `false`. So the computed value is interpolated correctly, but the contents are skipped as if the value were already `hidden`. I checked these values in Safari 27.2 and Safari Technology Preview 27.0.

This breaks the common pattern of animating `<details>` closing with `::details-content` (for example, a `block-size` or `opacity` transition together with `content-visibility ... allow-discrete`). The height animates, but the contents vanish at the start.

## Expected results

Both tests should show the green box, as the reference does. In the interactive case (the last one), the green box should stay visible for 3 seconds and then disappear.

## Specification

CSS Containment Module Level 2, 4.1 Animating and Interpolating content-visibility:
https://drafts.csswg.org/css-contain-2/#content-visibility-animation

During interpolation between `hidden` and any other value, progress values between 0 and 1 map to the non-hidden value. So during a transition from `visible` to `hidden`, the value is `visible`, and the element should not skip its contents until the transition ends. The CSSWG resolved this in https://github.com/w3c/csswg-drafts/issues/8627 to allow content, such as the contents of a closed `<details>`, to stay visible while an animation is completing. A closed `<details>` gets `content-visibility: hidden` on `::details-content` from the UA (https://html.spec.whatwg.org/multipage/rendering.html#the-details-and-summary-elements), so closing it starts this transition. The example in CSS Pseudo-Elements Module Level 4 (https://drafts.csswg.org/css-pseudo-4/#details-content-pseudo) declares `transition: content-visibility 300ms allow-discrete, opacity 300ms` on `::details-content`.

Relation to bug 292713: bug 292713 ("Transitioning content-visibility collapses the size of the element eagerly") reports that an element with block children collapses at the start of the transition, while its contents stay visible. I ran its testcase in Safari 27.2 with the transition lengthened to 1000s. The `<div>` with a block child collapses to zero height, and the `<div>` with only inline content keeps its height. In both, the contents are not painted, unlike what 292713 describes. This bug is about the contents not being painted, which also happens when the size is kept: in `::details-content`, in a `<div>` with only inline content, and in a `<div>` with a fixed size. So I am filing it separately, although both bugs may come from using the end value `hidden` from the start of the transition.

## Environment

- Safari 27.2 (22625.2.8.11.9), macOS 27.2.1
- Safari Technology Preview 27.0 (22627.1.6.3), macOS 27.2.1

No settings changed.

## Other browsers

- Chrome 157.0.8103.80 and Chrome Canary 160.0.8172.0: the green box stays painted during the transition in all cases.
- Firefox 160.0.1 and Firefox Nightly 162.0a1: the green box stays painted during the transition in all cases.

## Web Platform Tests

css/css-contain/content-visibility/content-visibility-interpolation.html checks the interpolated computed value and passes in Safari 27.2 (130/130, also in Chrome and Firefox). I found no test that checks that contents are painted during a transition to `hidden`.

Results from wpt.fyi on 2026-11-21 (stable runs: Chrome 158.0.8127.36, Firefox 160.0.1, Safari 27.2).
