---
title: "@scope の中で ::details-content に指定したスタイルが描画されない"
slug: scope-details-content-transition
created: 2026-11-24
updated: 2026-11-24
features: "@scope, ::details-content"
status.webkit: not-affected
status.gecko: duplicate
status.blink: not-affected
links.webkit:
links.gecko: https://bugzilla.mozilla.org/show_bug.cgi?id=2063991
links.blink:
links.spec: https://drafts.csswg.org/css-cascade-6/#scope-effects
---

# @scope の中で ::details-content に指定したスタイルが描画されない

## 症状

調査を始めた時点の説明は「`@scope` の中で `::details-content` の transition が Safari と Firefox で動作しない」。元のコードは受け取っていないので、`@scope` の中での `::details-content` の書き方を変えたテストを並べて切り分けた。slug はこの説明から付けた。

Firefox では、症状は transition に限らない。`@scope` の中の規則で `::details-content` に指定した宣言は、`getComputedStyle(details, '::details-content')` が返す値には反映されるのに、描画には反映されない。最初のテストケースでは、`background-color` を黒から lime へ transition させた。T1〜T5 は計算値が終わりの値の lime になり、描画には背景が付かなかった。transition を外して `background: lime` だけを指定しても、同じく描画されない。transition が動かないように見えたのは、`@scope` の中の `transition` の宣言も描画に使われないためと考えられる。

同じ構造を `@scope` を使わずに書くと（`.t5 details::details-content`）描画される。`@scope (:root)` や、`<scope-start>` のない `@scope` でも描画されない。

Firefox 160.0.1 で、ほかの擬似要素も `@scope (.x) { :scope::<擬似要素> {…} }` の形で確かめた。`::placeholder` は `::details-content` と同じく、計算値には反映されるのに描画されない。`::before`、`::marker`、`::file-selector-button` は描画される。`@layer` と CSS Nesting（`.x { &::details-content {…} }`）の中の `::details-content` も描画される。この確かめはテストケースには入れておらず、Firefox DevTools の MCP サーバでページを書き換えて行った。

Safari の症状は、このテストケースでは再現しない。

## 期待する挙動と根拠

この挙動は仕様が決めている。

[CSS Cascading and Inheritance Level 6 §3.5.1 Effects of @scope](https://drafts.csswg.org/css-cascade-6/#scope-effects) は、`@scope` の中の規則のセレクタを範囲（scope）に限って照合すると定めている。T1 と T2 では範囲の起点が `details` 自身で、T3 と T4 では `details` が範囲の中にある。どの場合も、規則は `details` の `::details-content` に当たる。`getComputedStyle` の値が lime になることは、Firefox も規則が当たると判定していることを示している。

[CSS Pseudo-Elements Level 4 の `::details-content` の節](https://drafts.csswg.org/css-pseudo-4/#details-content-pseudo)は、`::details-content` を `details` の中身を包む擬似要素として定めている。規則がどのカスケードの仕組み（`@scope`、`@layer`、入れ子）から来たかで、描画に使う値を変えるという記述はない。計算値と描画が食い違うことは、どちらの仕様からも説明できない。

今回は仕様の本文を取得できなかった（取得のコマンドが権限で拒否された）。節のリンクは、このリポジトリの既存の件で確かめたもので、本文の記述は今回は読み直していない。csswg-drafts の Issue の検索も、同じ理由で行えていない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/scope-details-content-transition/repro.html

T0 は `@scope` の外、T1〜T4 は `@scope` の中の書き方を変えたもの、T5 は T3 と T4 と同じ構造を `@scope` を使わずに書いた対照。各テストの下に、`getComputedStyle(details, '::details-content').backgroundColor` の値を表示する。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-24。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 合格 |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 合格 |
| Firefox | 160.0.1 | なし | 不合格。T0 と T5 は lime、T1〜T4 は背景なし。計算値はすべて `rgb(0, 255, 0)`（Firefox DevTools の MCP サーバのスクリーンショットでも確かめた） |
| Firefox Nightly | 163.0a1 | なし | 不合格。T1〜T4 は背景なし |
| Google Chrome | 158.0.8127.88 | なし | 合格 |
| Google Chrome Canary | 160.0.8180.0 | なし | 合格 |

最初のテストケース（`background-color` の transition を途中の時点で止めたもの）でも、結果は同じだった。Safari と Chrome は T0〜T5 が途中の色になり、Firefox と Firefox Nightly は T0 以外に背景が付かなかった。

## web-platform-tests

確認日: 2026-11-24。wpt.fyi の run は Chrome 158.0.8127.36、Firefox 160.0.1、Safari 27.2 (22625.2.8.11.9)。いずれも 2026-11-23。

`@scope` の中の規則を `::details-content` に当てるテストはない。`details-content`、`scope`、`scope-pseudo`、`css-transitions` で wpt.fyi のテストのパスを検索し、関係しそうな次のテストを見た。

| テスト | Chrome | Firefox | Safari |
|---|---|---|---|
| [css/css-cascade/scope-pseudo-element.html](https://wpt.fyi/results/css/css-cascade/scope-pseudo-element.html) | PASS | PASS | PASS |
| [html/rendering/the-details-element/details-content-pseudo-attr.html](https://wpt.fyi/results/html/rendering/the-details-element/details-content-pseudo-attr.html) | FAIL | PASS | FAIL |
| [css/css-transitions/pseudo-elements-001.html](https://wpt.fyi/results/css/css-transitions/pseudo-elements-001.html) | 4/4 | 4/4 | 4/4 |

`scope-pseudo-element.html` の中身は読んでいない。Firefox が通るので、`@scope` の中の `::before` のような擬似要素を確かめるテストだと見られ、今回の手元の確かめ（`::before` は描画される）と矛盾しない。`details-content-pseudo-attr.html` は `::details-content` の属性の扱いのテストで、`@scope` は使っていない。

## 検索の記録

検索日: 2026-11-24

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| w3c/csswg-drafts | （未実行。`gh search issues` と組み込みブラウザでの検索が権限で拒否された） | | |
| Mozilla Bugzilla | `details-content scope` | 0 | |
| Mozilla Bugzilla | `details-content` | 25 | なし（実装、WPT の取り込み、DevTools の件） |
| Mozilla Bugzilla | `@scope pseudo-element` | 0 | |
| Mozilla Bugzilla | `scope pseudo-element` | 3 | [2063991](https://bugzilla.mozilla.org/show_bug.cgi?id=2063991) |
| Mozilla Bugzilla | `@scope details` | 0 | |
| Mozilla Bugzilla | `details-content not applied` | 0 | |
| Mozilla Bugzilla | `details-content shadow` | 1 | なし（2025361、クラッシュの件） |
| Mozilla Bugzilla | `scope slot` | 49 | なし（JavaScript エンジンの件が大半） |
| Mozilla Bugzilla | `@scope part` | 2 | なし |
| Mozilla Bugzilla | `@scope placeholder` | 0 | |
| Mozilla Bugzilla | `@scope` | 12 | なし（CA の件が大半） |
| Mozilla Bugzilla | `scope details` | 3 | なし |

Mozilla Bugzilla の quicksearch は語の一致で探すので、`@scope` の `@` を含む語でも件が返った。どの検索も上限の50件には達していない。

読んだ件の内容:

- [Mozilla 2063991](https://bugzilla.mozilla.org/show_bug.cgi?id=2063991)（NEW、Core / CSS Parsing and Computation、2026-08-17）: Element-backed pseudo-elements fail to match within @scope。報告の本文が、`::details-content` もこの問題の対象になると書いている。Mozilla の開発者が、要素で裏付けられた擬似要素（element-backed pseudo-element）だけの問題で、原因は別の shadow tree にあるためだろうとコメントし、`::before`、`::after`、`::file-selector-button` は動くと書いている。今回の確かめ（`::details-content` と `::placeholder` は描画されず、`::before`、`::marker`、`::file-selector-button` は描画される）と一致する。`getComputedStyle` の値と描画が食い違うことは、件には書かれていない。

WebKit と Blink は期待どおりに動いたので、それぞれのトラッカーは検索していない。

## 結論

- WebKit: `not-affected`。Safari 27.2 と Safari Technology Preview 27.0 で、T0〜T5 がすべて合格する。説明にあった Safari の症状は再現しない。元のコードで、閉じるときに `content-visibility` を transition させていたなら、`@scope` と関係のない既存の件 [details-content-visibility-transition-hides-early](../details-content-visibility-transition-hides-early/)（WebKit 332674）に当たる可能性があるが、確かめていない。
- Blink: `not-affected`。Chrome 158 と Canary 160 で、T0〜T5 がすべて合格する。
- Gecko: `duplicate`。Firefox 160.0.1 と Nightly 163.0a1 で、`@scope` の中の規則が `::details-content` に当たり、`getComputedStyle` の値には反映されるのに、描画には反映されない。transition が動かないように見えるのも、この症状の一部と考えられる。既存の [Mozilla 2063991](https://bugzilla.mozilla.org/show_bug.cgi?id=2063991)（NEW）が、`::details-content` を含む要素で裏付けられた擬似要素が `@scope` の中で当たらないことを報告しているので、新しくは報告しない。`getComputedStyle` の値が描画と食い違うことと、`::placeholder` でも起きることは件に書かれていなかったので、2026-11-24 に [comment 3](https://bugzilla.mozilla.org/show_bug.cgi?id=2063991#c3) として足した。コメントには、試したセレクタの形、`@layer` と CSS Nesting では描画されること、Safari 27.2 と Chrome 158 では描画されることも書き、テストケースの公開 URL を添えた。コメントした時点では PR がマージされておらず、公開 URL は 404 だった。
