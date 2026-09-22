# oto-data/recipe-app

家族のためのレシピを登録・検索・整理する、個人向けのレシピ管理アプリです。スマートフォンでも読みやすいレスポンシブな画面で、料理名や材料、タグからレシピを探せます。

## 技術構成

- **Next.js 15.2.1**（App Router）
- **React 18.3.1**
- **TypeScript 5.6**
- **Tailwind CSS 3.4**
- **Prisma 5.18 / Prisma Client**
- **SQLite**
- **lucide-react**（アイコン）

## 主な機能

- レシピの登録、一覧表示、詳細表示、編集、削除
- 料理名・説明・材料・タグを対象にしたキーワード検索
- 複数タグによる絞り込み
- カテゴリ、所要時間、分量、メモ、材料、調理手順の管理
- レシピのお気に入り登録
- Cookpadの人気レシピランキング（アプリ内データ）の表示
- レシピ操作用のAPI（`/api/recipes`、`/api/recipes/[id]`）

## ディレクトリ構成

```text
.
├── app/
│   ├── api/recipes/          # レシピのAPI Route
│   ├── cookpad/              # Cookpadランキング画面
│   ├── recipes/              # レシピ一覧・詳細・新規作成・編集画面
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウトとメタデータ
│   └── page.tsx              # トップ画面
├── components/               # レシピカード、フォーム、一覧などのUI
├── lib/
│   ├── cookpad.ts            # ランキング表示用データ
│   ├── prisma.ts             # Prisma Clientの共有インスタンス
│   └── recipes.ts            # レシピ型、カテゴリ、タグ
├── prisma/
│   ├── schema.prisma         # SQLite用のPrismaスキーマ
│   └── migrations/           # Prismaマイグレーション
├── package.json
└── tsconfig.json
```

## セットアップ

Node.js（LTS推奨）とnpmを用意してください。

```bash
npm install
npx prisma db push
npm run dev
```

開発サーバー起動後、[http://localhost:3000](http://localhost:3000) を開いてください。

`npx prisma db push` は、`prisma/schema.prisma`の定義をローカルのSQLiteデータベースへ反映します。データベースは`prisma/dev.db`として作成・利用されます。スキーマ変更後も、開発環境では同じコマンドでデータベースを同期できます。

## 環境変数

通常のローカル開発で必須の環境変数はありません。SQLiteの接続先は`prisma/schema.prisma`に次のように定義されています。

```prisma
url = "file:./dev.db"
```

`.env`や`.env.local`を使う場合は、これらのファイルをコミットしないでください。APIキーなどの外部サービス用シークレットを追加する場合も、環境変数で管理し、READMEやソースコードに直接記載しないでください。

## 注意点

- このアプリはローカルSQLiteを利用する構成です。本番運用や複数ユーザーでの利用では、データベースの保存先・バックアップ・同時更新への対応を別途検討してください。
- `prisma/dev.db`は開発用データです。スキーマを変更する場合は、既存データへの影響を確認してから`prisma db push`を実行してください。
- Cookpadランキングは`lib/cookpad.ts`に定義された表示用データです。外部サイトからリアルタイム取得する機能ではありません。
- `life/`はこのリポジトリの対象外です。生活管理機能は別リポジトリで管理する想定で、このアプリには含まれません。
