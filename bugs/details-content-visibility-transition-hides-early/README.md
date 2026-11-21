---
title: content-visibility を hidden へ transition させると、始めから中身が描画されない（::details-content の閉じるアニメーション）
slug: details-content-visibility-transition-hides-early
created: 2026-11-21
updated: 2026-11-21
features: content-visibility, ::details-content, transition-behavior
status.webkit: reported
status.gecko: not-affected
status.blink: not-affected
links.webkit: https://bugs.webkit.org/show_bug.cgi?id=332674
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-contain-2/#content-visibility-animation
---

# content-visibility を hidden へ transition させると、始めから中身が描画されない（::details-content の閉じるアニメーション）

## 症状

`details::details-content` に `transition: content-visibility <時間> allow-discrete` を指定して `details` を閉じると、中身の描画が閉じ始めとほぼ同時に消える。transition 自体は始まっており、`block-size` をあわせて transition させると高さは変わっていく。Safari 27.2 で、`::details-content` の `block-size` を `2.6rem` から `0` へ 10s で transition させると（`content-visibility` も 10s）、2s の時点で高さは約 30px まで縮んでいる途中だった。その時点の `content-visibility` の計算値は `visible` で、中身は描画されていなかった。Safari は `interpolate-size` に未対応なので、`block-size: auto` から `0` への transition は高さが変わらない。

`details` に固有の症状ではない。普通の `div` で `content-visibility` を `visible` から `hidden` へ transition させても、同じく始めから中身が描画されない。Safari 27.2 と Safari Technology Preview 27.0 で確かめると、transition のあいだの `content-visibility` の計算値は仕様どおり `visible` である。それでも中身は描画されず、中身の要素の `checkVisibility()` は false を返す。計算値ではなく、中身を飛ばす（skip する）かどうかの判定が、transition の始めから終わりの値の `hidden` で行われているように見える。

要素の大きさの扱いは、条件で分かれる。`::details-content` の大きさは保たれ、中身があった場所が空白になる。普通の `div` は、子がブロックなら transition の始めから高さが 0 に縮み、子がインラインだけなら高さが保たれる。高さが縮むことは、既存の [WebKit 292713](https://bugs.webkit.org/show_bug.cgi?id=292713) が報告している。中身が描画されないことは、高さが保たれる場合（`::details-content`、インラインの子だけの `div`、高さを固定した `div`）にも起きるので、縮むこととは別の症状である。テストケースの `div` のケースは、高さを固定して、描画されるかどうかだけを見られるようにした。

## 期待する挙動と根拠

閉じた `details` の `::details-content` には、UA が `content-visibility: hidden` を当てる。[HTML の details と summary の描画](https://html.spec.whatwg.org/multipage/rendering.html#the-details-and-summary-elements)は、`::details-content` に当たる2つ目の slot の style 属性を、`open` 属性がないときは `display: block; content-visibility: hidden;` にすると決めている（css-pseudo-4 の [`::details-content` の節](https://drafts.csswg.org/css-pseudo-4/#details-content-pseudo)の注記も同じ）。

`content-visibility` のアニメーション型は離散である。ただし [css-contain-2 §4.1 Animating and Interpolating content-visibility](https://drafts.csswg.org/css-contain-2/#content-visibility-animation) は、`hidden` とほかの値のあいだの補間では、p が 0 と 1 のあいだにあるかぎり `hidden` でない値を使うと決めている（`visibility` の補間と同じ扱い）。`transition-behavior: allow-discrete` で `visible` から `hidden` へ transition させると、transition のあいだは `visible` のままで、終わった時点で `hidden` になる。[`hidden` の定義](https://drafts.csswg.org/css-contain-2/#valdef-content-visibility-hidden)のとおり中身を飛ばすのは値が `hidden` のときなので、transition のあいだは中身が描画されているべきである。css-pseudo-4 の `::details-content` の節の例も、`::details-content` に `transition: content-visibility 300ms allow-discrete, opacity 300ms` を指定している（仕様は、開くときの例として紹介している）。

仕様はこの挙動を決めており、UA に任せていない。§4.1 は、CSSWG が [#8627](https://github.com/w3c/csswg-drafts/issues/8627) で決めた内容である。この Issue は、`details` の閉じた中身のように `content-visibility: hidden` になる要素で、アニメーションが終わるまで中身を見せ続けられるようにすることを目的に挙げ、補間の途中の値を `visible` にすると決めた。csswg-drafts には、`content-visibility` のアニメーション型を問う [#7255](https://github.com/w3c/csswg-drafts/issues/7255) と [#9213](https://github.com/w3c/csswg-drafts/issues/9213) が開いたまま残っている。どちらも、§4.1 が書かれる前の「アニメーションできない」という定義についての件で（#9213 は、§4.1 が当時は css-contain-3 にあったと投稿者が気付いて終わっている）、今の §4.1 の内容を争う議論はない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/details-content-visibility-transition-hides-early/repro.html

テストケースには3つのケースがある。上の2つは、読み込み直後にスクリプトで `details` を閉じる（または高さを固定した `div` に `content-visibility: hidden` を当てる）。transition は 1000s なので、見ているあいだずっと transition の途中にある。下の1つは、summary をクリックして閉じると 3s の transition が走る。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-21。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 失敗。`details` のケースも高さを固定した `div` のケースも、緑の箱の場所が空白になる。クリックで閉じると、箱がすぐ消える |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 失敗。Safari 27.2 と同じ |
| Firefox | 160.0.1 | なし | 合格 |
| Firefox Nightly | 162.0a1 | なし | 合格 |
| Google Chrome | 157.0.8103.80 | なし | 合格 |
| Google Chrome Canary | 160.0.8172.0 | なし | 合格 |

## web-platform-tests

確認日: 2026-11-21。wpt.fyi の stable の実行（Chrome 158.0.8127.36、Firefox 160.0.1、Safari 27.2）。

`content-visibility` の補間の計算値を確かめるテストはあり、Safari も通る。transition の途中で中身が描画されることを確かめるテスト（reftest など）は見つからなかった。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [css/css-contain/content-visibility/content-visibility-interpolation.html](https://wpt.fyi/results/css/css-contain/content-visibility/content-visibility-interpolation.html) | 130/130 | 130/130 | 130/130 |
| [css/css-contain/content-visibility/crashtests/content-visibility-transition-finished-001.html](https://wpt.fyi/results/css/css-contain/content-visibility/crashtests/content-visibility-transition-finished-001.html) | PASS | PASS | PASS |

探した場所: `content-visibility`、`details-content`、`css-transitions`、`css-animations`、`css-pseudo`、`the-details-element` で wpt.fyi のテストのパスを検索し、transition、animation、interpolation、details を名前に含むものを見た。

## 検索の記録

検索日: 2026-11-21

csswg-drafts は GitHub の Issue の検索（閉じた件を含む、1ページ目）で探した。

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| w3c/csswg-drafts | `content-visibility transition` | 74 | [#9213](https://github.com/w3c/csswg-drafts/issues/9213)、[#7255](https://github.com/w3c/csswg-drafts/issues/7255)、[#8627](https://github.com/w3c/csswg-drafts/issues/8627) |
| w3c/csswg-drafts | `content-visibility animation` | 103 | なし |
| w3c/csswg-drafts | `content-visibility interpolation` | 17 | [#9213](https://github.com/w3c/csswg-drafts/issues/9213)、[#8627](https://github.com/w3c/csswg-drafts/issues/8627) |
| w3c/csswg-drafts | `details-content` | 1584 | なし（[#12845](https://github.com/w3c/csswg-drafts/issues/12845) は閉じた details の padding と border の件、[#13096](https://github.com/w3c/csswg-drafts/issues/13096) は expanded の状態の件） |
| w3c/csswg-drafts | `details-content content-visibility` | 183 | なし |
| w3c/csswg-drafts | `allow-discrete content-visibility` | 18 | [#7255](https://github.com/w3c/csswg-drafts/issues/7255) |
| WebKit Bugzilla | `content-visibility transition` | 12 | [292713](https://bugs.webkit.org/show_bug.cgi?id=292713)、[305389](https://bugs.webkit.org/show_bug.cgi?id=305389)、[290915](https://bugs.webkit.org/show_bug.cgi?id=290915) |
| WebKit Bugzilla | `content-visibility allow-discrete` | 3 | [290915](https://bugs.webkit.org/show_bug.cgi?id=290915) |
| WebKit Bugzilla | `content-visibility animation` | 17 | [266712](https://bugs.webkit.org/show_bug.cgi?id=266712)、[268366](https://bugs.webkit.org/show_bug.cgi?id=268366)、[305389](https://bugs.webkit.org/show_bug.cgi?id=305389) |
| WebKit Bugzilla | `content-visibility hidden transition` | 8 | [292713](https://bugs.webkit.org/show_bug.cgi?id=292713)、[305389](https://bugs.webkit.org/show_bug.cgi?id=305389) |
| WebKit Bugzilla | `content-visibility interpolation` | 1 | なし（[270439](https://bugs.webkit.org/show_bug.cgi?id=270439) は実装の整理で WONTFIX） |
| WebKit Bugzilla | `details-content transition` | 3 | [290915](https://bugs.webkit.org/show_bug.cgi?id=290915)、[295713](https://bugs.webkit.org/show_bug.cgi?id=295713) |
| WebKit Bugzilla | `details-content animation` | 0 | |
| WebKit Bugzilla | `details animation content disappears` | 12 | なし |
| WebKit Bugzilla | `details close animation` | 50+ | なし（古い件だけが返った） |

読んだ件の内容:

- [WebKit 292713](https://bugs.webkit.org/show_bug.cgi?id=292713)（NEW、2025-05-08）: Transitioning content-visibility collapses the size of the element eagerly。`content-visibility: hidden` へ transition させると、中身は transition のあいだ見えているのに、要素の大きさが transition の始めから縮む、という件。この件のテストケース（jsbin。組み込みブラウザでは Cloudflare の確認で止まったが、Safari では開けた）を、transition を 1000s に延ばして Safari 27.2 で動かした。ブロックの子を持つ `div` は高さが 0 に縮み、インラインの子だけの `div` は高さが保たれた。どちらの `div` も、件の説明と違って中身は描画されなかった。292713 は大きさが縮むことだけを扱い、中身は見えたままだと書いている。中身が描画されないことは、大きさが保たれる場合にも起きる別の症状なので、重複とは判断しない。終わりの値の `hidden` を transition の始めから使っている点は共通しており、原因が同じ可能性はある。
- [WebKit 305389](https://bugs.webkit.org/show_bug.cgi?id=305389)（NEW）: `content-visibility: auto` で画面外の要素の中にある transition が pending のまま止まる件。飛ばされた中身の中の transition の件で、条件が違う。
- [WebKit 290915](https://bugs.webkit.org/show_bug.cgi?id=290915)（DUPLICATE of [280637](https://bugs.webkit.org/show_bug.cgi?id=280637)）: `details:open::details-content` で開くアニメーションが動かない件。原因は `:open` が未実装だったことで、今回とは別。
- [WebKit 266712](https://bugs.webkit.org/show_bug.cgi?id=266712)（修正済み）は `content-visibility` をアニメーションできるようにした件、[268366](https://bugs.webkit.org/show_bug.cgi?id=268366)（修正済み）は `visibility` と `content-visibility` の補間の進み具合を正規化しないようにした件。どちらも計算値の補間の実装で、描画には触れていない。
- [WebKit 295713](https://bugs.webkit.org/show_bug.cgi?id=295713)（NEW）: `overflow: hidden` の `::details-content` を VoiceOver が読み飛ばす件。条件が違う。

Gecko と Blink は期待どおりに動いたので、トラッカーは検索していない。

## 結論

- WebKit: `reported`。2026-11-21 に [WebKit Bug 332674](https://bugs.webkit.org/show_bug.cgi?id=332674) として報告した（Component は Animations、See Also は 292713）。報告の時点でテストケースが Pages に出ていなかったので、公開 URL は URL 欄にも本文にも入れていない。Safari 27.2 と Safari Technology Preview 27.0 で、`content-visibility` を `visible` から `hidden` へ transition させると、transition の始めから中身が描画されない。`::details-content` で `details` を閉じるときも、高さを固定した普通の `div` でも同じ。transition のあいだの計算値は `visible` なので、計算値の補間（WPT の `content-visibility-interpolation.html` は通る）ではなく、中身を飛ばすかどうかの判定が終わりの値で行われていると見られる。css-contain-2 §4.1 は transition のあいだの値を `visible` と決めているので、仕様に反する。近い既存の件は [292713](https://bugs.webkit.org/show_bug.cgi?id=292713)（ブロックの子を持つ要素の大きさが先に縮む）だが、中身が描画されないことは扱っていないので、新しい件として報告し（下書きは [report.webkit.en.md](report.webkit.en.md)）、292713 を関連として示した。
- Gecko: `not-affected`。Firefox 160.0.1 と Nightly 162.0a1 は、transition のあいだ中身を描画する。
- Blink: `not-affected`。Chrome 157 と Canary 160 は、transition のあいだ中身を描画する。
