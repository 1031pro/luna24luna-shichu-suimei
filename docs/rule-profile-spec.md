# 流派対応設定項目

## 目的

新規アプリでは、占術ルールをコードに直書きしない。

顧客ごとの流派・先生の方式・表示方針を `ruleProfile` として設定化し、同じ計算エンジンから複数案件に対応できるようにする。

## 設定項目

### 基本

```json
{
  "profileId": "default",
  "profileName": "標準設定",
  "description": "一般的な日干基準の四柱推命設定"
}
```

### 入力・時刻

```json
{
  "birthTime": {
    "enabled": true,
    "required": false,
    "unknownTimeMode": "hide_time_pillar"
  }
}
```

設定候補:

- `enabled`: 出生時刻入力を使うか
- `required`: 必須入力にするか
- `unknownTimeMode`: 時刻不明時の扱い

候補値:

- `hide_time_pillar`
- `show_blank_time_pillar`
- `use_noon`

### 通変星

```json
{
  "tenGods": {
    "baseStem": "day",
    "showHeavenlyStemTenGods": true,
    "showHiddenStemTenGods": true
  }
}
```

標準は日干基準。

候補値:

- `day`: 日干基準
- `year`: 年干基準
- `custom`: 独自基準

`year` は標準では使わない。顧客が明示した場合だけ採用する。

### 蔵干

```json
{
  "hiddenStems": {
    "table": "standard",
    "switchingMethod": "setsuiri_elapsed_days",
    "showAllHiddenStems": false,
    "showMainHiddenStemOnly": true
  }
}
```

設定候補:

- 蔵干表
- 節入り後の日数による切替
- 代表蔵干だけ表示するか
- 複数蔵干を全部表示するか

### 大運

```json
{
  "majorLuck": {
    "enabled": true,
    "directionBase": "yearStemAndSex",
    "startAgeRounding": "ceil",
    "includeBirthDayInPreviousSetsuiriDiff": true,
    "firstLuckStartsFromMonthPillar": true,
    "maxDisplayAge": 100
  }
}
```

設定候補:

- 順逆判定方式
- 起運年齢の丸め方式
- 前節入り日数に誕生日を含めるか
- 月柱干支から開始するか、次干支から開始するか
- 表示上限年齢

丸め候補:

- `ceil`
- `round`
- `floor`

### 年運

```json
{
  "annualLuck": {
    "enabled": true,
    "startYearMode": "birthYear",
    "displayYears": 120,
    "highlightCurrentYear": true
  }
}
```

### 表示

```json
{
  "display": {
    "pillarOrder": "day_month_year_time",
    "showFiveElements": true,
    "showYinYang": true,
    "showVoid": true,
    "showCurrentMajorLuck": true,
    "showCurrentAnnualLuck": true
  }
}
```

柱順候補:

- `year_month_day_time`
- `day_month_year_time`

既存制作物は日・月・年の順で表示している。新製品では顧客ごとに切り替えられるようにする。

## 標準プロファイル

ここでいう標準は、流派の絶対的な正解という意味ではない。

新規制作時の初期値として、もっとも一般的に説明されることが多い四柱推命の扱いを採用する。

標準では以下を採用する。

- 通変星は日干基準
- 出生時刻は入力可能
- 時刻不明時は時柱を非表示
- 蔵干は標準表
- 大運は表示
- 年運は表示
- スマホ縦スクロールで見やすくする

### 標準プロファイル詳細

```json
{
  "profileId": "general-default",
  "profileName": "一般標準設定",
  "birthTime": {
    "enabled": true,
    "required": false,
    "unknownTimeMode": "hide_time_pillar"
  },
  "calendar": {
    "monthBoundary": "setsuiri",
    "setsuiriDataSource": "naoj_generated_static_data",
    "timezone": "Asia/Tokyo"
  },
  "tenGods": {
    "baseStem": "day",
    "showHeavenlyStemTenGods": true,
    "showHiddenStemTenGods": true
  },
  "hiddenStems": {
    "table": "standard",
    "switchingMethod": "setsuiri_elapsed_days",
    "showAllHiddenStems": false,
    "showMainHiddenStemOnly": true
  },
  "majorLuck": {
    "enabled": true,
    "directionBase": "yearStemAndSex",
    "startAgeRounding": "ceil",
    "firstLuckStartsFromMonthPillar": true,
    "maxDisplayAge": 100
  },
  "annualLuck": {
    "enabled": true,
    "highlightCurrentYear": true
  },
  "display": {
    "pillarOrder": "year_month_day_time",
    "showFiveElements": true,
    "showYinYang": true,
    "showVoid": true,
    "showCurrentMajorLuck": true,
    "showCurrentAnnualLuck": true
  }
}
```

### 標準に入れないもの

以下は流派差分・顧客指定として扱う。

- 年干基準の通変星
- 出生時刻を完全に使わない方式
- 真太陽時補正
- 早子時・夜子時
- 独自蔵干表
- 独自大運起算
- 身旺身弱
- 用神・喜忌
- 格局判定

理由:

これらは流派差分や先生ごとの判断差が大きく、最初から標準に入れると商品仕様が膨らみすぎるため。

## 独自流派プロファイル

顧客から指定がある場合だけ、以下を変更する。

- 出生時刻不要
- 時柱非表示
- 蔵干表変更
- 通変星基準変更
- 大運起算変更
- 表示項目名変更
- 独自チャート追加

この場合はライトプランではなく、スタンダード以上またはオプション扱いにする。
