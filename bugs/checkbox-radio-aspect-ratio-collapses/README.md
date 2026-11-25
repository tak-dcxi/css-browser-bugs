---
title: チェックボックスとラジオボタンの aspect-ratio が守られず、潰れる
slug: checkbox-radio-aspect-ratio-collapses
created: 2026-11-25
updated: 2026-11-25
features: CSS Box Sizing Level 4, aspect-ratio, input type=checkbox, input type=radio, appearance
status.webkit: drafted
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

テストケースの外でも、Safari 27.2 で `margin: 0` のチェックボックスとラジオボタンに次の宣言を書いて測った（2026-11-25）。

- `width: 36px; aspect-ratio: 2 / 1` は 36 × 12 になる（期待は 36 × 18）。
- `height: 36px; aspect-ratio: 1` は 12 × 36 になる（期待は 36 × 36）。高さだけを書いたときは、幅が 12px のままになる。
- `<button>` と `<input type="range">` に `width: 100px; aspect-ratio: 1` を書くと 100 × 100 になる。ネイティブの見た目のままでもこの 2 つでは `aspect-ratio` が使われる。

## 期待する挙動と根拠

この挙動は仕様が決めていると読める。根拠は次の 3 つの節（css-sizing-4 と css-ui-4 は Editor’s Draft、HTML は Living Standard。2026-11-25 に読んだ）。

- [CSS Box Sizing Module Level 4 §4.1 Preferred Aspect Ratios: the aspect-ratio property](https://drafts.csswg.org/css-sizing-4/#aspect-ratio): `aspect-ratio` は、インラインボックスと内部のルビ・表のボックスを除くすべての要素に適用され、自動の大きさの計算に使われる。値が `<ratio>` だけのときは、置換要素でも、書いた比率が望ましい比率になる。
- [CSS Basic User Interface Module Level 4 §7.2 Switching appearance: the appearance property](https://drafts.csswg.org/css-ui-4/#appearance-switching): `appearance: auto` の要素のボックスは、ふつうの置換要素と同じようにレイアウトされ、そのボックスの中にネイティブの見た目が描かれる。
- [HTML §15.5.10 The input element as checkbox, switch, and radio button widgets](https://html.spec.whatwg.org/multipage/rendering.html#the-input-element-as-a-checkbox-and-radio-button-widgets): チェックボックスとラジオボタンは、コントロールを 1 つ含む `inline-block` のボックスとして描かれる。大きさを固定する記述はない。

チェックボックスとラジオボタンの `block-size` を書いていなければ自動なので、`inline-size: 36px; aspect-ratio: 1` の高さは 36px になる。Firefox と Chrome はそうなる。

flex で引き伸ばされる行（`align-items: normal`）の期待値は、Firefox と Chrome の結果に合わせている。[CSS Box Alignment Module Level 3 §6.2.4](https://drafts.csswg.org/css-align-3/#align-flex) は、flex の子の `align-self: normal` が `stretch` として振る舞うと定めている。引き伸ばした高さと `aspect-ratio` の組み合わせを flex のレイアウトの手順からどう導くかは、確かめていない。

Safari で `block-size` の計算値が `12px` になるのは、ネイティブの見た目のコントロールで、書かれていない側の大きさをエンジンが既定の大きさで埋めているためと考えられる（エンジンのコードは読んでいない）。css-ui-4 §7.2 は、ネイティブの見た目のコントロールにも、ボックスの大きさと位置に関わるプロパティ（大きさのプロパティなど）を適用しなければならないと定めている。UA が無視してよいのは、コントロールの中身の大きさと描画に関わるプロパティ（`box-sizing`、`padding`、`border`、`margin` など）の側になる。§7.2.1〜§7.2.3 と §7.3 にも、ボックスの大きさを UA が決めてよいという記述は見つからなかった。§7.3 には `appearance: auto` でもネイティブの見た目を失わせるプロパティを文書にしたほうがよいという編集上の注記があるが、大きさの求め方には触れていない。csswg-drafts の Issue の検索は、実行する権限がなく、していない。

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
| Firefox | 160.0.1 | なし | 合格。20 行すべて（正方形の行と 1 行のラベルの引き伸ばしの行は 36 × 36、2 行のラベルの引き伸ばしの行は 36 × 51.2） |
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

- WebKit: `drafted`。報告文の下書きは [report.webkit.en.md](report.webkit.en.md)。Safari 27.2 と Safari Technology Preview 27.0 で、`appearance: auto` のチェックボックスとラジオボタンは、幅だけを書いても `aspect-ratio` で高さが決まらず、12px のままになる。同じ条件の既存の報告は、上の検索では見つからなかった。仕様（css-sizing-4 §4.1、css-ui-4 §7.2、HTML §15.5.10）に照らすと、高さは幅と比率から決まるはずで、Safari の挙動は仕様と合わない。目で見る判定はまだしていない。
- Gecko: `not-affected`。Firefox 160.0.1 は 20 行すべて合格。
- Blink: `not-affected`。Chrome 157 は 20 行すべて合格。
