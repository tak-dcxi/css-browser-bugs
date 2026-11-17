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

- 結果はページを開いたあとに読み込まれる。`get_page_text` の結果が「Searching for」のままなら、数秒待って読み直す。結果の見出しの「1 - N of M」が件数になる。
- 状態で絞り込まない検索では、閉じた件（Fixed、Duplicate、Obsolete など）も結果に出る。`status:open` のような条件を付けない。
- 本文も検索の対象になるので、関係のない件が多く出る。題を読んで関係しそうな件だけを開く。件の URL は `https://issues.chromium.org/issues/<ID>`。
- 検索にサインインは要らない。サインインを求められたら、ユーザーに組み込みブラウザでサインインしてもらう。
- 報告先: https://issues.chromium.org/issues/new 。Component は、似た件が使っているもの（`Blink>CSS`、`Blink>Layout>Inline`、`Blink>Animation` など）から選ぶ。

## w3c/csswg-drafts

```bash
gh search issues --repo w3c/csswg-drafts --limit 30 --json number,title,state,url -- "<検索語>"
```

`gh search issues` は、開いている件と閉じた件を両方返す。`gh` がネットワークに接続できないときは、組み込みブラウザで `https://github.com/w3c/csswg-drafts/issues?q=is:issue+<検索語>` を開く（`state:open` を付けないので、閉じた件も出る）。仕様が決まっていない、または議論中の件が見つかったら、「期待する挙動と根拠」にその Issue を書く。報告先ではない。

## web-platform-tests

組み込みブラウザで wpt.fyi を開き、`get_page_text` で結果を読む。

```text
https://wpt.fyi/results/css/<仕様のディレクトリ>?label=master&label=experimental&aligned
https://wpt.fyi/results/?q=<テスト名の一部>
```

- `<仕様のディレクトリ>` は `css-text`、`css-text-decor`、`css-anchor-position` のように、仕様の短い名前になる。
- テストの名前、各エンジンの結果（合格したサブテストの数）、見た日付を記録する。

## 報告文の書き方

`templates/report.en.md` の節を埋める。

- 1行目の題は、機能、条件、誤った挙動を1文で書く（例: `text-decoration-inset percentages are not interpolated in CSS transitions`）。
- Steps to reproduce は、添付したテストケースを開くところから書く。
- Actual results と Expected results は、テストケースのどこを見ればよいかを書く（"The Test box should look the same as the Reference box."）。
- Specification には、仕様の節への直リンクを書く。
- Environment には、確かめたブラウザのバージョンと OS を書く。変えた設定があれば書く。
- Other browsers には、ほかのエンジンでの結果を書く。
- Web Platform Tests には、関係するテストと、その結果を書く。
