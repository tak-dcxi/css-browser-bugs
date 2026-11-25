---
title: startViewTransition() の types と :active-view-transition-type() が使えるか（対応状況の確認）
slug: view-transition-types-support
created: 2026-11-25
updated: 2026-11-25
features: CSS View Transitions Level 2, startViewTransition(), ViewTransition.types, ":active-view-transition-type()"
status.webkit: not-affected
status.gecko: not-affected
status.blink: not-affected
links.webkit:
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-view-transitions-2/#the-active-view-transition-type-pseudo
---

# startViewTransition() の types と :active-view-transition-type() が使えるか（対応状況の確認）

## 症状

バグの報告ではなく、対応状況の確認。確かめたのは、次の 2 つが Firefox で動くか。

- `document.startViewTransition({ update, types: ['--name'] })` のように、types を渡す形の呼び出し。
- 遷移のあいだ、`:active-view-transition-type(--name)` がルート要素に一致し、その下に書いた `::view-transition-new(root)` などの規則が当たること。

## 期待する挙動と根拠

この挙動は仕様が決めている。[CSS View Transitions Module Level 2 §9.3.2 The :active-view-transition-type() pseudo-class](https://drafts.csswg.org/css-view-transitions-2/#the-active-view-transition-type-pseudo)（Editor’s Draft、2026-11-25 に読んだ）は、文書にアクティブな view transition があり、その types に引数の名前のどれかが含まれるとき、この擬似クラスが文書のルート要素に一致すると定めている。types は `startViewTransition()` に渡すオブジェクトの `types` で与える。

types を渡す側の API の節（`startViewTransition()` の引数と `ViewTransition.types`）は読んでいない。csswg-drafts の Issue の検索は、実行する権限がなく、していない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/view-transition-types-support/repro.html

ボタンを押すと（URL に `?auto` を付けると読み込み時に）types 付きの view transition を始め、次の値を表に出す。`'types' in ViewTransition.prototype`、`CSS.supports('selector(:active-view-transition-type(--test-type))')`、呼び出しが例外にならないか、`transition.types` の中身、遷移中の `documentElement.matches()`、`::view-transition-new(root)` と `::view-transition-old(root)` の `animation-name`（後者は入れ子で書いた規則）。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-25。

ここに書いたのは、ブラウザを自動操作するツールでテストケースを開き、ページが出す判定（計測した値と PASS / FAIL）を読んだ結果。見た目を目で確かめる判定はしていない。Chrome は、起動していた版が 157.0.8103.80 だった（入っている版は 158.0.8127.88 で、再起動していない）。Chrome Canary 160、Firefox Nightly 163、Edge、iOS の Safari、Safari 26.x では確かめていない。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Firefox | 160.0.1 | なし | 合格。判定の付く 11 行がすべて PASS。`transition.types` は `--test-type`、遷移中の `matches()` は `true`、`::view-transition-new(root)` の `animation-name` は `--marker`、入れ子の規則による `::view-transition-old(root)` の `animation-name` は `none`。終了後の `matches()` は `false` |
| Safari | 27.2 (22625.2.8.11.9) | なし | 合格。Firefox と同じ |
| Google Chrome | 157.0.8103.80 | なし | 合格。Firefox と同じ |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 判定できない。自動操作のウィンドウの `document.visibilityState` が `hidden` のままで、遷移が `InvalidStateError` で飛ばされた。types の有無（`true`）と `CSS.supports()`（`true`）、`transition.types`（`--test-type`）までは合格 |

対応が入った版（[MDN の browser-compat-data](https://github.com/mdn/browser-compat-data) の `api/ViewTransition.json` と `css/selectors/active-view-transition-type.json` を 2026-11-25 に読んだ値。動かして確かめてはいない）: `ViewTransition.types` と `:active-view-transition-type()` は、どちらも Chrome 125、Firefox 147、Safari 18.2。Firefox が view transition そのものに対応したのは 144 なので、types のない実装は Firefox 144〜146 だけになる。browser-compat-data の版の一覧では、2026-11-25 の時点で Firefox の現行は 160（2026-11-10）、1 つ前は 159（2026-10-27）。

## web-platform-tests

確認日: 2026-11-25。wpt.fyi の安定版の run（Chrome 158.0.8127.88、Firefox 160.0.1、Safari 27.2。2026-11-24）と、先行版の run（Chrome 160.0.8178.0、Firefox 163.0a1、Safari 257 preview。2026-11-23）。

- [css/css-view-transitions/active-view-transition-type-on-non-root.html](https://wpt.fyi/results/css/css-view-transitions/active-view-transition-type-on-non-root.html): 3 つのエンジンとも PASS（安定版、先行版）。
- `css/css-view-transitions/view-transition-types-*.html` の 11 件（[view-transition-types-matches.html](https://wpt.fyi/results/css/css-view-transitions/view-transition-types-matches.html)、`-match-early`、`-match-early-mutation`、`-match-late-mutation`、`-matches-case-sensitive`、`-mutable`、`-mutable-no-document-element-crashtest`、`-removed`、`-reserved`、`-reserved-mutation`、`-stay`）: 3 つのエンジンとも全件 PASS（安定版、先行版）。

## 検索の記録

検索日: 2026-11-25

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| web-platform-tests | `css-view-transitions/active-view-transition-type` | 1 | 上の 1 件 |
| web-platform-tests | `css-view-transitions/view-transition-types`、`view-transition-types` | 11 | 上の 11 件 |
| w3c/csswg-drafts | `active-view-transition-type`、`startViewTransition types`、`ViewTransitionTypeSet` | 未実行 | 検索を実行する権限がなかった |

どのエンジンも期待どおりに動いたので、バグトラッカーは検索していない。

## 結論

- Gecko: `not-affected`。Firefox 160.0.1 で、types を渡す呼び出しと `:active-view-transition-type()` が動いた。対応は Firefox 147 から（browser-compat-data による。Firefox 159 では動かしていない）。
- WebKit: `not-affected`。Safari 27.2 で動いた。対応は Safari 18.2 から（同上）。
- Blink: `not-affected`。Chrome 157 で動いた。対応は Chrome 125 から（同上）。
