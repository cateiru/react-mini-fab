# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

react-mini-fab は React 向けの UI コンポーネントライブラリです。Vite を使用してビルドされ、UMD と ES モジュールの両方の形式で配布されます。

## 開発コマンド

### ビルド

```bash
# ライブラリをビルド
pnpm run build

# 開発サーバーを起動
pnpm run dev
```

### コード品質

```bash
# Biome でリント
pnpm run lint

# Biome でリント（自動修正付き）
pnpm run lint:write

# Biome でフォーマット
pnpm run format

# Biome でフォーマット（自動修正付き）
pnpm run format:write

# Biome でリントとフォーマットを同時に実行（自動修正付き）
pnpm run check:write
```

### テスト

```bash
# テストを実行
pnpm run test

# テストを UI モードで実行
pnpm run test:ui

# カバレッジ付きでテストを実行
pnpm run test:coverage
```

### Storybook

```bash
# Storybook 開発サーバーを起動（ポート 6006）
pnpm run dev:storybook

# Storybook をビルド
pnpm run build:storybook
```

## アーキテクチャ

### ディレクトリ構造

- `lib/` - ライブラリのソースコード（TypeScript/React）
  - `main.tsx` - エントリーポイント（コンポーネントを export する）
  - `*.tsx` - React コンポーネント
  - `*.story.tsx` - Storybook のストーリーファイル（コンポーネントと同じディレクトリに配置）
  - `*.module.css` - CSS Modules（PostCSS で処理される）
  - `utils/` - ユーティリティ関数とコンポーネント
- `dist/` - ビルド成果物（UMD と ES モジュール）
- `.storybook/` - Storybook の設定

### パッケージ配布

- **UMD 形式**: `dist/index.umd.cjs`（CommonJS、グローバル変数として `react-help-window` を提供）
- **ES モジュール形式**: `dist/index.js`
- **型定義ファイル**: `dist/index.d.ts`（vite-plugin-dts により自動生成）
- **ピア依存関係**: React 18.x または 19.x

### ビルド設定

- **エントリーポイント**: `lib/main.tsx`
- **外部依存**: `react` と `react-dom` はピア依存関係として扱われ、バンドルに含まれません
- **TypeScript**: 厳格モード有効、未使用の変数・パラメータチェック有効
- **PostCSS**: CSS Modules で `postcss-nested` と `autoprefixer` を使用

### コーディング規約

- **フォーマッター**: Biome（インデント: スペース、クォート: ダブル）
- **TypeScript**: `lib/` 配下のみをコンパイル対象とする
- **インポート**: Biome が自動的にインポートを整理
- **Storybook**: コンポーネントのストーリーは `*.story.tsx` という命名規則で、コンポーネントファイルと同じディレクトリに配置する

## 開発ワークフロー

**重要**: コード変更後は、必ず以下のコマンドを実行してコード品質とテストを確認してください。

```bash
# Biome でリントとフォーマットを実行（自動修正付き）
pnpm run check:write

# すべてのテストを実行
pnpm run test
```
