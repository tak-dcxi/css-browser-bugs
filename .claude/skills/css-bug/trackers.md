# 検索先と報告先

[SKILL.md](SKILL.md) の調査の手順で使う。検索先ごとに、検索の方法と、閉じた件まで含めて検索できているかの確かめ方をまとめる。閉じた件（修正済み、重複）を見落とすと、報告済みのバグを新しいバグと取り違える。

## WebKit Bugzilla と Mozilla Bugzilla

```bash
node scripts/search-bugzilla.mjs webkit "text-wrap pretty" "text-wrap-style CJK" "pretty Japanese"
node scripts/search-bugzilla.mjs mozilla "text-decoration-inset animation" "text-decoration-inset percentage"
```

- 引用符で囲んだ1つの引数が1回の検索になる。引数の中の語は AND で結ばれる。
- スクリプトは検索語の先頭に `ALL` を付ける。`ALL` がないと、Bugzilla の quicksearch は閉じた件を返さない。
- quicksearch は語の一致で探すので、題に使われそうな別の形（`animation` に対する `animatable`、`interpolation` など）も試す。コメントの中だけにある語では見つからない場合がある。
- `limitReached: true` の検索は、件数を「50+」のように書き、語を足して絞った検索もする。
- 結果の `product` と `component` は、報告先の欄を決めるときに使う。
- スクリプトがネットワークに接続できないときは、`--urls` を付けて URL だけを出し、その URL を WebFetch で読む。

報告先:

| トラッカー | 新規作成のフォーム | Product / Component の例 |
|---|---|---|
| WebKit Bugzilla | https://bugs.webkit.org/enter_bug.cgi?product=WebKit | WebKit / `CSS`、`Layout and Rendering`、`Text`、`Animations` |
| Mozilla Bugzilla | https://bugzilla.mozilla.org/enter_bug.cgi?product=Core | Core / `CSS Parsing and Computation`、`Layout: Text and Fonts`、`CSS Transitions and Animations`、`Layout: Positioned` |

表の Component は手がかりにすぎない。検索で見つけた似た件が使っている Component のほうを優先する。

## Chromium Issue Tracker

組み込みブラウザで検索のページを開き、`get_page_text` で結果を読む。

```text
https://issues.chromium.org/issues?q=<検索語>
```

- 結果はページを開いたあとに読み込まれる。`get_page_text` の結果が「Searching for」のままなら、5秒待って読み直す。3回読み直しても変わらなければ、読めなかった検索として扱う。結果の見出しの「1 - N of M」の M が件数になる。
- 状態で絞り込まない検索では、閉じた件（Fixed、Duplicate、Obsolete など）も結果に出る。`status:open` のような条件を付けない。
- 語だけの検索は本文も対象にするので、WPT の取り込みの失敗を記録した件のような、関係のない件が100件以上出ることがある。まず `title:text-decoration-inset` のように `title:` を付けて題だけを検索し、語だけの検索も1つ以上行う。件の URL は `https://issues.chromium.org/issues/<ID>`。
- 一覧には Component が出ない。Component は件を開いて確かめる。
- 検索にサインインは要らない。サインインを求められたら、ユーザーに組み込みブラウザでサインインしてもらう。
- 報告先: https://issues.chromium.org/issues/new 。Component は、似た件が使っているもの（`Blink>CSS`、`Blink>Layout>Inline`、`Blink>Animation` など）から選ぶ。

## w3c/csswg-drafts

```bash
gh search issues --repo w3c/csswg-drafts --limit 30 --json number,title,state,url -- "<検索語>"
```

`gh search issues` は、開いている件と閉じた件を両方返す。`gh` がネットワークに接続できないときや、権限の設定で拒否されたときは、組み込みブラウザで `https://github.com/w3c/csswg-drafts/issues?q=is:issue+<検索語>` を開く（`state:open` を付けないので、閉じた件も出る）。仕様が決まっていない、または議論中の件が見つかったら、「期待する挙動と根拠」にその Issue を書く。報告先ではない。

## web-platform-tests

```bash
node scripts/search-wpt.mjs "text-decoration-inset" "css-text-decor/text-decoration-skip"
```

- 引用符で囲んだ1つの引数が1回の検索になる。wpt.fyi は、引数をテストのパスの一部として照合する。機能の名前のほか、`css-text`、`css-text-decor`、`css-anchor-position` のような仕様のディレクトリも使える。
- 既定では、安定版の run と先行版（Chrome Canary、Firefox Nightly、Safari Technology Preview）の run の両方を出す。`--channel stable` か `--channel experimental` で片方に絞れる。
- 結果の `results` は、サブテストのあるテストでは「合格した数/全体の数」、ないテスト（reftest など）では `PASS`、`FAIL` のような状態になる。
- テストの名前、各エンジンの結果、run のブラウザのバージョン、見た日付を記録する。
- wpt.fyi の結果のページは JavaScript で描かれるので、`get_page_text` では本文を読めない。スクリプトがネットワークに接続できないときは、`--urls` で出した API の URL を WebFetch で読む。

## 報告文の書き方

`templates/report.en.md` の節を埋める。

- 1行目の題は、機能、条件、誤った挙動を1文で書く（例: `text-decoration-inset percentages are not interpolated in CSS transitions`）。
- Steps to reproduce は、添付したテストケースを開くところから書く。
- Actual results と Expected results は、テストケースのどこを見ればよいかを書く（"The Test box should look the same as the Reference box."）。
- Specification には、仕様の節への直リンクを書く。
- Environment には、確かめたブラウザのバージョンと OS を書く。変えた設定があれば書く。
- Other browsers には、ほかのエンジンでの結果を書く。
- Web Platform Tests には、関係するテストと、その結果を書く。

## 送信の準備

[SKILL.md](SKILL.md) の「送信の準備」で使う。

### 欄の表（WebKit Bugzilla と Mozilla Bugzilla）

| 欄 | 値の決め方 |
|---|---|
| Product / Component | 下書きの冒頭のコメントの値 |
| Version | REST で取った有効な値から、確かめた安定版に合うもの（例: `Safari 27`） |
| Hardware | REST で取った値から、`uname -m` に合うもの（`arm64` なら `Mac (Apple Silicon)`） |
| OS | REST で取った値から、「確認した環境」の OS に合うもの |
| URL | テストケースの公開 URL。開けないときは空欄 |
| See Also | 下書きで関連として示した件の URL |
| Attachment | `bugs/<slug>/repro.html`（Content Type は HTML） |
| Keywords | 空欄（WebKit の `InRadar` は Apple 側が付ける） |
| Severity / Priority | 既定のまま |

今選べる値は、組み込みブラウザでトラッカーのページを開き、同じオリジンから REST を読んで取る。

```js
// bugs.webkit.org の例。bugzilla.mozilla.org も同じ API で、product は Core
const p = await (await fetch('/rest/product?names=WebKit&include_fields=versions.name,versions.is_active,components.name,components.is_active')).json();
const hw = await (await fetch('/rest/field/bug/rep_platform')).json();
const os = await (await fetch('/rest/field/bug/op_sys')).json();
```

Version は年ごとに増え、古い値は無効になる。前回の報告の値を使い回さず、毎回取る。

### 本文の整え方

- Bugzilla の本文は Markdown として表示されない。見出しの `#` と、コードを囲むバッククォートを外す。リンクは URL をそのまま書く。
- 下書きの1行目の題は Summary の欄に入れ、Description には入れない。冒頭のコメント（`<!-- ... -->`）も入れない。
- それ以外の文は下書きのまま使い、言い換えない。下書きを直したいときは、先にファイルを直してコミットする。
- 公開 URL が開けないときは、Steps to reproduce の「(also available at …)」を外す。

Chromium Issue Tracker で本文の書式がどう表示されるかは確かめていない。初めて報告するときにフォームのプレビューで確かめ、結果をこの節に書き足す。
