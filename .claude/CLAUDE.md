# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

react-help-window は React 向けの UI コンポーネントライブラリです。Vite を使用してビルドされ、UMD と ES モジュールの両方の形式で配布されます。

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

# Biome でフォーマット
pnpm run format

# Biome でリントとフォーマットを同時に実行（自動修正付き）
pnpm run check
```

## アーキテクチャ

### ディレクトリ構造

- `lib/` - ライブラリのソースコード（TypeScript/React）
  - `main.tsx` - エントリーポイント
  - `utils/` - ユーティリティ関数
  - `*.module.css` - CSS Modules（PostCSS で処理される）
- `dist/` - ビルド成果物（UMD と ES モジュール）

### ビルド設定

- **エントリーポイント**: `lib/main.tsx`
- **外部依存**: `react` と `react-dom` はピア依存関係として扱われ、バンドルに含まれません
- **TypeScript**: 厳格モード有効、未使用の変数・パラメータチェック有効
- **PostCSS**: CSS Modules で `postcss-nested` と `autoprefixer` を使用

### コーディング規約

- **フォーマッター**: Biome（インデント: スペース、クォート: ダブル）
- **TypeScript**: `lib/` 配下のみをコンパイル対象とする
- **インポート**: Biome が自動的にインポートを整理
