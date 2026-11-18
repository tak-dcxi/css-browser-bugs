# css-browser-bugs

ブラウザの CSS のバグを調べた記録です。1件ごとに次のことを残します。

- 最小のテストケース
- 仕様に照らした判断
- 各ブラウザで確かめた結果
- 既存の報告を探した検索の記録

既存の報告がなければ、英語の報告文の下書きも残します。

## 対象のエンジンと報告先

| エンジン | 主なブラウザ | 報告先 |
|---|---|---|
| WebKit | Safari | [WebKit Bugzilla](https://bugs.webkit.org/) |
| Gecko | Firefox | [Mozilla Bugzilla](https://bugzilla.mozilla.org/) |
| Blink | Chrome、Edge | [Chromium Issue Tracker](https://issues.chromium.org/) |

仕様の議論は [w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues) で、テストの結果は [wpt.fyi](https://wpt.fyi/) で確かめます。

## ディレクトリの構成

```text
bugs/<slug>/
  README.md               調査の記録（日本語）。frontmatter に状態とリンクを書く
  repro.html              テストケース（外部の資源を読まない単体の HTML）
  report.<engine>.en.md   報告文の下書き（英語）。新しく報告するときだけ作る
templates/                上の3つの雛形（scripts/new-bug.mjs と scripts/new-report.mjs が埋める）
scripts/                  検索、バージョンの取得、一覧の生成に使うスクリプト（Node.js、依存なし）
```

テストケースは GitHub Pages で公開し、報告文からその URL を示します。

## 状態の値

`README.md` の frontmatter に、エンジンごとに `status.webkit`、`status.gecko`、`status.blink` を書きます。

| 値 | 意味 |
|---|---|
| `-` | まだ確かめていない |
| `investigating` | 調査中 |
| `not-affected` | このエンジンでは期待どおりに動く |
| `not-a-bug` | 仕様どおり（仕様が UA に任せている挙動を含む） |
| `unsupported` | 機能が未実装、または既定で無効 |
| `cannot-reproduce` | 最新版と先行版で再現しない |
| `duplicate` | 既存の報告がある（`links.<engine>` にその URL） |
| `drafted` | 報告文の下書きができた |
| `reported` | 報告した（`links.<engine>` にその URL） |
| `fixed` | 修正された（直ったバージョンを `README.md` の結論に書く） |

## 一覧

`node scripts/build-index.mjs` で、各件の frontmatter から作り直します。

<!-- index:start -->
| 件 | WebKit | Gecko | Blink | 更新 |
|---|---|---|---|---|
| [アンカーで配置した ::after のトランジションが、元の要素に :has() の規則が当たると始まらない](bugs/anchor-pseudo-transition-has-originating/) | reported [1](https://bugs.webkit.org/show_bug.cgi?id=332060) | unsupported | not-affected | 2026-11-18 |
<!-- index:end -->

## ライセンス

[CC0 1.0](LICENSE)。テストケースは、web-platform-tests やブラウザの回帰テストにそのまま使えます。
