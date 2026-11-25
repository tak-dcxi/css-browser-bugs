---
title: 段組みの2段目にある絶対配置の要素が、段に分ける前の位置に置かれて下にずれる
slug: multicol-abspos-static-position-unfragmented
created: 2026-11-25
updated: 2026-11-25
features: CSS Multi-column Layout, CSS Positioned Layout, position absolute, static position
status.webkit: duplicate
status.gecko: not-affected
status.blink: not-affected
links.webkit: https://bugs.webkit.org/show_bug.cgi?id=137506
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-position-3/#staticpos-rect
---

# 段組みの2段目にある絶対配置の要素が、段に分ける前の位置に置かれて下にずれる

## 症状

調査を始めた時点の説明は「Safari は、段組みの外を基準にする絶対配置の要素の位置を、段に分ける前の 1 列の座標で求める。2 段目にある要素が前の段の高さぶん下にずれ、ページの下に余白を作る」。

確かめて分かった条件は次のとおり。

- 段組みコンテナの 2 段目にある `position: absolute` の要素で、`top` などが `auto`（静的位置に置かれる）、包含ブロックが段組みコンテナの外にあるとき、Safari では要素が 1 段目の高さぶん下に置かれる。
- 下にずれた要素は、スクロールできる範囲を広げる。
- `position: fixed` で `top` などが `auto` のときも同じだけずれる。
- 包含ブロックを段の中の要素にする（要素を含むリンクに `position: relative` を付ける）と、ずれない。
- `inset: 0` のように位置を書いた `position: fixed` の要素は、静的位置を使わないので、ずれない（テストケースには入れていない。同じ構成で別に確かめた）。
- 切り抜きと -1px のマージンを付けた 1px の `absolute` の箱は、リンクに `position: relative` を付けた場合にも、上端が 199px と測れた。理由は分かっていない（テストケースには入れていない）。

## 期待する挙動と根拠

この挙動は仕様が決めている。[CSS Positioned Layout Module Level 3 §3.5.3 Calculating the Static Position and the “Static-Position Rectangle”](https://drafts.csswg.org/css-position-3/#staticpos-rect)（Editor’s Draft、2026-11-25 に読んだ）は、ある軸の `inset` が両方とも `auto` のとき、要素を静的位置に置くと定めている。静的位置は、その要素が `position: static` だったら加わっていた整形文脈から決まり、実際の包含ブロックには左右されない。2 段目にある要素が `position: static` なら 2 段目に置かれるので、絶対配置にしても 2 段目のその場所に置かれる。Firefox と Chrome はそうなる。

断片化（段への分割）と絶対配置の要素の関係を定める CSS Fragmentation の節は読んでいない。csswg-drafts の Issue の検索は、実行する権限がなく、していない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/multicol-abspos-static-position-unfragmented/repro.html

高さ 200px のフレームに、同じ高さの 2 段の段組みを置く。2 段目のリンク「Two」の中に、位置を書かない 10px の箱（赤）がある。箱の上端とリンクの上端の差と、フレームのスクロールできる高さが段組みの高さを超えた分を測る。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-25。

ここに書いたのは、ブラウザを自動操作するツールでテストケースを開き、ページが出す判定（計測した値と PASS / FAIL）を読んだ結果。見た目を目で確かめる判定はしていない。Chrome は、起動していた版が 157.0.8103.80 だった（入っている版は 158.0.8127.88 で、再起動していない）。Chrome Canary 160、Firefox Nightly 163、Edge、iOS の Safari、Safari 26.x では確かめていない。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 失敗。包含ブロックが外の `absolute` は 200px 下（スクロールの高さ +10px）。切り抜きと負のマージンを付けた `absolute` は 199px 下（+9px）。`fixed` は 200px 下（+0px）。リンクに `position: relative` を付けた行は合格（0px、+0px） |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 失敗。Safari 27.2 と同じ |
| Firefox | 160.0.1 | なし | 合格。4 行すべて（差 0px か -1px、+0px） |
| Google Chrome | 157.0.8103.80 | なし | 合格。4 行すべて |

## web-platform-tests

確認日: 2026-11-25。wpt.fyi の安定版の run（Chrome 158.0.8127.88、Firefox 160.0.1、Safari 27.2。2026-11-24）。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [css/css-multicol/abspos-autopos-contained-by-viewport-000.html](https://wpt.fyi/results/css/css-multicol/abspos-autopos-contained-by-viewport-000.html) | PASS | PASS | FAIL |
| [css/css-multicol/abspos-autopos-contained-by-viewport-001.html](https://wpt.fyi/results/css/css-multicol/abspos-autopos-contained-by-viewport-001.html) | PASS | PASS | FAIL |

名前（位置を自動にした絶対配置の要素を、ビューポートが包含する）は今回の条件に当たるが、テストの中身は読んでいない。先行版の run（Safari 257 preview、2026-11-23）でも、検索係の報告では同じ傾向だった。`css/css-break/out-of-flow-in-multicolumn-*.html`（134 件）にも Safari だけが落ちるテストが 20 件以上あるが、どれが今回の条件に当たるかは確かめていない。

## 検索の記録

検索日: 2026-11-25

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| WebKit Bugzilla | `multicol absolute position` | 42 | なし（題からは、古い修正済みの件と別の症状。開いていない） |
| WebKit Bugzilla | `multi-column absolutely positioned static position` | 1 | なし |
| WebKit Bugzilla | `columns out-of-flow containing block outside` | 0 | |
| WebKit Bugzilla | `multicol positioned overflow scroll height` | 12 | なし |
| WebKit Bugzilla | `column absolute static position second column` | 19 | [137506](https://bugs.webkit.org/show_bug.cgi?id=137506)（下に記す） |
| web-platform-tests | `css-multicol/abspos` | 10 | 上の 2 件 |
| web-platform-tests | `css-break/out-of-flow-in-multicolumn` | 134 | 確かめていない |
| web-platform-tests | `css-multicol/multicol-oof` | 2 | なし（3 つのエンジンとも PASS） |
| w3c/csswg-drafts | `multicol absolute position static position`、`out-of-flow multicol containing block`、`fragmentation absolutely positioned static position` | 未実行 | 検索を実行する権限がなかった |

読んだ件の内容:

- [WebKit 137506](https://bugs.webkit.org/show_bug.cgi?id=137506)（NEW、2014-10-07 報告）: position: absolute default location miscalculated in multi column layout。段組みの 2 段目にある、位置を書かない `position: absolute` の要素が、1 段のレイアウトだったときの場所（1 段目の下）に置かれるという報告。2023-07-02 のコメントで Safari Technology Preview 173 でも再現し、Chrome と Firefox では起きないと確かめられている。2024-02-08 に Radar に取り込まれた。今回の症状と同じ。

Gecko と Blink は期待どおりに動いたので、トラッカーは検索していない。

## 結論

- WebKit: `duplicate`。[WebKit Bug 137506](https://bugs.webkit.org/show_bug.cgi?id=137506) が同じ症状を扱っていて、開いたまま。Safari 27.2 と Safari Technology Preview 27.0 で、いまも再現する。避けるには、包含ブロックを段の中に置く（要素を含む箱に `position: relative`）か、静的位置を使わない（`inset` を書く）。
- Gecko: `not-affected`。Firefox 160.0.1 は 4 行すべて合格。
- Blink: `not-affected`。Chrome 157 は 4 行すべて合格。
