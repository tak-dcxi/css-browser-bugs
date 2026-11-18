---
title: アンカーで配置した ::after のトランジションが、元の要素に :has() の規則が当たると始まらない
slug: anchor-pseudo-transition-has-originating
created: 2026-11-18
updated: 2026-11-18
features: CSS Anchor Positioning, anchor(), CSS Transitions, :has(), ::after
status.webkit: reported
status.gecko: unsupported
status.blink: not-affected
links.webkit: https://bugs.webkit.org/show_bug.cgi?id=332060
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-anchor-position-1/#anchor-pos
---

# アンカーで配置した ::after のトランジションが、元の要素に :has() の規則が当たると始まらない

## 症状

調査を始めた時点の説明は「Safari で、Anchor Positioning で背景をホバーしたリンクに追従させるアニメーションが動かない」。説明に含まれていた条件は次のとおり。

- `anchor()` で配置した `::after` の元の要素（リンクを並べた `ul`）に、`:has(a:hover)` の規則が当たっていると、`::after` の位置がトランジションせずに一度で移る。
- 規則の中身は関係しない。`color` を変える規則でも、値の変わらないカスタムプロパティの宣言だけでも起きる。
- 次の書き方では動く。
  - `:has()` を元の要素の親に書く
  - `:has()` を使わず、元の要素に `:hover` を書く
  - `::after` ではなく、本物の子要素をアンカーで配置する
- Chromium は、どの形でも動く。

## 期待する挙動と根拠

この挙動は仕様が決めている。

[CSS Anchor Positioning Module Level 1 §3.2 Anchor-relative Insets: the anchor() function](https://drafts.csswg.org/css-anchor-position-1/#anchor-pos)（drafts.csswg.org で配信されている版は W3C Working Draft、2026-09-06）は、解決できる `anchor()` が、計算値の時点で（スタイルとレイアウトを交互に行って）`<length>` に解決されると定めている。同じ節の注記は、その結果として、アンカーの箱が動いたときや、アンカーの要素が加わったり外れたりしたとき、アンカーの `anchor-name` が変わったときにも、`anchor()` を使うプロパティのトランジションとアニメーションが「期待どおりに」動くと書いている。

そのため、`anchor-name` を別のリンクに移すと `::after` の `left` の計算値が変わり、[CSS Transitions Level 1 §3 Starting of transitions](https://drafts.csswg.org/css-transitions-1/#starting) に従ってトランジションが始まる。元の要素に `:has()` の規則が当たるかどうかは、`::after` の `left` の変化前と変化後の値に関係しないので、トランジションが始まるかどうかにも関係しない。

関係する Issue:

- [w3c/csswg-drafts#14686](https://github.com/w3c/csswg-drafts/issues/14686) Allow feature detection of anchoring taking animations and transitions into account（開）。`anchor()` の値がトランジションするかを検出する手段を求める件。期待する挙動は仕様で明確だが、実現の細部は #11562 で未解決だと書いている。Gecko の [Bug 1924226](https://bugzilla.mozilla.org/show_bug.cgi?id=1924226) を挙げている。
- [w3c/csswg-drafts#11562](https://github.com/w3c/csswg-drafts/issues/11562) How Does Container Query Interleaving Interact with Anchor Positioning Interleaving?（開）。コンテナクエリとアンカー位置の交互の処理の関係を決める件。`:has()` と擬似要素は扱っていない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/anchor-pseudo-transition-has-originating/repro.html

## 確認した環境

OS: macOS 26.5.1。確認日: 2026-11-18。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 26.5 (21624.2.5.11.4) | なし | 失敗。グループ2だけ、`left` が 0px から 192px に一度で移り、トランジションが始まらない（`running transitions of left: 0`）。グループ1、3、4、5は合格。手動の確認では H2 だけが一度で移り、H1、H3、H4、H5 は滑る |
| Safari Technology Preview | 27.0 (21627.1.6.3) | なし | 失敗。Safari 26.5 と同じ |
| Google Chrome | 157.0.8103.80 | なし | 合格。グループ1〜5のすべてでトランジションが始まる（`running transitions of left: 1`） |
| Google Chrome Canary | 160.0.8168.0 | なし | 合格 |
| Firefox | 160.0.1 | なし | `anchor()` の値がトランジションしない（この件とは別の問題）。グループ1〜4は `:has()` の有無によらず 0px から 192px に一度で移る（`running transitions of left: 0`）。アンカーを使わないグループ5は合格 |
| Firefox Nightly | 162.0a1 | なし | Firefox 160.0.1 と同じ |

### 再検証（macOS 27.2.1）

OS: macOS 27.2.1。確認日: 2026-11-18。Firefox と Chrome はバージョンが変わっていないので、確かめていない。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 失敗。グループ2だけ、`left` が 0px から 192px に一度で移り、トランジションが始まらない（`running transitions of left: 0`）。グループ1、3、4、5は合格。手動の確認では、H2 はどの動かし方でも一度で移る。H3 と H4 は、One から Two へ動かしたときは一度で移り、ホバーしたまま Two から One か Three へ動かしたときは滑る。H1 と H5 は滑る |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 失敗。Safari 27.2 と同じ |

H3 と H4 で One から Two へ動かしたときの結果は、前回の確認では記録していない。Safari も Safari Technology Preview も前回とは違うビルドなので、これが前回からの変化なのか、前回はこの動かし方を確かめていなかっただけなのかは分からない。

#### Safari の MCP サーバでの確認

Safari 27.2 に付属する MCP サーバ（`safaridriver --mcp`）で、公開URLのテストケースを開いて確かめた。グループ1〜5は、ページの結果の文が手動の確認と同じだった（グループ2だけ `left 0px -> 192px, running transitions of left: 0`）。

H1〜H5 は、座標を指定したホバーでポインターを動かし、ページに入れたスクリプトで `transitionrun` イベントと、移動の2フレーム後の `left` を記録した。MCP のホバーを要素の指定で行うと `:hover` が付かなかったので、座標の指定に切り替えた。

| 動かし方 | H1 | H2 | H3 | H4 | H5 |
|---|---|---|---|---|---|
| リストの中で、隣のリンクへ移る（One→Two→Three→Two→One） | 滑る | 一度で移る | 滑る | 滑る | 滑る |
| リストの外から、リンクの上へ直接入る（外→Two、外→Three） | 滑る | 確かめていない | 一度で移る | 一度で移る | 滑る |
| リンクの上から、リストの外へ出る | 滑る | 確かめていない | 一度で移る | 一度で移る | 滑る |

「一度で移る」の行では `transitionrun` が発生せず、移動の2フレーム後の `left` が移動先の値（96px か 192px）になっていた。「滑る」の行では `transitionrun` が発生し、2フレーム後の `left` は移動前と移動先の間の値だった。

外から入るときと外へ出るときには、アンカーの要素が変わるのと同時に、H3 では `ul:hover` が、H4 では親の `:has(a:hover)` が、当たる状態から当たらない状態へ（またはその逆へ）変わる。リストの中で移るときには、この2つは当たったままで変わらない。H2 の `ul:has(a:hover)` も当たったままだが、リンクを移るたびに一度で移る。このことから、`::after` の元の要素かその親で、セレクタの照合の結果が変わるか `:has()` の照合がやり直されると、同じ更新で起きたアンカーの変化によるトランジションが始まらない可能性がある。ただし、エンジンの中でこの順に処理されていることは確かめていない。本物の子要素を配置する H5 は、どの動かし方でも滑る。

Safari Technology Preview の MCP サーバでは、操作するウィンドウの `document.visibilityState` が `hidden` のままで、描画のフレームが進まなかった。テストケースのスクリプトがフレームを待つところで止まるので、結果を取れていない。

## web-platform-tests

確認日: 2026-11-18。wpt.fyi の master の実行（Chrome 160.0.8166.0、Firefox 162.0a1、Safari Technology Preview 256。いずれも 2026-11-16）。

擬似要素をアンカーで配置したトランジションや、元の要素に `:has()` が当たる場合を確かめるテストはない。探した場所は `css/css-anchor-position/` の `anchor-transition-*.html` の8件で、どれも本物の要素だけを使っている。

| テスト | Chrome | Firefox | Safari TP |
|---|---|---|---|
| [anchor-transition-001.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-001.html) | 2/2 | 0/2 | 2/2 |
| [anchor-transition-002.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-002.html) | 1/1 | 0/1 | 1/1 |
| [anchor-transition-003.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-003.html) | 1/1 | 0/1 | 1/1 |
| [anchor-transition-004.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-004.html) | 1/1 | 1/1 | 1/1 |
| [anchor-transition-default.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-default.html) | 1/1 | 0/1 | 1/1 |
| [anchor-transition-eval.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-eval.html) | 2/2 | 0/2 | 2/2 |
| [anchor-transition-focus.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-focus.html) | 1/1 | 1/1 | 1/1 |
| [anchor-transition-name.html](https://wpt.fyi/results/css/css-anchor-position/anchor-transition-name.html) | 1/1 | 0/1 | 1/1 |

- `anchor-transition-name.html` は、`anchor-name` を別の要素に移したときのトランジションを確かめる。今回のグループ1に当たり、Safari TP は合格する。
- `anchor-transition-focus.html` は、`body:has(:focus) { --unused: foo; }` という、値を使わない `:has()` の規則があるときのトランジションを確かめる。ただし、`:has()` は祖先の `body` に当たり、トランジションする要素は本物の要素で、値は `anchor()` を使わない。今回の条件（`anchor()` で配置した `::after` の元の要素に `:has()` が当たる）には当たらない。

## 検索の記録

検索日: 2026-11-18

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| w3c/csswg-drafts | `anchor transition` | 128 | [#14686](https://github.com/w3c/csswg-drafts/issues/14686)、[#13048](https://github.com/w3c/csswg-drafts/issues/13048)（位置の候補を試す処理とトランジションの関係。今回の件とは別） |
| w3c/csswg-drafts | `anchor :has` | 440 | なし（`has` が一般の語として一致し、絞り込めない） |
| w3c/csswg-drafts | `"anchor()" transition pseudo-element` | 50 | なし |
| WebKit Bugzilla | `anchor transition` | 50+ | なし（HTML のアンカー要素の件が多く、絞り込めない） |
| WebKit Bugzilla | `anchor positioning transition` | 24 | [314641](https://bugs.webkit.org/show_bug.cgi?id=314641)、[298680](https://bugs.webkit.org/show_bug.cgi?id=298680)、[300845](https://bugs.webkit.org/show_bug.cgi?id=300845)、[301070](https://bugs.webkit.org/show_bug.cgi?id=301070)、[301461](https://bugs.webkit.org/show_bug.cgi?id=301461)（下に記す） |
| WebKit Bugzilla | `anchor positioning animation` | 27 | [328203](https://bugs.webkit.org/show_bug.cgi?id=328203)、[292972](https://bugs.webkit.org/show_bug.cgi?id=292972)（下に記す） |
| WebKit Bugzilla | `anchor-name transition` | 2 | なし |
| WebKit Bugzilla | `position-anchor transition` | 1 | なし |
| WebKit Bugzilla | `anchor positioning :has` | 0 | |
| WebKit Bugzilla | `anchor positioning pseudo` | 11 | [292552](https://bugs.webkit.org/show_bug.cgi?id=292552)（擬似要素のアンカー配置が効かない件。修正済みの 293625 の重複） |
| WebKit Bugzilla | `anchor :has` | 0 | （`:` で始まる語は quicksearch で欄の指定として読まれる可能性があるので、下の `:` のない語でも検索した） |
| WebKit Bugzilla | `anchor pseudo-element transition` | 3 | なし（[289743](https://bugs.webkit.org/show_bug.cgi?id=289743) は WPT の失敗の一覧） |
| WebKit Bugzilla | `anchor animation` | 50+ | なし（HTML のアンカー要素の件が多く、絞り込めない） |
| WebKit Bugzilla | `has() transition` | 0 | |
| WebKit Bugzilla | `has() pseudo-element` | 3 | なし（[267613](https://bugs.webkit.org/show_bug.cgi?id=267613) は shadow DOM の情報の漏れの件） |
| WebKit Bugzilla | `anchor after` | 50+ | なし（絞り込めない） |
| WebKit Bugzilla | `anchor positioning has` | 50+ | 上に挙げた件のほかはなし |
| WebKit Bugzilla | `has pseudo-element transition` | 25 | なし |
| WebKit Bugzilla | `has invalidation pseudo-element` | 9 | [330904](https://bugs.webkit.org/show_bug.cgi?id=330904)（下に記す）。[234556](https://bugs.webkit.org/show_bug.cgi?id=234556) は `:has()` の中の一部の擬似クラスの無効化の件で、クラスでも起きる今回とは別 |
| WebKit Bugzilla | `has invalidation transition` | 50+ | なし |
| WebKit Bugzilla | `has selector transition` | 50+ | なし |
| WebKit Bugzilla | `anchor() transition` | 3 | [281852](https://bugs.webkit.org/show_bug.cgi?id=281852)（`anchor()` のアニメーションとトランジションの実装。修正済み） |
| WebKit Bugzilla | `anchor position ::after` | 0 | |
| WebKit Bugzilla | `:has() transition` | 0 | |
| WebKit Bugzilla | `:has() pseudo-element transition` | 0 | |
| WebKit Bugzilla | `has() animation pseudo` | 0 | |
| WebKit Bugzilla | `:has() ::after` | 0 | |
| WebKit Bugzilla | `transition pseudo-element has` | 25 | なし（擬似要素のトランジションの古い件。`:has()` は扱っていない） |
| Mozilla Bugzilla | `anchor() transition` | 0 | |
| Mozilla Bugzilla | `anchor() animation` | 3 | [1924226](https://bugzilla.mozilla.org/show_bug.cgi?id=1924226)、[2018410](https://bugzilla.mozilla.org/show_bug.cgi?id=2018410) |
| Mozilla Bugzilla | `anchor positioning transition` | 1 | なし（[2006371](https://bugzilla.mozilla.org/show_bug.cgi?id=2006371) は `@position-try` とトランジションの優先の件） |
| Mozilla Bugzilla | `anchor-name transition` | 0 | |
| Mozilla Bugzilla | `anchor :has transition` | 0 | |

読んだ件の内容:

- [WebKit 314641](https://bugs.webkit.org/show_bug.cgi?id=314641)（NEW、2026-05-12）: Transition does not work properly for anchor positioning。`fieldset::before` を、`label:has(:checked)` で `anchor-name` を付けたラベルに `anchor()` と `anchor-size()` で合わせ、`inset` と `inline-size` をトランジションさせる例で、3回に2回しか動かないという報告。報告者の実際のページでは常に一度で移るとある。`:has()` はアンカーの要素（`label`）に当たり、擬似要素の元の要素（`fieldset`）には当たっていない。原因の分析はない。今回の件と同じ原因の可能性はあるが、条件が違うので重複とは判断しない。
- [WebKit 328203](https://bugs.webkit.org/show_bug.cgi?id=328203)（NEW、修正の PR あり）: スタイルを解決するたびに、アンカーで配置した要素の解決がやり直される件。解決の最初の段では `anchor()` が解決されず、`inset-inline-start` が `auto` になってから、レイアウトを挟んで解決し直すと書いている。トランジションには触れていない。今回の件の原因に関係する可能性があるが、確かめていない。
- [WebKit 330904](https://bugs.webkit.org/show_bug.cgi?id=330904)（NEW、PR あり）: アンカーの箱がなくなったときや、包含ブロックが変わったときに、アンカーで配置した要素が無効化されない件。328203 の修正の前提になる。トランジションには触れていない。
- [WebKit 300845](https://bugs.webkit.org/show_bug.cgi?id=300845)（301056 の重複）: `display` を `none` にするトランジションの間に `left: anchor(...)` が解決できず `left: auto` になる件。説明に、アンカーの位置が未解決のときはアニメーションの適用を飛ばすコード（StyleTreeResolver.cpp）が挙がっている。今回の件と同じ処理が関わる可能性があるが、確かめていない。
- [WebKit 298680](https://bugs.webkit.org/show_bug.cgi?id=298680)（修正済み）、[301070](https://bugs.webkit.org/show_bug.cgi?id=301070)（301510 の重複）、[301461](https://bugs.webkit.org/show_bug.cgi?id=301461)（NEW）、[292972](https://bugs.webkit.org/show_bug.cgi?id=292972)（NEW）: どれもアンカーで配置したポップオーバーの `display` や `opacity` のトランジション、または再描画の件。`anchor()` の値のトランジションや `:has()` は扱っていない。
- [WebKit 281852](https://bugs.webkit.org/show_bug.cgi?id=281852)（修正済み、285508@main）: `anchor()` のアニメーションとトランジションを有効にした件。
- [Mozilla 1924226](https://bugzilla.mozilla.org/show_bug.cgi?id=1924226)（NEW）: Handle animation of `anchor()` and `anchor-size()` / interleaved styling of anchor-positioned elements。Gecko は `anchor()` をレイアウトの時点で解決するので、スタイルの側では値が変わらず、トランジションが始まらない。仕様の詳細が [w3c/csswg-drafts#11562](https://github.com/w3c/csswg-drafts/issues/11562) で決まるのを待っている。
- [Mozilla 2018410](https://bugzilla.mozilla.org/show_bug.cgi?id=2018410)（NEW）: `anchor()` が交互の処理の欠如で計算値の時点に解決されない件。1924226 と同じ原因。

Blink は期待どおりに動いたので、トラッカーは検索していない。

## 結論

- WebKit: `reported`。2026-11-18 に [WebKit Bug 332060](https://bugs.webkit.org/show_bug.cgi?id=332060) として報告した。macOS 27.2.1 の Safari 27.2 と Safari Technology Preview 27.0 (22627.1.6.3) でも、グループ2と H2 は同じく失敗する（2026-11-18 に再検証）。Safari 26.5 と Safari Technology Preview 27.0 で、`anchor()` で配置した `::after` の元の要素に `:has()` の規則が当たっていると、アンカーが変わっても `left` のトランジションが始まらない。`:has()` の中身は `:hover`（H2）でもクラス（グループ2）でもよく、宣言の値が変わらなくても起きる。`:has()` を親に書く（グループ3、H4）、本物の子要素を配置する（グループ4、H5）、元の要素に `:hover` を書く（H3）、アンカーを使わない（グループ5）のいずれかで起きなくなる。仕様は §3.2 で、`anchor()` が計算値の時点で解決されるのでトランジションが始まると決めている。同じ条件の既存の報告は見つからなかった。近い件の [314641](https://bugs.webkit.org/show_bug.cgi?id=314641) は、報告文で関連として示す。
- Gecko: `unsupported`。Firefox 160.0.1 と Nightly 162.0a1 は、`:has()` の有無によらず `anchor()` の値がトランジションしない（グループ1も失敗する）。`anchor()` の値のトランジションが未実装で、[Bug 1924226](https://bugzilla.mozilla.org/show_bug.cgi?id=1924226) が扱っている。今回の条件に固有の問題があるかは、1924226 が直るまで確かめられない。
- Blink: `not-affected`。Chrome 157 と Canary 160 は、すべてのグループでトランジションが始まる。
