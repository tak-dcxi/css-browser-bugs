---
title: progress() に長さを渡して未登録のカスタムプロパティに入れ、calc() で使えるか（対応状況の確認）
slug: progress-function-length-custom-property
created: 2026-11-25
updated: 2026-11-25
features: CSS Values and Units Level 5, progress(), calc(), custom properties, svi
status.webkit: not-affected
status.gecko: not-affected
status.blink: not-affected
links.webkit:
links.gecko:
links.blink:
links.spec: https://drafts.csswg.org/css-values-5/#progress
---

# progress() に長さを渡して未登録のカスタムプロパティに入れ、calc() で使えるか（対応状況の確認）

## 症状

バグの報告ではなく、対応状況の確認。確かめたのは、次の書き方が各エンジンで同じ値になるか。

- `:root` の未登録のカスタムプロパティに `progress(100svi, <数> / 16 * 1rem, <数> / 16 * 1rem)` を入れる（区間の中で画面の幅がどこにあるかを 0〜1 の数値にする）。
- その値を `calc((16 + (64 - 16) * var(--p)) * 1px)` と `calc((14 + (18 - 14) * var(--p)) / 16 * 1rem)` のように、長さの計算の係数として使う。
- 同じ 2 点を結ぶ直線を `clamp()` で書いたものと、計算値が一致するか。

## 期待する挙動と根拠

この挙動は仕様が決めている。[CSS Values and Units Module Level 5 §5 Interpolation Progress Calculations: the progress() notation](https://drafts.csswg.org/css-values-5/#progress)（Editor’s Draft、2026-11-25 に読んだ）は、`progress()` を、1 つ目の値が 2 つ目の値から 3 つ目の値までのどこにあるかを表す数学関数と定めている。結果は `<number>` で、ほかの計算に入れられる。3 つの値は `<number>`、`<dimension>`、`<percentage>` のどれでもよいが、型がそろっていなければ無効になる。`no-clamp` を書かなければ、結果は 0〜1 の範囲に収められる。そのため、区間の外では最小値と最大値に止まり、区間の中では `clamp()` で書いた直線と同じ値になる。

csswg-drafts の Issue の検索は、実行する権限がなく、していない。

## 再現

- テストケース: [repro.html](repro.html)
- 公開URL: https://tak-dcxi.github.io/css-browser-bugs/bugs/progress-function-length-custom-property/repro.html

幅の違う 3 つのフレーム（300px、800px、1400px。区間 375px〜1280px の下、中、上）のそれぞれで、`progress()` の側と `clamp()` の側の `padding-inline-start` と `font-size` の計算値を比べる。差が 0.05px 未満なら PASS。

## 確認した環境

OS: macOS 27.2.1。確認日: 2026-11-25。

ここに書いたのは、ブラウザを自動操作するツールでテストケースを開き、ページが出す判定（計測した値と PASS / FAIL）を読んだ結果。見た目を目で確かめる判定はしていない。Chrome は、起動していた版が 157.0.8103.80 だった（入っている版は 158.0.8127.88 で、再起動していない）。Chrome Canary 160、Firefox Nightly 163、Edge、iOS の Safari、Safari 26.x では確かめていない。

| ブラウザ | バージョン | 変えた設定 | 結果 |
|---|---|---|---|
| Safari | 27.2 (22625.2.8.11.9) | なし | 合格。3 つのフレームとも一致（800px で 38.541435px / 15.878453px）。`CSS.supports('opacity', 'progress(1, 0, 2)')` は `true` |
| Safari Technology Preview | 27.0 (22627.1.6.3) | なし | 合格 |
| Firefox | 160.0.1 | なし | 合格。800px のフレームで `padding` が 38.5414px と 38.5272px（差 0.014px。`clamp()` の側の丸めの違い）、`font-size` は一致。`CSS.supports()` は `true` |
| Google Chrome | 157.0.8103.80 | なし | 合格。3 つのフレームとも一致。`CSS.supports()` は `true` |

対応が入った版（[MDN の browser-compat-data](https://github.com/mdn/browser-compat-data/blob/main/css/types/progress.json) を 2026-11-25 に読んだ値。動かして確かめてはいない）: Chrome 138、Edge 138、Firefox 155（2026-09-01 リリース）、Safari 26、iOS の Safari 26。`no-clamp` は別の項目で、Chrome は未対応、Safari は先行版だけ。今回のテストケースは `no-clamp` を使っていない。

## web-platform-tests

確認日: 2026-11-25。wpt.fyi の安定版の run（Chrome 158.0.8127.88、Firefox 160.0.1、Safari 27.2。2026-11-24）と、先行版の run（Chrome 160.0.8178.0、Firefox 163.0a1、Safari 257 preview。2026-11-23）。

| テスト | Chrome 158 | Firefox 160 | Safari 27.2 | Chrome 160 | Firefox 163 | Safari 257 preview |
|---|---|---|---|---|---|---|
| [progress-computed.html](https://wpt.fyi/results/css/css-values/progress-computed.html) | 25/36 | 36/36 | 36/36 | 35/36 | 36/36 | 36/36 |
| [progress-invalid.html](https://wpt.fyi/results/css/css-values/progress-invalid.html) | 35/35 | 35/35 | 34/35 | 35/35 | 35/35 | 34/35 |
| [progress-serialize.html](https://wpt.fyi/results/css/css-values/progress-serialize.html) | 39/68 | 68/68 | 68/68 | 68/68 | 68/68 | 68/68 |

Chrome 158 で落ちるサブテストの中身は読んでいない。今回のテストケースの書き方（長さを 3 つ渡し、既定のまま 0〜1 に収める）は、Chrome 157 で合格した。

## 検索の記録

検索日: 2026-11-25

| 検索先 | 検索語 | 件数 | 関係する件 |
|---|---|---|---|
| web-platform-tests | `css-values/progress` | 3 | 上の 3 件 |
| web-platform-tests | `progress-computed`、`progress-serialize`、`progress-invalid` | 各 1 | 上と同じ |
| w3c/csswg-drafts | `progress() function`、`progress() calc`、`progress() clamp` | 未実行 | 検索を実行する権限がなかった |

どのエンジンも期待どおりに動いたので、バグトラッカーは検索していない。

## 結論

- WebKit: `not-affected`。Safari 27.2 と Safari Technology Preview 27.0 で、`progress()` の側と `clamp()` の側が一致した。対応は Safari 26 から（browser-compat-data による。Safari 26.x では動かしていない）。
- Gecko: `not-affected`。Firefox 160.0.1 で一致した。対応は Firefox 155 から（同上）。
- Blink: `not-affected`。Chrome 157 で一致した。対応は Chrome 138 から（同上）。
