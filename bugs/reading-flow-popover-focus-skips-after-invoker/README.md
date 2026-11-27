---
title: reading-flow の中の popover から Tab で出ると、開いたボタンの後ろの要素を飛ばす
slug: reading-flow-popover-focus-skips-after-invoker
created: 2026-11-27
updated: 2026-11-27
features: reading-flow, popover
status.webkit: unsupported
status.gecko: unsupported
status.blink: reported
links.webkit:
links.gecko:
links.blink: https://issues.chromium.org/issues/590893467
links.spec: https://html.spec.whatwg.org/multipage/interaction.html#flattened-tabindex-ordered-focus-navigation-scope
---

# reading-flow の中の popover から Tab で出ると、開いたボタンの後ろの要素を飛ばす

## 症状

記事の脚注を popover で開くページで見つけた。段落の中の脚注の参照（`<button popovertarget>`）が popover を開き、popover の要素は段落の直後に置いてある。記事の段組みの要素が `reading-flow: flex-visual` を持っていて、Chromium で、開いた脚注の閉じるボタンから Tab で進むと、同じ段落の続きのリンクを飛ばした。

テストケースで確かめた症状は次の2つで、どちらも popover が開いているあいだに起きる。

- popover の中の最後のフォーカスできる要素から Tab で進むと、開いたボタン（popover trigger）の次ではなく、popover の要素の DOM の位置の次へ進む。そのため、ボタンと popover のあいだにある要素（同じ段落の、ボタンより後ろのリンク）を飛ばす。
- popover の中の最初のフォーカスできる要素から Shift+Tab で戻ると、開いたボタンではなく、飛ばしたリンクへ戻る。Shift+Tab を続けても、popover の中の要素と飛ばしたリンクのあいだを回り続ける。開いたボタンと、それより前の要素には、Shift+Tab では戻れない。

起きるのは、popover が reading flow container の子の中にあるときである。popover が container の直接の子のときと、container の外にあるときは起きない。並べ替えの起きない値（`order` のない縦並びの flex の `flex-visual`、block の `source-order`）でも起きるので、並べ替えの結果として順が変わったのではない。

## 期待する挙動と根拠

HTML の規則を当てはめると、popover の中から Tab で出たときは、開いたボタンの次へ進む。CSS の `reading-flow` の仕様は、popover にも、container の孫より深い子孫の順にも触れていないので、この結論を変える規定はない。

HTML の規則は次のとおり（[HTML Standard §6.6.2](https://html.spec.whatwg.org/multipage/interaction.html#data-model)、2026-11-26 更新）。

- 表示中の popover の [popover trigger](https://html.spec.whatwg.org/multipage/popover.html#popover-trigger) は、[focus navigation scope owner](https://html.spec.whatwg.org/multipage/interaction.html#focus-navigation-scope-owner) になる。
- popover trigger を持つ表示中の popover の [associated focus navigation owner](https://html.spec.whatwg.org/multipage/interaction.html#associated-focus-navigation-owner) は、その popover trigger になる。popover の子孫も、親をたどって同じ owner に属する。
- [flattened tabindex-ordered focus navigation scope](https://html.spec.whatwg.org/multipage/interaction.html#flattened-tabindex-ordered-focus-navigation-scope) のアルゴリズムは、フォーカスできる owner の scope の中身を、その owner の直後に差し込む。popover trigger はボタンなのでフォーカスでき、popover の中身は trigger の直後に入る。
- [sequential focus navigation order](https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation-order) は、Document の flattened tabindex-ordered focus navigation scope で決まる。

この規則から、Tab の順は「開いたボタン > popover の中身 > ボタンの次の要素」になり、Shift+Tab の順はその逆になる。popover について1文で定めた規定はなく、アルゴリズムから導いた結論である。popover の節も、popover の要素を開くボタンの直後に置くよう勧めている（[§6.12.1](https://html.spec.whatwg.org/multipage/popover.html#the-popover-target-attributes)）。

[CSS Display Module Level 4 §4 Reading Order](https://drafts.csswg.org/css-display-4/#reading-flow)（Editor's Draft、2026-06-05）は、次のことを定めている。

- [reading flow container](https://drafts.csswg.org/css-display-4/#reading-flow-container) は、`reading-flow` が `normal` 以外の block、flex、grid の container である。
- 並べ替えの対象は container の子の並び（rendering-defined sibling reading flow）である。
- `flex-visual` は flex item の見た目の順に従うので、`order` がなければ DOM の順と同じになる。`source-order` は、`reading-order` の指定を除けば DOM の順に従う。
- 線形の読み上げ、フォーカスの順、スクリーンリーダーの順は一致させるべきとしている。

reading flow と focus navigation の関係を HTML に書き込む PR は、[whatwg/html#10613](https://github.com/whatwg/html/pull/10613) Add support for CSS reading-flow で、開いたまま（「do not merge yet」のラベル付き）である。Chromium の開発者は `dialog` の中の reading flow のフォーカスの件（下の「検索の記録」の [436071736](https://issues.chromium.org/issues/436071736)）で、この PR を仕様として挙げている（comment 11）。PR のプレビュー（2025-03-28 の版、[whatpr.org](https://whatpr.org/html/10613/interaction.html)）では、reading flow container と、その子（reading flow item）が focus navigation scope owner になる。一方で associated focus navigation owner の手順では、popover の手順が reading flow の手順より前にあり、reading flow の手順は親だけを見る。そのため、この PR の文でも、表示中の popover は reading flow item の scope に入らない。ただし、このプレビューの popover の手順は trigger ではなく popover 自身を返す古い形で、今の HTML Standard とは違う。この古い形のもとで popover の中身が順のどこに入るかを定める部分は、読んでいない。

関係する Issue:

- [whatwg/html#10642](https://github.com/whatwg/html/issues/10642) tabindex vs reading-flow property（開）。reading flow item を scope owner にするかどうかと、正の tabindex の扱いの議論。popover は、既にある scope owner の例として挙がるだけ。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/reading-flow-popover-focus-skips-after-invoker/repro.html

テストケースは、同じ構造を2つ並べる。テストは縦並びの flex に `reading-flow: flex-visual` を付け、参照は付けない。popover の要素は、flex の唯一の子の `div` の中の、段落の直後にある。スクリプトはフォーカスの順を記録して表示するだけで、フォーカスはブラウザの Tab の処理で動く。判定するのは次の2つである。

- 「Close」から Tab で、同じ段落の「link after the button」へ進むか。
- popover の中の「inner link」から Shift+Tab で、開いた「1」のボタンへ戻るか。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-27。

Chromium の結果は、Playwright 1.65.1 でキーを押して確かめた。テストの「Start here」にフォーカスし、Tab、Enter、Tab を4回、Shift+Tab を4回の順に押して、テストケースの表示を読んだ。3つともヘッドレスで動かした。Google Chrome と Google Chrome Canary は、Playwright の `chrome` と `chrome-canary` のチャンネルで、入っているアプリを動かした。そのあと Google Chrome 158.0.8127.88 で、テストケースの手順どおりに手で操作し、同じ結果になることを確かめた。

| ブラウザ | バージョン | 変えた設定 | 確かめた手段 | 結果 |
|---|---|---|---|---|
| Google Chrome | 158.0.8127.88 | なし | Playwright（`chrome` チャンネル）、手での操作 | 失敗。Tab で start > button1 > inner > close > **button2** > next、続く Shift+Tab で button2 > close > inner > **after**。参照は合格 |
| Google Chrome Canary | 160.0.8186.0 | なし | Playwright（`chrome-canary` チャンネル） | 失敗。Chrome 158 と同じ |
| Chromium（Playwright に同梱） | 159.0.8154.6 | なし | Playwright | 失敗。Chrome 158 と同じ |
| Safari | 27.2 (22625.2.8.11.9) | なし | Safari の MCP サーバ | `reading-flow` に未対応（`CSS.supports('reading-flow', 'flex-visual')` が false） |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | Safari Technology Preview の MCP サーバ | `reading-flow` に未対応 |
| WebKit（Playwright に同梱） | 27.2 | なし | Playwright（Option+Tab） | `reading-flow` に未対応。テストと参照が同じ順で、どちらも合格 |
| Firefox | 161.0 | なし | Firefox DevTools MCP | `reading-flow` に未対応 |
| Firefox（Playwright に同梱） | 159.0 | なし | Playwright | `reading-flow` に未対応。テストと参照が同じ順で、どちらも合格 |
| Firefox Nightly | 163.0a1 | — | — | 確かめていない |

Firefox と WebKit は `reading-flow` を無視するので、テストが参照と同じ構造になる。そのため、この2つの合格は、`reading-flow` があるときの正しい挙動の例にはならない。

### 条件を変えた比較（Chromium 159）

Playwright で、テストケースを変えたページを作って確かめた（この比較はテストケースに入れていない）。表の「深い子孫」は、テストケースと同じく、container の子の `div` の中に段落と popover の要素を置いた形を指す。

| container | `reading-flow` | popover の位置 | Close から Tab |
|---|---|---|---|
| 縦並びの flex | `flex-visual` | 深い子孫 | 失敗（button2） |
| 縦並びの flex | `flex-flow` | 深い子孫 | 失敗 |
| 横並びで折り返す flex | `flex-visual` | 深い子孫 | 失敗 |
| 縦並びの flex | `source-order` | 深い子孫 | 失敗 |
| block | `source-order` | 深い子孫 | 失敗 |
| grid | `grid-rows`、`grid-columns`、`grid-order` | 深い子孫 | 3つとも失敗 |
| 縦並びの flex、grid | `normal` | 深い子孫 | 合格（after） |
| 縦並びの flex | `flex-visual` | 段落と popover の要素が container の直接の子 | 合格 |
| grid | `grid-rows` | 段落と popover の要素が container の直接の子 | 合格 |
| 縦並びの flex | `flex-visual` | ボタンと popover の要素が同じ段落の中（popover は `span`） | 失敗 |
| 縦並びの flex | `flex-visual` | ボタンは container の中、popover の要素は container の外 | 合格 |
| 縦並びの flex | `flex-visual` | ボタンは container の外、popover の要素は container の子の `div` の中 | 失敗 |
| 縦並びの flex | `flex-visual` | 深い子孫で、container と popover の要素のあいだに `reading-flow` のない flex がもう1つある | 失敗 |

popover の開き方も変えた。`command="show-popover"` と `commandfor` で開いても、`showPopover({source: button})` で開いても、`popovertarget` と同じく失敗した。`showPopover()` を `source` なしで呼ぶと popover trigger がないので、`reading-flow` の有無にかかわらず DOM の順（button1 > after > inner > close）になる。これは仕様どおりの挙動である。

## web-platform-tests

確認日: 2026-11-27。wpt.fyi の 2026-11-26 の実行（安定版: Chrome 158.0.8127.88、Firefox 161.0、Safari 27.2。先行版: Chrome 160.0.8184.0、Firefox 163.0a1、Safari Technology Preview 257）。

popover の要素が reading flow item の中にある形のテストはない。reading flow と popover を組み合わせたテストは次の1件だけで、popover の要素を reading flow container の外に置いている（container の直接の子のボタンが開く）。この形は、上の比較の「popover の要素は container の外」に当たり、Chromium は合格する。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [shadow-dom/focus-navigation/reading-flow/grid-order-with-popover.html](https://wpt.fyi/results/shadow-dom/focus-navigation/reading-flow/grid-order-with-popover.html) | 2/2 | 0/2 | 0/2 |

popover のフォーカスのテスト（`html/semantics/popovers/popover-focus*.html`、24件）は、`reading-flow` を使っていない。

## 検索の記録

検索日: 2026-11-27

Chromium Issue Tracker の、題を限らない検索は、本文に語を含む「[WPT] New failures introduced ... by import」の件が結果の大半を占めた。そのため、`title:` を付けた検索の結果を主に読んだ。題を限らない検索は、最初のページの50件だけを見た。

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| Chromium | `title:reading-flow` | 15 | [436071736](https://issues.chromium.org/issues/436071736)、[371024057](https://issues.chromium.org/issues/371024057)（下に記す） |
| Chromium | `title:popover title:focus` | 24 | [335909581](https://issues.chromium.org/issues/335909581)（下に記す） |
| Chromium | `reading-flow popover` | 117 | なし（最初の50件は WPT の取り込みの件） |
| Chromium | `reading flow popover` | 202 | なし（同上） |
| Chromium | `reading-flow focus` | 222 | なし（同上） |
| Chromium | `reading-flow invoker` | 60 | なし（同上） |
| Chromium | `reading-flow tab order` | 125 | なし（題に reading-flow を含む件は `title:reading-flow` と同じ） |
| Chromium | `reading-flow focus navigation scope` | 175 | なし（最初の50件は WPT の取り込みの件） |
| Chromium | `popover focus navigation scope` | 281 | なし（同上） |
| Chromium | `popover invoker focus order` | 137 | なし（同上） |
| Chromium | `reading-order popover` | 57 | なし（同上） |
| w3c/csswg-drafts | `reading-flow popover` | 6 | なし |
| w3c/csswg-drafts | `reading-flow focus navigation` | 15 | なし（reading-flow の件はあるが、popover と深い子孫を扱う件はない） |
| w3c/csswg-drafts | `reading-flow descendants` | 22 | なし |
| w3c/csswg-drafts | `reading-flow focus scope` | 29 | なし |
| w3c/csswg-drafts | `reading-order popover` | 13 | なし |
| whatwg/html | `reading-flow` | 60 | [#10642](https://github.com/whatwg/html/issues/10642) |
| whatwg/html | `reading flow popover` | 9 | [#10642](https://github.com/whatwg/html/issues/10642) |
| whatwg/html | `popover focus navigation scope owner` | 9 | なし（題に reading-flow を含む件はない。題と一覧だけを見た） |
| whatwg/html（PR） | `is:pr reading-flow` | 24 | [#10613](https://github.com/whatwg/html/pull/10613) |
| web-platform-tests | `reading-flow`、`css-display/reading-flow`、`popover-focus` | 68、8、24 | 上の「web-platform-tests」に記す |

GitHub の検索は、`gh search issues` が使えなかったので、GitHub の検索のページで行った。一覧の表示が途中で切れた検索があり、その残りは見ていない。

読んだ件の内容:

- [Chromium 335909581](https://issues.chromium.org/issues/335909581)（Fixed、Blink>HTML>Focus）: popover そのものが reading flow container のとき、scope owner を popover と trigger のどちらにするかの件。popover の scope は、owner が trigger なので、出るときは trigger の次へ進む、と本文で説明している。2025-06-19 に「popover trigger を scope owner にする」実装で直したとして閉じた。今回の件は、popover が reading flow container ではなく reading flow item の中にあるときなので、条件が違う。
- [Chromium 436071736](https://issues.chromium.org/issues/436071736)（New、Blink>HTML>Focus）: `dialog` の中の reading flow で、最初にフォーカスする要素が見た目の順の先頭にならない件。仕様の問題として、whatwg/html#10613 にコメントが付いている。popover の Tab の順は扱っていない。
- [Chromium 371024057](https://issues.chromium.org/issues/371024057)（Fixed、Blink>HTML>Focus）: reading flow に加わらない要素（`display: contents`、絶対配置、固定配置）の順の件。表示中の popover は UA のスタイルで固定配置になるので、中身を読んだ。本文が挙げる決議（[w3c/csswg-drafts#9230](https://github.com/w3c/csswg-drafts/issues/9230)）が扱うのは `display: contents` の要素の順だけで、reading flow item の中にある固定配置の子孫をどこに置くかは書いていない。

Gecko と WebKit は `reading-flow` に未対応なので、トラッカーは検索していない。

## 結論

- Blink: `reported`。Chrome 158、Chromium 159、Canary 160 で再現する。popover が reading flow item の中にあると、popover の中から Tab で出たときに popover の要素の DOM の位置の次へ進み、開いたボタンと popover のあいだの要素を飛ばす。Shift+Tab では popover の中と飛ばした要素のあいだを回り続け、開いたボタンへ戻れない。HTML Standard の規則では、popover の中身は開いたボタンの直後に入る。未マージの whatwg/html#10613 の文でも、表示中の popover は reading flow item の scope に入らない。既存の報告は見つからなかったので、報告文を下書きした（[report.blink.en.md](report.blink.en.md)）。
  2026-11-27 に [Chromium Issue 590893467](https://issues.chromium.org/issues/590893467) として報告した。新規作成のウィザードは題を100字まで、本文の欄を1つ5000字までに限るので、題を短くし、本文を手順の欄と問題の説明の欄に分けて送った（[report.blink.en.md](report.blink.en.md) の冒頭のコメント）。Component には Blink>HTML を選んだが、送った件の Component は Blink になった。
- Gecko: `unsupported`。Firefox 161.0 と、Playwright に同梱の Firefox 159.0 は `reading-flow` に未対応。
- WebKit: `unsupported`。Safari 27.2、Safari Technology Preview 27.0、Playwright に同梱の WebKit 27.2 は `reading-flow` に未対応。
