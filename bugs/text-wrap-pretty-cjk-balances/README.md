---
title: "和文の text-wrap: pretty が、balance のように各行を短く揃えて折り返す"
slug: text-wrap-pretty-cjk-balances
created: 2026-11-18
updated: 2026-11-21
features: text-wrap-style, text-wrap
status.webkit: reported
status.gecko: unsupported
status.blink: not-affected
links.webkit: https://bugs.webkit.org/show_bug.cgi?id=332074
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-text-4/#text-wrap-style
---

# 和文の text-wrap: pretty が、balance のように各行を短く揃えて折り返す

## 症状

調査を始めた時点の説明は「Safari で、和文の `text-wrap: pretty` の折り返し位置がおかしい。`text-wrap: balance` のような挙動をする」。以前に Safari で見つけた問題で、今のバージョンでも再現するかを確かめる。

`text-wrap: pretty` は、`text-wrap-mode` を初期値の `wrap` に、`text-wrap-style` を `pretty` にする一括指定なので、この件では `text-wrap-style: pretty` を調べる。

## 期待する挙動と根拠

この挙動は、仕様が大枠だけを決め、細部を UA に任せている。

[CSS Text Module Level 4 §5.4 Selecting How to Wrap: the text-wrap-style property](https://drafts.csswg.org/css-text-4/#text-wrap-style)（Editor's Draft、2026-11-17）は、`pretty` について次のことを定めている。

- UA は、速さよりもよい組版を優先すべきで（should）、改行の位置を決めるときに複数の行を考慮することが期待される。
- 短すぎる最終行を避けてよい（may）。あわせて、行の長さのばらつきを減らす、川（行をまたいで縦につながる語間）を避ける、などの改善を行うべきとしている。何を改善するかは UA に任せている。
- 対象にする行の数は制限していない。

`balance` は、各行の残りの幅のばらつきを減らすように改行し、行の数をなるべく変えない（5行以下なら変えてはならない）と定めている。`auto` について「`balance` のようにすべての行を均してはならない」という制約はあるが、`pretty` にこの制約はない。

そのため、`pretty` が `balance` と同じ改行を選ぶこと自体は、仕様に反するとは言えない。一方、和文はほとんどの文字の間で改行できるので、`auto` でも最終行以外は箱の幅いっぱいまで並ぶ。行の長さのばらつきは最初からほぼない。[日本語組版処理の要件（JLREQ）](https://www.w3.org/TR/jlreq/)は、和文の行を行長いっぱいに組むことを基本にしている。この状態から各行を短くして行を増やすことは、仕様が `pretty` に求める「よりよい組版」に当たらない、と考えられる。

関係する Issue:

- [w3c/csswg-drafts#12716](https://github.com/w3c/csswg-drafts/issues/12716) Add text-wrap-last for orphan avoidance; remove orphan control from text-wrap-style（開）。短い最終行の制御を `text-wrap-style` から分ける提案。
- [w3c/csswg-drafts#10785](https://github.com/w3c/csswg-drafts/issues/10785) Performance risks of text-wrap:pretty（開）。`pretty` の処理の重さの件。和文の改行には触れていない。
- [w3c/csswg-drafts#3473](https://github.com/w3c/csswg-drafts/issues/3473) Preventing too-short final lines of blocks (Last Line Minimum Length)。`pretty` の由来になった議論。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/text-wrap-pretty-cjk-balances/repro.html

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-18。

テストケースは、箱の下に行ごとの文字数を出す。字幅はブラウザで違い、16em に Safari では17文字、Chrome と Firefox では16文字並ぶ。そのため、ケース1の「`auto` で最終行も埋まる」状態は Safari でだけ成り立つ。判定は、`pretty` の箱が `auto` と `balance` のどちらと同じ改行になるかで行った。

| ブラウザ | バージョン | 変えた設定 | 確かめた手段 | 結果 |
|---|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | Safari の MCP サーバ | 失敗。ケース1: `pretty` が 15〜16文字の9行（`auto` と `balance` は17文字の8行）。ケース2: `pretty` と `balance` が 27, 27, 27, 27, 28（`auto` は 30, 30, 30, 30, 16） |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | Safari Technology Preview の MCP サーバ | 失敗。Safari 27.2 と同じ文字数 |
| Google Chrome | 157.0.8103.80 | なし | Claude in Chrome（`http://127.0.0.1:8765/` で配信） | 合格。ケース1: 3つとも、16文字の8行と8文字の1行。ケース2: `pretty` と `auto` が 28, 28, 27, 28, 25、`balance` が 27, 27, 27, 27, 28 |
| Google Chrome Canary | 160.0.8168.0 | なし | 手動 | 合格。Chrome 157 と同じ |
| Firefox | 160.0.1 | なし | Firefox DevTools MCP | `text-wrap-style: pretty` に未対応（`CSS.supports` が false で、計算値は `auto`）。3つの箱が同じ改行 |
| Firefox Nightly | 162.0a1 | なし | 手動 | Firefox 160.0.1 と同じ |

### 和文と英文で幅を変えた比較（Safari 27.2）

テストケースの2つの幅だけでは、症状が和文に固有かどうかが分からない。そこで Safari 27.2 で、幅を 10em から 30em まで 1em ずつ変え、同じ和文の段落と英文の段落の行ごとの文字数を比べた（この比較はテストケースに入れていない）。

- 和文: `pretty` は `auto` より、最終行を除く各行が短い。最終行は、ケース2（28em）のように `auto` より長くなることがある。10em では `auto` の14行が17行に増え、`balance` の14行より多い。26em から 30em では `balance` とまったく同じ改行になる。
- 英文: 14em から 30em の多くの幅で、`pretty` が `balance` と同じ改行になる。10em では `auto` の12行が15行に増える。
- `lang="ja"` を外しても、和文の結果は変わらない。

この結果から、原因は和文の改行の処理ではなく、WebKit の `pretty` の行の割り付けそのものにあると考えられる。英文は `auto` でも行末がそろわないので、各行を短くそろえた結果は目立ちにくい。和文は `auto` で行末がそろうので、各行が短くなると、右側の空きと行の増加がそのまま見える。

## web-platform-tests

確認日: 2026-11-18。wpt.fyi の master の実行（Chrome 160.0.8166.0、Firefox 162.0a1、Safari Technology Preview 256。いずれも 2026-11-16）。

`pretty` の改行の位置を確かめるテストはない。wpt.fyi の API で `pretty` と `text-wrap-style` を検索して見つかったのは、構文解析とクラッシュのテストだけだった。

| テスト | Chrome | Firefox | Safari TP |
|---|---|---|---|
| [css/css-text/parsing/text-wrap-pretty.html](https://wpt.fyi/results/css/css-text/parsing/text-wrap-pretty.html) | 14/14 | 2/14 | 14/14 |
| [css/css-text/parsing/text-wrap-style-valid.html](https://wpt.fyi/results/css/css-text/parsing/text-wrap-style-valid.html) | 8/8 | 8/8 | 8/8 |
| [css/css-text/parsing/text-wrap-style-computed.html](https://wpt.fyi/results/css/css-text/parsing/text-wrap-style-computed.html) | 3/3 | 3/3 | 3/3 |
| [css/css-text/text-wrap-style/crashtests/text-wrap-style-pretty-block-in-inline-crash.html](https://wpt.fyi/results/css/css-text/text-wrap-style/crashtests/text-wrap-style-pretty-block-in-inline-crash.html) | — | — | — |

仕様の `text-wrap-style` の節も、`balance` 以外の値の改行のテストがないことを挙げている。`pretty` の改行の位置は UA に任されているので、決まった改行を求めるテストは書きにくい。

## 検索の記録

検索日: 2026-11-18

WebKit Bugzilla の quicksearch は、件数が上限の50件に達すると番号の小さい古い件から返す。そのため「50+」の検索では最近の件が結果に入っていない可能性があり、語を足した検索でも探した。

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| w3c/csswg-drafts | `"text-wrap" pretty` | 42 | [#12716](https://github.com/w3c/csswg-drafts/issues/12716)、[#10785](https://github.com/w3c/csswg-drafts/issues/10785) |
| w3c/csswg-drafts | `pretty CJK` | 44 | なし |
| w3c/csswg-drafts | `"text-wrap-style" pretty Japanese` | 1 | [#3473](https://github.com/w3c/csswg-drafts/issues/3473) |
| WebKit Bugzilla | `text-wrap pretty` | 25 | [288650](https://bugs.webkit.org/show_bug.cgi?id=288650)、[326721](https://bugs.webkit.org/show_bug.cgi?id=326721)、[287489](https://bugs.webkit.org/show_bug.cgi?id=287489)、[288433](https://bugs.webkit.org/show_bug.cgi?id=288433)、[288236](https://bugs.webkit.org/show_bug.cgi?id=288236)、[279789](https://bugs.webkit.org/show_bug.cgi?id=279789)（下に記す） |
| WebKit Bugzilla | `text-wrap-style pretty` | 14 | 上の件と同じ |
| WebKit Bugzilla | `pretty CJK` | 28 | なし |
| WebKit Bugzilla | `pretty Japanese` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `pretty balance` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `pretty ideal line width` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `pretty ideographic` | 8 | なし |
| WebKit Bugzilla | `pretty Chinese` | 32 | なし |
| WebKit Bugzilla | `Knuth-Plass` | 2 | [287489](https://bugs.webkit.org/show_bug.cgi?id=287489) |
| WebKit Bugzilla | `InlineContentConstrainer` | 8 | なし（`pretty` と `balance` の実装の整理と修正の件） |
| Mozilla Bugzilla | `text-wrap pretty` | 5 | [1960910](https://bugzilla.mozilla.org/show_bug.cgi?id=1960910) |
| Mozilla Bugzilla | `text-wrap-style pretty` | 0 | |

読んだ件の内容:

- [WebKit 288650](https://bugs.webkit.org/show_bug.cgi?id=288650)（NEW、2025-02-26）: [text-wrap-style:pretty] Bias ideal line width to be closer to max bounds。WebKit の技術者が作った件で、本文はない。下書きの PR [WebKit/WebKit#41458](https://github.com/WebKit/WebKit/pull/41458) は、伸ばせる量（stretchability）と伸ばす量の上限の倍率を下げて、`pretty` の理想の行幅を箱の幅に近づける変更で、取り込まれていない。今回の症状の原因と見られる。ただし、和文と行の増加には触れていないので、重複とは判断しない。
- [WebKit 326721](https://bugs.webkit.org/show_bug.cgi?id=326721)（NEW、2026-10-07）: `text-indent` があると `pretty` の改行が悪くなる件。条件が違う。
- [WebKit 287489](https://bugs.webkit.org/show_bug.cgi?id=287489)（修正済み）は行のそろわなさの評価を Knuth-Plass の式に合わせた件、[288433](https://bugs.webkit.org/show_bug.cgi?id=288433)（修正済み）は伸び縮みの上限を上げた件、[288236](https://bugs.webkit.org/show_bug.cgi?id=288236)（修正済み）は短い最終行を避ける処理を改善した件、[279789](https://bugs.webkit.org/show_bug.cgi?id=279789)（修正済み）は `pretty` を実装した件。どれも本文がほぼなく、和文は扱っていない。
- [Mozilla 1960910](https://bugzilla.mozilla.org/show_bug.cgi?id=1960910)（NEW）: Implement CSS `text-wrap: pretty`。Gecko で `pretty` を実装する件。

Blink は期待どおりに動いたので、トラッカーは検索していない。

## 結論

- WebKit: `reported`。2026-11-18 に [WebKit Bug 332074](https://bugs.webkit.org/show_bug.cgi?id=332074) として報告した。Safari 27.2 と Safari Technology Preview 27.0 で、今も再現する。和文の `text-wrap-style: pretty` が、`auto` で行末がそろう段落でも各行を短くして行を増やし（ケース1）、最終行が半分ほどの段落では `balance` と同じ改行になる（ケース2）。仕様は `pretty` の細部を UA に任せていて、行の長さのばらつきを減らすことも認めているので、`balance` に近い改行そのものは仕様に反しない。しかし和文では、`auto` の時点で行の長さがそろっている。そこから各行を短くして行を増やすことは、仕様が `pretty` に求める「よりよい組版」に当たらないと判断し、報告文を下書きした（[report.webkit.en.md](report.webkit.en.md)）。原因と見られる [288650](https://bugs.webkit.org/show_bug.cgi?id=288650) は、報告文で関連として示す。
  同じ日に、報告文の2点を訂正するコメントを投稿した（[comment 2](https://bugs.webkit.org/show_bug.cgi?id=332074#c2)）。1点目では、幅を変えた比較の「各行が短い」を「最終行を除く各行が短い」に直した。ケース2では、最終行が16文字から28文字に伸びるためである。2点目では、仕様の言い換えを、`pretty` は組版を「よくするべき」（should）という仕様の書き方に合わせた。
  2026-11-19 に、WebKit の技術者が原因を2つに分けて説明した（[comment 4](https://bugs.webkit.org/show_bug.cgi?id=332074#c4)）。前日には Radar（rdar://problem/193148797）にも取り込まれている。1つ目の原因は、`pretty` の Knuth-Plass の評価が、箱の幅より小さい目標の行幅を使い、目標より短い行にも長い行にも罰を与えることである。和文はほとんどの文字の間で改行できるので、どの行もこの小さい目標にほぼ届き、全行が短くなって行が増える（ケース1）。直し方として、目標を箱の幅にし、短い行だけに罰を与えることを挙げている（[WebKit 332333](https://bugs.webkit.org/show_bug.cgi?id=332333)）。2つ目の原因は、最終行のそろわなさをほかの行と同じように評価することである。そのため最終行が上の行から多くの内容を取り込み、`balance` と同じ改行になりうる（ケース2）。直し方として、最終行には孤立した短い行（orphan）のときだけ罰を与えることを挙げている（[WebKit 332332](https://bugs.webkit.org/show_bug.cgi?id=332332)）。2件とも NEW で、同じ技術者が担当している。332074 は、2件が取り込まれるまで開いたままにすると書いている。
- Gecko: `unsupported`。Firefox 160.0.1 と Nightly 162.0a1 は `text-wrap-style: pretty` に未対応。実装は [Bug 1960910](https://bugzilla.mozilla.org/show_bug.cgi?id=1960910) が扱っている。
- Blink: `not-affected`。Chrome 157 と Canary 160 は、どちらのケースでも `pretty` が `auto` と同じ改行になる。
