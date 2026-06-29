# 既存制作物 バグ監査

## 追記: 正しい確認対象

後から追加された `legacy/HTML` が、より正しい確認対象。

以前確認した `legacy/destiny-master` には途中版・古い差分が含まれている可能性があるため、既存制作物の実運用版チェックは `legacy/HTML` を優先する。

`legacy/HTML` で再確認したところ、少なくとも以下の点は旧フォルダより改善されている。

- 直下版と `member` 版の通変星はどちらも日干基準
- `findTsuhen` はどちらも `indexOf` 方式
- 蔵干はどちらも `kanshiData.zokan` / `kanshiData.zokan_time` を使用
- 1980-01-01、1980-04-15、1990-06-10、2000-03-03、2025-01-01、2026-02-03、2037-12-31 の範囲では、直下版と `member` 版の命式主要結果は一致

したがって、旧フォルダで指摘した「`member` 版が年干基準になっている」「`member` 版だけ蔵干表が違う」という問題は、`legacy/HTML` には当てはまらない。

以下の旧監査内容は、`legacy/destiny-master` を見た時点の記録として残す。今後の既存制作物修正・確認は `legacy/HTML` を正対象にする。

## 前提

この監査は、新製品開発とは別の既存制作物チェック。

`legacy/destiny-master` の直下版と `legacy/destiny-master/member` 版は、利用者・表示量は違うが、同じ命式項目について計算結果に差分が出てはいけないものとして確認した。

基本方針としては、表示項目が多い `member` 版を実用上の基準として直下版を寄せる。ただし、通変星の基準のように `member` 版側のロジックが四柱推命として不自然、または元のPython版と矛盾している場合は、`member` 版側のバグ候補として扱う。

この流派では出生時刻を不要としていたため、Web版が三柱中心であること自体はバグ扱いしない。時刻・時柱関連は「未使用コード／将来拡張の残骸」として扱う。

## 結論

直下版と `member` 版には、UI差分だけでなく、命式結果に影響するロジック差分が残っている。

特に以下はバグ候補として優先度が高い。

- `member` 版の通変星取得方式が、表構造とPython版に対して不整合の可能性が高い
- `member` 版の通変星基準が年干基準になっており、一般的な四柱推命・Python版と異なるため、日干基準へ戻す方が安全
- 蔵干表・蔵干切替方式が違う
- 日干支計算方式が違う
- 大運表示が直下版ではHTML側から実行されていない
- 出生時刻・時柱の未使用コードが中途半端に残っている

## 高優先度のバグ候補

### 1. `findTsuhen` の戻り値方式が違う

対象:

- `legacy/destiny-master/meishiki.js:177`
- `legacy/destiny-master/member/meishiki.js:334`

直下版およびPython版:

```js
return kanshiData.kan_tsuhen[s_kan].indexOf(kan_);
```

`member` 版:

```js
return kanshiData.kan_tsuhen[s_kan][kan_];
```

これは計算結果を直接変える。

`kanshiData.kan_tsuhen` は「通変星順に対象干が並んでいる表」として使われている。

Python版 `member/Meishiki.py` も以下の方式を使っている。

```python
return kd.kan_tsuhen[s_kan].index(kan_)
```

そのため、この項目は `member` 版の `[s_kan][kan_]` 方式が誤りの可能性が高い。

例:

- 丙を基準に甲を見る場合、甲は丙にとって偏印に相当する
- `indexOf(0)` なら偏印の位置を返せる
- `[2][0]` のように直接引くと食神になってしまう

影響:

- 天干通変星
- 蔵干通変星
- 大運の通変星
- ソシアルメーター
- 関連チャート全般

優先度:

高。

### 2. `member` 版の通変星基準が年干基準になっている

対象:

- `legacy/destiny-master/meishiki.js:215`
- `legacy/destiny-master/member/meishiki.js:373`

直下版:

- 日干基準

`member` 版:

- 年干基準

一般的な四柱推命では、通変星は日干（日主）を基準に出す。  
Python版も `nitchu_tenkan` を保持しており、分析側も日干基準の思想で組まれている。

したがって、依頼者から明示的に「年干基準」と指定されていない限り、`member` 版の年干基準はバグ候補。現時点では独自仕様ではなく、チェック時にたまたま露見しなかった可能性があるものとして扱う。

直下版は日干基準なので、この項目については直下版の方が四柱推命として自然。

影響:

- 命式表の通変星
- 蔵干通変星
- ソシアルメーター
- 行動キーワードや独自表示の入力値

優先度:

高。

判断:

- 明示的な独自指定がない限り、通変星は日干基準に戻す
- `member` 版を修正する場合、この箇所は直下版・Python版に寄せる
- 直下版を `member` 版に寄せる場合でも、通変星基準だけは `member` 版へ寄せない

### 3. 蔵干表が直下版と `member` 版で違う

対象:

- `legacy/destiny-master/kanshi_data.js:3712`
- `legacy/destiny-master/meishiki.js:104`
- `legacy/destiny-master/member/meishiki.js:11`
- `legacy/destiny-master/member/meishiki.js:258`

直下版は `kanshiData.zokan` と `kanshiData.zokan_time` を使う。

`member` 版は `Meishiki` クラス内に別の `this.zokan` と `this.zokan_time` を持っている。

例:

- 直下版の子: `[9]`
- `member` 版の子: `[8, 0]`

これは結果が大きく変わる。

特に `member` 版は全地支を原則2区間扱いし、午だけ3区間扱いしている。直下版は地支ごとに1区間・2区間・3区間が分かれている。

影響:

- 蔵干
- 蔵干通変星
- 月支蔵干を使う分析
- 独自チャート

優先度:

高。

確認事項:

- 最終納品時に採用した蔵干表はどちらか
- `member` 版のクラス内蔵干表は意図したものか、デバッグ途中のものか
- `kanshi_data.js` の蔵干表を正とすべきか

現時点の見立て:

`member` 版にだけクラス内蔵干表が追加されているため、途中修正で独自表を入れた可能性がある。ただし、全地支を原則2区間扱いにしている点はかなり強い独自仕様に見える。依頼者の明示指定がなければ、慎重に再確認した方がよい。

### 4. 日干支計算方式が違う

対象:

- `legacy/destiny-master/meishiki.js:84`
- `legacy/destiny-master/member/meishiki.js:232`

直下版:

- 1926-01-01 からの日数差 + 補正値26

`member` 版:

- `kisu_table` を使う

どちらも同じ結果を狙っている可能性はあるが、範囲・うるう年・境界日で差が出る可能性がある。

`member` 版は `kisu_table` が2037年までしかないため、それ以降はエラーになる。

影響:

- 日柱
- 通変星
- 十二運
- 天中殺
- 大運通変星

優先度:

中から高。

確認事項:

- 1900年から2100年まで対応するなら、`member` 版の `kisu_table` は範囲不足
- 日干支の正解表でサンプル検証が必要

現時点の見立て:

最終納品で2037年までの範囲で十分だったなら `member` 版でも運用上は成立する。商品化や長期利用を考えるなら、直下版のような日数差計算、または検証済み暦ライブラリ方式に寄せた方が安全。

## 中優先度のバグ候補

### 5. 直下版 `index.html` は大運を表示していない可能性が高い

対象:

- `legacy/destiny-master/index.html:109`
- `legacy/destiny-master/meishiki.js:470`

直下版の `index.html` 内にある `calculateMeishiki` は、`meishiki.displayMeishiki()` だけを呼んでいる。

一方、`meishiki.js` 側にも別の `calculateMeishiki` があり、そこでは `displayDaiunTable` を呼ぶ。

しかしHTML内の後続スクリプトで `calculateMeishiki` が再定義されているため、直下版では `meishiki.js` 側の関数が上書きされ、大運表示が実行されていない可能性が高い。

影響:

- 大運テーブルが表示されない

優先度:

中。

### 6. `birthtime` を参照しているが、HTMLに該当入力がない

対象:

- `legacy/destiny-master/meishiki.js:533`
- `legacy/destiny-master/member/meishiki.js:691`

`meishiki.js` 内の `calculateMeishiki` は `document.getElementById('birthtime').value` を参照する。

しかし、現在の `index.html` と `member/index.html` には `birthtime` 入力がない。

ただし、HTML側で別の `calculateMeishiki` が定義されている場合、この壊れた関数は呼ばれない可能性がある。

影響:

- JS側の `calculateMeishiki` が呼ばれる構成では即エラー
- 出生時刻を使わない流派にもかかわらず、未使用コードが残っている

優先度:

低から中。

補足:

この流派では出生時刻が不要とのことなので、時刻入力がないこと自体はバグではない。問題は、HTMLに存在しない `birthtime` を読む関数が残っていること。

### 7. 時柱計算がWeb版に実装されていない

対象:

- `legacy/destiny-master/kanshi_data.js:3699`
- `legacy/destiny-master/member/Meishiki.py:143`
- `legacy/destiny-master/meishiki.js`
- `legacy/destiny-master/member/meishiki.js`

`time_kanshi` の表とPython版の `find_time_kanshi` はあるが、Web版の `Meishiki` クラスには時柱計算が入っていない。

そのため、Web版は四柱ではなく三柱表示になっている。

影響:

- 一般的な四柱推命ツールとしては不足
- ただし既存依頼では出生時刻不要の流派だったため、既存制作物としては仕様

優先度:

低。

## 低から中優先度のバグ候補

### 8. `Chart` 依存が直下版HTMLと噛み合っていない

対象:

- `legacy/destiny-master/meishiki.js:584`
- `legacy/destiny-master/index.html`

直下版の `meishiki.js` には `Chart.getChart` を使う処理がある。

しかし直下版 `index.html` には Chart.js の読み込みも `tsuhenChart` の canvas もない。

現状の直下版では、該当処理が呼ばれなければ問題にならないが、`displayDaiunTable` を呼ぶと `drawTsuhenChart` まで実行され、Chart未定義で落ちる可能性がある。

優先度:

低から中。

### 9. PDF生成は存在するが実行導線が不明確

対象:

- `legacy/destiny-master/member/index.html:248`

PDF生成関数はあるが、画面上のボタンは「印刷ボタンを削除」とコメントされており、通常UIから呼べるか不明。

影響:

- PDF機能が未使用コードになっている可能性

優先度:

低。

## 仕様確認が必要な点

以下は、コードだけでは「バグ」か「依頼者の独自仕様」か断定できない。

- 通変星を日干基準にするか年干基準にするか
- 蔵干表は `kanshi_data.js` と `member/meishiki.js` のどちらを正とするか
- 大運起算の丸めは `round` か `ceil` か
- 年運は必要だったのか
- PDFは最終納品機能だったのか

確認済み:

- Web版が出生時刻なし・三柱中心であることは、この流派では仕様

## 修正するなら優先順位

1. 表示・導線は `member` 版を正として直下版に反映する
2. `findTsuhen` はPython版・直下版の `index/indexOf` 方式へ統一する
3. 通変星基準は日干基準へ統一する
4. 蔵干表と蔵干切替方式は、依頼者指定の有無を確認して統一する
5. 日干支計算方式を統一し、対応年数を明示する
6. HTML側とJS側の `calculateMeishiki` 二重定義を解消する
7. 出生時刻を使わないため、`birthtime` 参照と時柱関連の未使用導線を削除または封印する
8. 大運・チャート・PDFの表示導線を整理する

## 新製品設計への示唆

この既存制作物の差分は、新製品側で以下を設定化・分離すべき理由になる。

- 通変星基準
- 蔵干表
- 蔵干切替方式
- 大運起算方法
- 表示テンプレート
- 独自資料化機能

ただし、新製品ではこのコードを流用しない。既存制作物は、想定される顧客別差分とバグが混ざりやすいポイントを把握するための参考資料として扱う。
