<!--
  Draft. Submit it by hand on the tracker.
  Tracker: WebKit Bugzilla
  New bug form: https://bugs.webkit.org/enter_bug.cgi?product=WebKit
  Product / Component: WebKit / Layout and Rendering (the component of the related text-wrap-style: pretty bugs, such as 288650)
  Fields to set (version, hardware, keywords): Version: Safari 27; Hardware: Mac (Apple Silicon), macOS 27
  See Also: https://bugs.webkit.org/show_bug.cgi?id=288650
  Attach: repro.html
-->

# text-wrap-style: pretty shortens every line of Japanese text and adds lines, even when auto already fills every line

## Steps to reproduce

1. Open the attached testcase (also available at https://tak-dcxi.github.io/css-browser-bugs/bugs/text-wrap-pretty-cjk-balances/repro.html).
2. Each case shows the same Japanese paragraph (`lang="ja"`) three times: `text-wrap-style: pretty`, `auto`, and `balance`. The box has a dashed outline. A script prints the number of characters on each line under each box.
3. Compare the "Test (pretty)" box with the "Reference (auto)" and "balance" boxes in each case.

## Actual results

Case 1 (`inline-size: 16em`): with `auto`, every line is full, including the last one (8 lines of 17 characters). With `pretty`, every line is shorter and there is one more line (9 lines of 15 or 16 characters), leaving space at the end of every line.

Case 2 (`inline-size: 28em`): with `auto`, the lines are 30, 30, 30, 30 and 16 characters. With `pretty`, they are 27, 27, 27, 27 and 28 characters, exactly the same as `balance`.

The same happens without `lang="ja"`. I also compared widths from 10em to 30em: `pretty` makes every line of the Japanese paragraph shorter than `auto` at every width. At 10em it turns 14 lines into 17 lines, more than `balance` (14 lines). English text shows the same tendency (at many widths `pretty` breaks exactly like `balance`, and at 10em 12 lines become 15), but it is much more visible in Japanese, where `auto` already fills every line to the end edge.

## Expected results

The "Test (pretty)" box should look like the "Reference (auto)" box, apart from a few characters moved to the last line to avoid a short last line.

Japanese text can break between almost any two characters, so `auto` already gives lines of equal length. Japanese typography sets lines to the full line length (see Requirements for Japanese Text Layout, https://www.w3.org/TR/jlreq/). Shortening every line and adding lines makes the layout worse, not better.

## Specification

CSS Text Module Level 4, 5.4 Selecting How to Wrap: the text-wrap-style property:
https://drafts.csswg.org/css-text-4/#text-wrap-style

`pretty` asks the UA to bias for better layout over speed. It may avoid short last lines and may improve the layout in other ways, such as reducing variation in line length. The details are up to the UA, so `pretty` breaking like `balance` is not forbidden by itself. In Japanese text, however, `auto` already has no variation in line length except on the last line, so making the lines shorter does not improve the layout.

This looks related to bug 288650 ("[text-wrap-style:pretty] Bias ideal line width to be closer to max bounds"), whose draft PR (https://github.com/WebKit/WebKit/pull/41458) moves the ideal line width of `pretty` closer to the available width. I am filing this separately because 288650 has no description and does not mention CJK text or the increase in the number of lines.

## Environment

- Safari 27.2 (22625.2.8.11.9), macOS 27.2.1
- Safari Technology Preview 27.0 (22627.1.6.3), macOS 27.2.1

No settings changed.

## Other browsers

- Chrome 157.0.8103.80 and Chrome Canary 160.0.8168.0: `pretty` breaks the same way as `auto` in both cases. (Glyphs are narrower in these browsers, so 16em fits 16 characters per line, not 17.)
- Firefox 160.0.1 and Firefox Nightly 162.0a1: `text-wrap-style: pretty` is not supported (https://bugzilla.mozilla.org/show_bug.cgi?id=1960910).

## Web Platform Tests

There are no tests for where `pretty` breaks lines. The existing tests check only parsing and crashes:

- css/css-text/parsing/text-wrap-pretty.html (Chrome 14/14, Firefox 2/14, Safari Technology Preview 14/14)
- css/css-text/text-wrap-style/crashtests/text-wrap-style-pretty-block-in-inline-crash.html

Results from wpt.fyi on 2026-11-18 (master runs of 2026-11-16).
