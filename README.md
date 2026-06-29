# 四柱推命 命式ツール商品化プロジェクト

## 目的

占い師・鑑定士向けに、スマホから使える四柱推命の命式表示Webアプリを制作サービスとして商品化する。

このプロジェクトの中心は、AI鑑定文生成ではなく、鑑定者本人の流派・鑑定手順・表示したい項目に合わせた「仕事道具」を作ること。

## 商品コンセプト

あなたの流派・鑑定スタイルに合わせた、スマホ対応の四柱推命命式ツールを制作します。

無料サイトや汎用ツールでは合わない表示項目、蔵干、大運、年運、独自項目を、鑑定者ごとの実務に合わせて調整できる形を目指す。

## 想定ユーザー

- ココナラで四柱推命鑑定をしている占い師
- 対面・電話・チャット鑑定で命式を頻繁に確認する鑑定者
- 自分の流派や先生の教えに合う命式ツールが欲しい人
- 鑑定書や講座資料の作成を効率化したい人
- 無料サイトの計算・表示項目に不満がある人

## MVP

最初のMVPは「命式表示 + 大運・年運表示 + スマホ対応」まで。

鑑定文、PDF鑑定書、AI生成、管理画面、流派別高度カスタマイズは追加オプションとして扱う。

## 重要方針

- 既存制作物のコードを新製品の土台にはしない
- 既存制作物は、将来対応すべき独自ルール・独自表示の参考サンプルとして扱う
- 命式計算ロジックと表示UIを分離する
- 流派差分になりやすいルールは設定化する
- 複雑な判定は将来的にプラグイン化できるようにする
- 鑑定文は基本機能に含めず、オプションとして追加する
- ライトプランでも占い師が実務で使える最低限の情報を出す
- PWA対応を標準にし、スマホのホーム画面からアプリ風に使える状態にする

## ドキュメント

- [ココナラ出品画像素材](assets/coconala-images/README.md)
- [商品プラン](docs/product-plan.md)
- [MVP機能仕様](docs/mvp-spec.md)
- [ライトプラン確定仕様](docs/light-plan-spec.md)
- [柔軟化アーキテクチャ](docs/flexible-architecture.md)
- [流派対応設定項目](docs/rule-profile-spec.md)
- [実装ロードマップ](docs/implementation-roadmap.md)
- [ココナラ出品メモ](docs/coconala-listing-memo.md)
- [ココナラ出品文 完成案](docs/coconala-listing-ready.md)
- [ココナラ出品画像 10枚構成](docs/coconala-sales-images-plan.md)
- [image2.0用 出品画像プロンプト](docs/coconala-sales-image-prompts.md)
- [競合参考: ココナラ services/2005453](docs/competitor-2005453-benchmark.md)
- [他占術ツール販売 市場調査](docs/fortune-tool-market-research.md)
- [販売プラン設計](docs/sales-package.md)
- [商品化の次ステップ](docs/productization-next-steps.md)
- [受注時ヒアリングシート](docs/client-customization-intake.md)
- [納品ワークフロー](docs/delivery-workflow.md)
- [節入りデータ方針](docs/setsuiri-data-policy.md)
- [既存アプリ診断チェックリスト](docs/existing-app-audit-checklist.md)
- [既存制作物 初回診断](docs/legacy-initial-audit.md)
- [既存制作物 バグ監査](docs/legacy-bug-audit.md)
