---
title: "::-moz-range-thumb に指定した anchor-name で、アンカーにならない"
slug: range-thumb-anchor-name
created: 2026-11-24
updated: 2026-11-24
features: "CSS Anchor Positioning, anchor-name, anchor(), ::-moz-range-thumb, ::-webkit-slider-thumb, ::slider-thumb"
status.webkit: not-affected
status.gecko: duplicate
status.blink: not-affected
links.webkit:
links.gecko: https://bugzilla.mozilla.org/show_bug.cgi?id=1993699
links.blink:
links.spec: https://drafts.csswg.org/css-anchor-position-1/#target
---

# ::-moz-range-thumb に指定した anchor-name で、アンカーにならない

## 症状

調査を始めた時点の説明は「Firefox で `::-moz-range-thumb` に指定した `anchor-name` が動作しない」。もとの例は画像の比較スライダーで、つまみに `anchor-name` を付け、区切り線とアイコンを `position-anchor` と `anchor-center` でつまみに追従させている。

`<input type="range">` のつまみの擬似要素（Gecko では `::-moz-range-thumb`、WebKit と Blink では `::-webkit-slider-thumb`）に `anchor-name` を指定し、別の要素を `position-anchor` でその名前に結び付けて `anchor()` で配置する。Firefox では、つまみがアンカーにならず、`anchor()` はフォールバックの値になる。`getComputedStyle(input, "::-moz-range-thumb").anchorName` は `--thumb` を返すので、宣言そのものは当たっている。

## 期待する挙動と根拠

- [CSS Anchor Positioning 1 の 2.1](https://drafts.csswg.org/css-anchor-position-1/#name): `anchor-name` の「Applies to」は「all elements that generate a principal box」。
- [2.3 の acceptable anchor element](https://drafts.csswg.org/css-anchor-position-1/#target): アンカーになれる条件の1つめが「element or a fully styleable pseudo-element」。
- [csswg-drafts#12949](https://github.com/w3c/csswg-drafts/issues/12949)（閉）で、CSSWG は「fully styleable な tree-abiding 擬似要素だけがアンカーになれる（`::placeholder` と `::marker` は含まない）」と決議した。
- [CSS Form Control Styling 1 の 4.4](https://drafts.csswg.org/css-forms-1/#slider-pseudos): 標準のつまみの擬似要素 `::slider-thumb` は fully styleable pseudo-element と定められている。

仕様の判断: 標準の `::slider-thumb` がアンカーになれることは、仕様が決めている。一方、`::-moz-range-thumb` と `::-webkit-slider-thumb` はエンジン独自の擬似要素で、アンカーになれるかを仕様は決めていない。確かめた時点では、`::slider-thumb` を実装したエンジンはない（Safari 27.2、Safari Technology Preview、Firefox 160.0.1 で `CSS.supports("selector(::slider-thumb)")` が `false`）。そのため、Gecko の挙動を仕様違反とは言えない。ただし、WebKit と Blink は `::-webkit-slider-thumb` をアンカーとして扱うので、エンジンのあいだで結果が食い違う。

関係する議論:

- [csswg-drafts#14234](https://github.com/w3c/csswg-drafts/issues/14234)（開）: `::before` と `::after` のほかにどの擬似要素が scroll timeline と view timeline になれるかを問う Issue。コメントで、スライダーのつまみに view timeline を付ける使い方が挙げられている。もとの例はつまみに `view-timeline` も付けているが、この件のテストケースでは扱っていない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/range-thumb-anchor-name/repro.html

幅 300px のスライダーに 20px のつまみを付け、値を 75 にしているので、つまみの左端は 210px の位置に来る。青い四角は `left: anchor(left, 0px)` で配置するので、つまみがアンカーになれば 210px に、ならなければフォールバックの 0px に来る。Control は本物の要素をアンカーにした場合、Reference はアンカー配置を使わない場合。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-24。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 合格。Test、Control、Reference の青い四角の位置がどれも 210px（Safari の MCP サーバで測った） |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 合格。Safari 27.2 と同じ |
| Firefox | 160.0.1 | なし | 失敗。Test の青い四角が左端（0px）にある。Control と Reference は 210px |
| Firefox Nightly | 163.0a1 | なし | 失敗。Firefox 160.0.1 と同じ |
| Google Chrome | 158.0.8127.88 | なし | 合格 |
| Google Chrome Canary | 160.0.8180.0 | なし | 合格 |

Firefox の2つは目で見た判定で、Firefox 160.0.1 では Firefox の DevTools の MCP サーバで青い四角の位置も測った（Test 0px、Control 210px、Reference 210px）。Chrome の2つは、目で見た判定で失敗がなかった。

## web-platform-tests

確認日: 2026-11-24。wpt.fyi の実行は 2026-11-23（安定版: Chrome 158.0.8127.36、Firefox 160.0.1、Safari 27.2。先行版: Chrome 160.0.8178.0、Firefox 163.0a1、Safari Technology Preview 257）。

スライダーのつまみの擬似要素をアンカーにするテストはない。擬似要素をアンカーにするテストは `css/css-anchor-position/pseudo-element-anchor*.html` にあるが、扱うのは `::before` と `::after` だけ。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [pseudo-element-anchor.html](https://wpt.fyi/results/css/css-anchor-position/pseudo-element-anchor.html) | 2/2 | 2/2 | 2/2 |
| [pseudo-element-anchor-dynamic.html](https://wpt.fyi/results/css/css-anchor-position/pseudo-element-anchor-dynamic.html) | 2/2 | 2/2 | 2/2 |
| [pseudo-element-anchor-tree-order.html](https://wpt.fyi/results/css/css-anchor-position/pseudo-element-anchor-tree-order.html) | 5/5 | 5/5 | 5/5 |
| [css-pseudo/slider/slider-thumb-001.html](https://wpt.fyi/results/css/css-pseudo/slider/slider-thumb-001.html) | FAIL | FAIL | FAIL |

`slider-thumb-001.html` は `::slider-thumb` の描画のテストで、アンカーは扱わない。どのテストも、安定版と先行版で結果は同じ。

探した語: `css-anchor-position`、`anchor-name`、`css-anchor-position/pseudo`、`anchor-pseudo`（0件）、`css-forms`、`slider-thumb`、`range-thumb`（0件）。

## 検索の記録

検索日: 2026-11-24。csswg-drafts は、組み込みブラウザで GitHub の Issue の検索（`is:issue`、状態の絞り込みなし）を開いて調べた。

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| csswg-drafts | anchor-name pseudo-element | 87（1ページ目だけを見た） | [#11792](https://github.com/w3c/csswg-drafts/issues/11792)（閉、擬似要素の暗黙のアンカー。この件とは別の話） |
| csswg-drafts | anchor pseudo-element | 133（1ページ目だけを見た） | [#12949](https://github.com/w3c/csswg-drafts/issues/12949) |
| csswg-drafts | anchor slider-thumb | 5 | [#14234](https://github.com/w3c/csswg-drafts/issues/14234) |
| csswg-drafts | anchor element-backed pseudo-element | 5 | なし |
| csswg-drafts | slider-thumb anchor | 5 | 「anchor slider-thumb」と同じ5件 |
| csswg-drafts | acceptable anchor element pseudo | 未実行 | ブラウザでのページの移動が自動判定で拒否された |
| Mozilla Bugzilla | anchor-name pseudo-element | 0 | |
| Mozilla Bugzilla | anchor-name range-thumb | 0 | |
| Mozilla Bugzilla | anchor range thumb | 2 | [1993699](https://bugzilla.mozilla.org/show_bug.cgi?id=1993699)、[2083398](https://bugzilla.mozilla.org/show_bug.cgi?id=2083398)（1993699 の重複） |
| Mozilla Bugzilla | anchor-name -moz-range-thumb | 35 | なし（`-moz-range-thumb` が検索に効かず、実質は `anchor-name` だけの検索） |
| Mozilla Bugzilla | anchor slider | 1 | なし |
| Mozilla Bugzilla | anchor pseudo-element | 12 | なし（[1925801](https://bugzilla.mozilla.org/show_bug.cgi?id=1925801) は `::before` と `::after` のアンカー） |
| Mozilla Bugzilla | anchor positioning pseudo | 5 | 1993699 |
| Mozilla Bugzilla | range thumb anchor positioning | 1 | 1993699 |
| Mozilla Bugzilla | anchor input range | 0 | |
| Mozilla Bugzilla | acceptable anchor pseudo | 0 | |

## 結論

- **Gecko: `duplicate`**。[bug 1993699](https://bugzilla.mozilla.org/show_bug.cgi?id=1993699)「Consider allowing ::-moz-range-thumb to be tree-abiding pseudo for anchor positioning」（NEW、Core / CSS Parsing and Computation）が同じ症状を扱っている。2025-10-10 に Mozilla の開発者が起票した。2026-01-16 のコメントには、アンカーとして受け付ける擬似要素の一覧に足すだけでは足りず、スライダーの値が変わったときに配置した要素を更新する仕組みが要る、とある。2026-10-22 のコメントには、スクロールの補正と同じ仕組みにつなぐのが正しいやり方だ、とある。[bug 2083398](https://bugzilla.mozilla.org/show_bug.cgi?id=2083398) は、この件の重複として閉じられている。
  - 原因の箇所: Gecko の [`IsFullyStyleableTreeAbidingOrNotPseudoElement`](https://searchfox.org/firefox-main/rev/05ea3f8e9fd32050f86babe19eddc88e77a1ca64/layout/base/AnchorPositioningUtils.cpp#161) は、アンカーとして受け付ける擬似要素を `::before`、`::after`、`::marker` に限っている。`::-moz-range-thumb` はこの一覧にないので、アンカーの候補から外れる。
- **WebKit: `not-affected`**、**Blink: `not-affected`**。`::-webkit-slider-thumb` に指定した `anchor-name` で、つまみがアンカーになる。
