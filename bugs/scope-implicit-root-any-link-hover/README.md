---
title: style 要素の @scope で、暗黙の範囲の起点の a に :any-link:hover が当たらない
slug: scope-implicit-root-any-link-hover
created: 2026-11-18
updated: 2026-11-18
features: @scope, :scope, CSS Nesting, :any-link, :hover
status.webkit: cannot-reproduce
status.gecko: not-affected
status.blink: not-affected
links.webkit:
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-cascade-6/#scope-limits
---

# style 要素の @scope で、暗黙の範囲の起点の a に :any-link:hover が当たらない

## 症状

調査を始めた時点の説明は「Safari で、次のように `style` 要素と `@scope` で定義したときに、`a:any-link:hover` の定義が動かない」。以前に Safari で見つけた問題で、今のバージョンでも再現するかを確かめる。

```html
<a href="#">
  <style>
    @scope {
      :scope {
        &:any-link:hover {
          background-color: red;
        }
      }
  </style>
</a>
```

説明のコードでは `@scope` の `{` が閉じていない。スタイルシートの終わりで閉じていないブロックは、構文解析で閉じたものとして扱われるので、規則は有効になる。テストケースでは、説明のとおり閉じていない形（T1）と、閉じた形（T2）の両方を並べた。

## 期待する挙動と根拠

この挙動は仕様が決めている。

[CSS Cascading and Inheritance Level 6 §3.5.4 Identifying Scoping Roots and Limits](https://drafts.csswg.org/css-cascade-6/#scope-limits)（Editor's Draft、2026-04-28）は、`<scope-start>` のない `@scope` の範囲の起点（scoping root）を、その規則があるスタイルシートの所有者のノードの親要素と定めている。`style` 要素が `a` の中にあるので、範囲の起点は `a` になる。

[§3.5.1 Effects of @scope](https://drafts.csswg.org/css-cascade-6/#scope-effects) は、`@scope` の中の `:scope` が範囲の起点に一致すると定めている。[CSS Nesting Module §4 Nesting Selector: the & selector](https://drafts.csswg.org/css-nesting-1/#nest-selector)（Editor's Draft、2026-10-08）は、入れ子の規則の `&` が親の規則に一致する要素を表すと定めている。したがって `:scope { &:any-link:hover {…} }` は `a` 自身に `:any-link:hover` を付けたものと同じ要素に一致し、`href` のある `a` にポインターを重ねると背景が変わる。`:scope` と擬似クラスを組み合わせることを制限する記述はない。

関係する Issue:

- [w3c/csswg-drafts#13517](https://github.com/w3c/csswg-drafts/issues/13517) Conflicting definitions of nested/scoped style rules and the nesting selector（開）。`@scope` の直下の規則の `&` を、css-cascade-6 は `:where(:scope)` とし、css-nesting-1 は最も近い祖先のスタイル規則から定めるという食い違いの件。この件のコードでは `&` が `:scope {…}` の中にあり、どちらの定義でも範囲の起点の `a` を表すので、期待する挙動は変わらない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/scope-implicit-root-any-link-hover/repro.html

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-18。

テストケースは、`style` 要素を `a` の最初の子に置く（説明のコードと同じ順）。T1 が説明のコードで、T2〜T6 は1か所ずつ変えた形、R は `@scope` を使わない参照。

| ブラウザ | バージョン | 変えた設定 | 確かめた手段 | 結果 |
|---|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | Safari の MCP サーバ（座標を指定したホバーとスクリーンショット） | 合格。T1〜T4、T6、R がホバーで緑になり、T5 は常に青い枠 |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | Safari Technology Preview の MCP サーバ（座標を指定したホバー） | 合格。T1〜T4、T6、R がホバーで `:hover` に一致し、背景の計算値が緑になる。T5 は `outline-style: solid`。ウィンドウが `visibilityState: hidden` のままで描画されず、スクリーンショットは白紙だったので、見た目は確かめていない |
| Google Chrome | 157.0.8103.80 | なし | Claude in Chrome（`http://127.0.0.1:8765/` で配信、座標を指定したホバーとスクリーンショット） | 合格 |
| Google Chrome Canary | 160.0.8168.0 | なし | 手動 | 合格 |
| Firefox | 160.0.1 | なし | Firefox DevTools MCP（要素を指定したホバーとスクリーンショット） | 合格 |
| Firefox Nightly | 162.0a1 | なし | 手動 | 合格 |

## web-platform-tests

確認日: 2026-11-18。wpt.fyi の master の実行（Chrome 160.0.8166.0、Firefox 162.0a1、Safari Technology Preview 256。いずれも 2026-11-16）。

`<scope-start>` のない `@scope` の範囲の起点に、`:scope` と `:hover` を組み合わせて当てるテストはない。wpt.fyi の API で `css/css-cascade/scope`、`scope-implicit`、`scope hover` を検索し、関係しそうな次のテストを確かめた。

| テスト | Chrome | Firefox | Safari TP |
|---|---|---|---|
| [css/css-cascade/scope-hover.html](https://wpt.fyi/results/css/css-cascade/scope-hover.html) | 4/4 | 4/4 | 4/4 |
| [css/css-cascade/scope-implicit.html](https://wpt.fyi/results/css/css-cascade/scope-implicit.html) | 11/11 | 11/11 | 11/11 |
| [css/css-cascade/scope-invalidation.html](https://wpt.fyi/results/css/css-cascade/scope-invalidation.html) | 31/31 | 31/31 | 31/31 |
| [css/css-cascade/scope-nesting.html](https://wpt.fyi/results/css/css-cascade/scope-nesting.html) | 24/24 | 24/24 | 24/24 |

- `scope-hover.html` は、`@scope (.a:hover)` や `@scope (.a) to (:scope:hover)` のように、`:hover` を `@scope` の前置き（prelude）に書いた4つの場合を確かめる。範囲の起点は明示したセレクタで決まり、暗黙の範囲の起点は使っていない。
- `scope-implicit.html` は、暗黙の範囲の起点を確かめるが、`:hover` の変化は扱っていない（中身は読んでおらず、題とサブテストの数だけを確かめた）。

## 検索の記録

検索日: 2026-11-18

WebKit Bugzilla の quicksearch では、`@` で始まる語を含む検索がすべて0件になったので、`@` を外した語でも検索した。件数が上限の50件に達した検索では、番号の小さい古い件だけが返るので、語を足して絞った検索もした。

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| w3c/csswg-drafts | `"@scope" hover` | 144 | なし（関係のない件が多く、絞り込めない） |
| w3c/csswg-drafts | `label:css-cascade-6 :scope` | 67 | [#13517](https://github.com/w3c/csswg-drafts/issues/13517) |
| w3c/csswg-drafts | `"@scope" "style element" implicit` | 6 | なし |
| WebKit Bugzilla | `@scope hover` | 0 | |
| WebKit Bugzilla | `scope :scope hover` | 0 | |
| WebKit Bugzilla | `@scope implicit` | 0 | |
| WebKit Bugzilla | `@scope style element` | 0 | |
| WebKit Bugzilla | `@scope nesting` | 0 | |
| WebKit Bugzilla | `@scope invalidation` | 0 | |
| WebKit Bugzilla | `prelude-less @scope` | 0 | |
| WebKit Bugzilla | `@scope :hover` | 0 | |
| WebKit Bugzilla | `scope any-link` | 2 | なし（2023年より前の件） |
| WebKit Bugzilla | `scoping root hover` | 2 | なし（2023年より前の件） |
| WebKit Bugzilla | `scope hover` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `scope implicit` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `scope style element` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `scope invalidation` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `scoping root` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `CSS scope rule` | 50+ | なし（古い件だけが返った） |
| WebKit Bugzilla | `scope nesting selector` | 25 | なし（[280544](https://bugs.webkit.org/show_bug.cgi?id=280544)、[290592](https://bugs.webkit.org/show_bug.cgi?id=290592) など、`@scope` と入れ子の実装の件。どれも修正済み） |
| WebKit Bugzilla | `css-scoping` | 50+ | なし（`@scope` の実装の初期の件） |
| WebKit Bugzilla | `css-scoping hover` | 3 | なし（2023年より前の件） |
| WebKit Bugzilla | `css-scoping invalidation` | 13 | [265996](https://bugs.webkit.org/show_bug.cgi?id=265996)（下に記す） |
| WebKit Bugzilla | `css-scoping implicit` | 5 | [266399](https://bugs.webkit.org/show_bug.cgi?id=266399)（暗黙の範囲の起点の実装。修正済み） |
| WebKit Bugzilla | `scope hover invalidation` | 7 | [307215](https://bugs.webkit.org/show_bug.cgi?id=307215)（下に記す） |
| WebKit Bugzilla | `scope pseudo-class invalidation` | 9 | [307215](https://bugs.webkit.org/show_bug.cgi?id=307215)、[288826](https://bugs.webkit.org/show_bug.cgi?id=288826)（shadow DOM の中の `:has()` の無効化の件で、条件が違う） |

読んだ件の内容:

- [WebKit 307215](https://bugs.webkit.org/show_bug.cgi?id=307215)（RESOLVED CONFIGURATION CHANGED、2026-02-07）: @scope + :has(:hover) does not trigger style invalidation when hover state changes。Safari 18.6 で、`@scope (.test-scope)` の中の `:scope:has(> .anchor *:hover)` が、ポインターを重ねても再計算されないという報告。同じセレクタを `@scope` の外に書くと動く。WebKit の担当者が Safari Technology Preview 236 では動くと答え、報告者も最新のソフトウェアで直ったと確かめて閉じられた。条件（`:has()` の中の `:hover`、明示した範囲の起点）は今回と違うが、`@scope` の中の `:hover` の無効化が Safari 18 の系列で欠けていたことを示す件。
- [WebKit 265996](https://bugs.webkit.org/show_bug.cgi?id=265996)（修正済み、2023-12）: [css-scoping] @scope invalidation。DOM が変わったときに、要素がまだ範囲の中にあるかを確かめ直す件。`:hover` には触れていない。

Gecko と Blink は期待どおりに動いたので、それぞれのトラッカーは検索していない。

## 結論

- WebKit: `cannot-reproduce`。Safari 27.2 と Safari Technology Preview 27.0 で、説明のコード（T1）を含むすべての形が、ホバーで期待どおりの背景になる。以前に Safari で起きていた問題は、今のバージョンでは再現しない。どのバージョンで直ったかは確かめていない。同じ時期の Safari 18.6 で、`@scope` の中の `:hover` の変化が再計算されない [307215](https://bugs.webkit.org/show_bug.cgi?id=307215) が報告され、以降のビルドで直ったと確かめられている。今回の問題も、同じ無効化の欠けによるものだった可能性があるが、確かめていない。
- Gecko: `not-affected`。Firefox 160.0.1 と Nightly 162.0a1 で、すべての形が合格する。
- Blink: `not-affected`。Chrome 157 と Canary 160 で、すべての形が合格する。
