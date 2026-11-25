---
title: チェックボックスとラジオボタンの aspect-ratio が守られず、潰れる
slug: checkbox-radio-aspect-ratio-collapses
created: 2026-11-25
updated: 2026-11-25
features: CSS Box Sizing Level 4, aspect-ratio, input type=checkbox, input type=radio, appearance
status.webkit: investigating
status.gecko: not-affected
status.blink: not-affected
links.webkit:
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-sizing-4/#aspect-ratio
---

# チェックボックスとラジオボタンの aspect-ratio が守られず、潰れる

## 症状

調査を始めた時点の説明は「Safari では input（チェックボックスとラジオボタン）の `aspect-ratio` が潰れることがある」。

確かめて分かった条件は次のとおり。

- `appearance: auto`（既定）のチェックボックスとラジオボタンに `inline-size: 36px; aspect-ratio: 1` を書くと、Safari では高さが 12px のままになり、36 × 12 に潰れる。`block-size` の計算値も `12px` になる。
- 置き場所（ブロック、flex、grid）には関係しない。flex で引き伸ばされる場合（`align-items: normal`）にも 12px のまま。
- `appearance: none` にすると、`aspect-ratio` どおり 36 × 36 になる。
- 幅と高さの両方を書けば、`appearance: auto` でも 36 × 36 になる。

## 期待する挙動と根拠

この挙動は仕様が決めていると読める。根拠は次の 2 つの節（どちらも Editor’s Draft、2026-11-25 に読んだ）。

- [CSS Box Sizing Module Level 4 §4.1 Preferred Aspect Ratios: the aspect-ratio property](https://drafts.csswg.org/css-sizing-4/#aspect-ratio): `aspect-ratio` は、インラインボックスと内部のルビ・表のボックスを除くすべての要素に適用され、自動の大きさの計算に使われる。値が `<ratio>` だけのときは、置換要素でも、書いた比率が望ましい比率になる。
- [CSS Basic User Interface Module Level 4 §7.2 Switching appearance: the appearance property](https://drafts.csswg.org/css-ui-4/#appearance-switching): `appearance: auto` の要素のボックスは、ふつうの置換要素と同じようにレイアウトされ、そのボックスの中にネイティブの見た目が描かれる。

チェックボックスとラジオボタンの `block-size` を書いていなければ自動なので、`inline-size: 36px; aspect-ratio: 1` の高さは 36px になる。Firefox と Chrome はそうなる。

Safari で `block-size` の計算値が `12px` になるのは、ネイティブの見た目のコントロールで、書かれていない側の大きさをエンジンが既定の大きさで埋めているためと考えられる（エンジンのコードは読んでいない）。css-ui-4 には、ネイティブの見た目のコントロールの大きさを UA が決めてよいという記述は、読んだ範囲（§7.2 の値の定義）では見つからなかった。§7.2.2 と §7.3 は読んでいない。csswg-drafts の Issue の検索は、実行する権限がなく、していない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/checkbox-radio-aspect-ratio-collapses/repro.html

チェックボックスとラジオボタン × `appearance` の auto と none × 置き場所 5 通りの 20 行。各行で、`inline-size: 36px; aspect-ratio: 1` のコントロール（テスト）を、`inline-size: 36px; block-size: 36px` のコントロール（参照）と並べ、テストの大きさを測る。コントロールには `flex: none` を付けて、flex での縮みを外している。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-25。

ここに書いたのは、ブラウザを自動操作するツールでテストケースを開き、ページが出す判定（計測した値と PASS / FAIL）を読んだ結果。見た目を目で確かめる判定はしていない。Chrome は、起動していた版が 157.0.8103.80 だった（入っている版は 158.0.8127.88 で、再起動していない）。Chrome Canary 160、Firefox Nightly 163、Edge、iOS の Safari、Safari 26.x では確かめていない。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 失敗。`appearance: auto` の 10 行がすべて 36 × 12（`block-size` の計算値 12px）。`appearance: none` の 10 行は合格 |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 失敗。Safari 27.2 と同じ 10 行 |
| Firefox | 160.0.1 | なし | 合格。20 行すべて（正方形の行は 36 × 36、引き伸ばしの行は 36 × 51.2） |
| Google Chrome | 157.0.8103.80 | なし | 合格。20 行すべて |

## web-platform-tests

確認日: 2026-11-25。チェックボックスやラジオボタンの `aspect-ratio` を確かめるテストは見つからなかった。探した場所は、`aspect-ratio checkbox`（0 件）、`css-sizing/aspect-ratio/flex-aspect-ratio`（59 件）、`aspect-ratio/replaced-element`（50 件）。後の 2 つはフォームのコントロールを題に含まず、中身は読んでいない。

## 検索の記録

検索日: 2026-11-25

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| WebKit Bugzilla | `aspect-ratio checkbox` | 2 | なし |
| WebKit Bugzilla | `aspect-ratio radio` | 2 | なし |
| WebKit Bugzilla | `aspect-ratio input` | 21 | なし |
| WebKit Bugzilla | `aspect-ratio flex item stretch` | 6 | なし（題からは、flex と grid の中での `aspect-ratio` の件。開いていない） |
| WebKit Bugzilla | `aspect-ratio form control` | 46 | なし |
| WebKit Bugzilla | `checkbox aspect-ratio height` | 1 | なし |
| WebKit Bugzilla | `aspect-ratio appearance` | 13 | なし |
| WebKit Bugzilla | `checkbox height auto width` | 50 未満（数は控えていない） | [255419](https://bugs.webkit.org/show_bug.cgi?id=255419)（下に記す） |
| WebKit Bugzilla | `radio button aspect ratio` | 6 | なし（[208302](https://bugs.webkit.org/show_bug.cgi?id=208302) は GTK のテーマの描画の件） |
| WebKit Bugzilla | `aspect-ratio native control` | 4 | なし |
| WebKit Bugzilla | `aspect-ratio widget` | 4 | なし（[327158](https://bugs.webkit.org/show_bug.cgi?id=327158) は題から、`aspect-ratio` と `calc()` の高さを持つ flex の子の件。開いていない） |
| w3c/csswg-drafts | `aspect-ratio checkbox`、`aspect-ratio flex item stretch`、`aspect-ratio form control` | 未実行 | 検索を実行する権限がなかった |

読んだ件の内容:

- [WebKit 255419](https://bugs.webkit.org/show_bug.cgi?id=255419)（修正済み）: flex の中のチェックボックスが縮み、ラベルと重なる件。flex の子としての幅の求め方の問題で、`aspect-ratio` は扱っていない。

Gecko と Blink は期待どおりに動いたので、トラッカーは検索していない。

## 結論

- WebKit: `investigating`。Safari 27.2 と Safari Technology Preview 27.0 で、`appearance: auto` のチェックボックスとラジオボタンは、幅だけを書いても `aspect-ratio` で高さが決まらず、12px のままになる。同じ条件の既存の報告は、上の検索では見つからなかった。仕様（css-sizing-4 §4.1 と css-ui-4 §7.2）に照らすと、高さは幅と比率から決まるはずで、Safari の挙動は仕様と合わない。まだしていないこと: 目で見る判定、css-ui-4 の §7.2.2 と §7.3 の確認、報告文の下書き。
- Gecko: `not-affected`。Firefox 160.0.1 は 20 行すべて合格。
- Blink: `not-affected`。Chrome 157 は 20 行すべて合格。
