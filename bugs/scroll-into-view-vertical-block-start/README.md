---
title: "縦書きで scrollIntoView() の block と inline が、横書きの向きとして扱われる"
slug: scroll-into-view-vertical-block-start
created: 2026-11-24
updated: 2026-11-24
features: scrollIntoView, writing-mode
status.webkit: not-affected
status.gecko: fixed
status.blink: not-affected
links.webkit:
links.gecko: https://bugzilla.mozilla.org/show_bug.cgi?id=1789464 https://bugzilla.mozilla.org/show_bug.cgi?id=1699045
links.blink:
links.spec: https://drafts.csswg.org/cssom-view/#determine-the-scroll-into-view-position
---

# 縦書きで scrollIntoView() の block と inline が、横書きの向きとして扱われる

## 症状

`writing-mode: vertical-rl` のページで `Element.scrollIntoView()` を呼ぶと、Firefox では、既定の `block: "start"` を指定しても、要素がブロック方向の始まり（右端）に揃わなかった。`inline: "end"` を足すと、右端に揃った。

Firefox は、`block` と `inline` を、writing mode に関係なく横書きの向きで解釈していた。`block: "start"` を上端、`inline: "end"` を右端として扱っていたため、`vertical-rl` では `inline: "end"` がブロック方向の始まりに当たった。この症状は、ルートに `writing-mode: vertical-rl` を指定したページで、2024年4月（Firefox 124〜125 のころ）に見つけた。

## 期待する挙動と根拠

CSSOM View の [determine the scroll-into-view position](https://drafts.csswg.org/cssom-view/#determine-the-scroll-into-view-position) は、`block` をブロック方向（block flow direction）の位置、`inline` をインライン方向（inline base direction）の位置として、writing mode に従って物理的な辺に対応づける。`vertical-rl` では、`block: "start"` で要素の右端がスクロールコンテナーの右端に揃う。仕様はこの挙動を決めている。

どの要素の writing mode を使うかは、仕様の文とブラウザの実装が食い違っている。

- 仕様の文は、スクロールコンテナー（scrolling box）の writing mode を使うと書いている。
- Chrome、Safari、Firefox 137 以降は、`scrollIntoView()` を呼んだ要素の writing mode を使う。
- [w3c/csswg-drafts#11796](https://github.com/w3c/csswg-drafts/issues/11796) で、CSSWG は2025年4月に「use the writing mode of the target element」と決議した。Needs Edits のラベルが付いたまま、仕様の文はまだ直っていない（2026-11-24 時点）。

この件のテストケースは、スクロールコンテナーと要素の writing mode が同じなので、どちらの読み方でも期待する見た目は同じになる。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/scroll-into-view-vertical-block-start/repro.html

`writing-mode: vertical-rl` のスクロールコンテナーの中の緑の箱に対して、`scrollIntoView()` と `scrollIntoView({ block: "start" })` を呼ぶ。参照は、緑の箱を最初の子にして、スクロールせずに右端へ置いたもの。テストと参照が同じに見えれば期待どおり。

修正前の Firefox は `block: "start"` を上端として扱うので、緑の箱が右端に揃わず、参照と違って見えるはずである（修正前の版では確かめていない）。

## 確認した環境

OS: macOS 27.2.1

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 期待どおり |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 期待どおり |
| Firefox | 160.0.1 | なし | 期待どおり |
| Firefox Nightly | 163.0a1 | なし | 期待どおり |
| Google Chrome | 158.0.8127.88 | なし | 期待どおり |
| Google Chrome Canary | 160.0.8180.0 | なし | 期待どおり |

## web-platform-tests

wpt.fyi で `scrollIntoView` と `cssom-view/scrollIntoView` を検索した（2026-11-23 の run）。縦書きのテストは、安定版（Chrome 158、Firefox 160、Safari 27.2）でいずれも全エンジンが合格している。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [cssom-view/scrollIntoView-vertical-rl-writing-mode.html](https://wpt.fyi/results/css/cssom-view/scrollIntoView-vertical-rl-writing-mode.html) | 9/9 | 9/9 | 9/9 |
| [cssom-view/scrollIntoView-vertical-lr-writing-mode.html](https://wpt.fyi/results/css/cssom-view/scrollIntoView-vertical-lr-writing-mode.html) | 9/9 | 9/9 | 9/9 |
| [cssom-view/scrollIntoView-vertical-lr-writing-mode-and-rtl-direction.html](https://wpt.fyi/results/css/cssom-view/scrollIntoView-vertical-lr-writing-mode-and-rtl-direction.html) | 9/9 | 9/9 | 9/9 |
| [cssom-view/scrollIntoView-sideways-rl-writing-mode.html](https://wpt.fyi/results/css/cssom-view/scrollIntoView-sideways-rl-writing-mode.html) | 9/9 | 9/9 | 9/9 |
| [cssom-view/scrollIntoView-sideways-lr-writing-mode.html](https://wpt.fyi/results/css/cssom-view/scrollIntoView-sideways-lr-writing-mode.html) | 9/9 | 9/9 | 9/9 |

Firefox がこれらのテストに失敗していたことは、Mozilla の [bug 1887460](https://bugzilla.mozilla.org/show_bug.cgi?id=1887460)（2024年3月）に記録がある。

## 検索の記録

検索日: 2026-11-24

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| Mozilla Bugzilla | scrollIntoView vertical | 1 | なし |
| Mozilla Bugzilla | scrollIntoView writing-mode | 5 | [1699045](https://bugzilla.mozilla.org/show_bug.cgi?id=1699045)、[1950252](https://bugzilla.mozilla.org/show_bug.cgi?id=1950252) |
| Mozilla Bugzilla | scrollIntoView vertical-rl | 0 | - |
| Mozilla Bugzilla | scrollIntoView writing mode | 6 | 上の2件と [1887460](https://bugzilla.mozilla.org/show_bug.cgi?id=1887460) |
| Mozilla Bugzilla | scrollIntoView block inline | 4 | なし |
| Mozilla Bugzilla | scrollIntoView rtl | 2 | [1789464](https://bugzilla.mozilla.org/show_bug.cgi?id=1789464) |
| Mozilla Bugzilla | scroll-margin vertical | 0 | - |
| Mozilla Bugzilla | ScrollIntoView logical | 0 | - |
| csswg-drafts | scrollIntoView writing-mode | 2 | [#11796](https://github.com/w3c/csswg-drafts/issues/11796) |
| csswg-drafts | scrollIntoView vertical | 12 | #11796 |
| csswg-drafts | scrollIntoView block inline | 22 | #11796 |
| csswg-drafts | scroll into view logical | 48 | なし（1ページ目の25件だけを見た） |
| csswg-drafts | ScrollLogicalPosition | 11 | なし |
| web-platform-tests | scrollIntoView | 57 | 「web-platform-tests」の表の5件 |
| web-platform-tests | cssom-view/scrollIntoView | 36 | 同上 |
| web-platform-tests | scroll-into-view | 10 | なし |

関係する件の中身は次のとおり。

- [bug 1699045](https://bugzilla.mozilla.org/show_bug.cgi?id=1699045)（NEW、2021年）: この件と同じ症状の報告。`vertical-rl` のコンテナーで、`block: "start"` が上端、`inline: "end"` が右端として扱われると書いている。状態は NEW のまま。
- [bug 1789464](https://bugzilla.mozilla.org/show_bug.cgi?id=1789464)（RESOLVED FIXED、Target Milestone は 137 Branch）: `direction: rtl` の報告から始まり、writing mode を扱わない実装そのものを直した件。2025年2月27日に mozilla-central に入った修正は、`block` と `inline` を、`scrollIntoView()` を呼んだ要素の writing mode で解釈する。縦書きの例（comment 6）も、この修正で直ると書かれている。
- [bug 1950252](https://bugzilla.mozilla.org/show_bug.cgi?id=1950252): sideways の WPT の失敗。bug 1789464 の重複として閉じられた。
- [bug 1887460](https://bugzilla.mozilla.org/show_bug.cgi?id=1887460)（NEW）: 縦書きの WPT の失敗の記録。上の表のとおり、今の Firefox は合格している。

## 結論

- Gecko: `fixed`。[bug 1789464](https://bugzilla.mozilla.org/show_bug.cgi?id=1789464) の修正で、Firefox 137 から直った。Firefox 160.0.1 と Nightly 163.0a1 では、テストケースが参照と一致した。同じ症状を報告した [bug 1699045](https://bugzilla.mozilla.org/show_bug.cgi?id=1699045) は、2026-11-24 時点で NEW のまま残っている。
- WebKit: `not-affected`。Safari 27.2 と Safari Technology Preview で、テストケースが参照と一致した。
- Blink: `not-affected`。Chrome 158 と Canary 160 で、テストケースが参照と一致した。

修正前の Firefox に向けて `inline: "end"` を足す回避策は、Firefox 137 以降では要らない。修正後の Firefox は、`vertical-rl` の要素に対する `inline: "end"` を下端への揃えとして扱う。そのため、インライン方向（縦）にもスクロールが起きる配置では、回避策を残すと要素の縦の位置が変わる。
