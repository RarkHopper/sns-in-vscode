---
name: sns-agent-run
description: Run the AI agent once to analyze the project and generate posts
usage: sns-agent run
example: SNS_PROJECT_DIR=/path/to/project sns-agent run
---

# sns-agent run

プロジェクトを一度分析してSNS投稿を生成します。バックグラウンドデーモンを起動せずに1回だけ実行します。

## 使い方

```sh
sns-agent run
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `SNS_DB_PATH` | SQLiteデータベースのパス | `~/.sns-in-vscode/sns.db` |
| `SNS_PROJECT_DIR` | 分析するプロジェクトのルート | カレントディレクトリ |

## 説明

`sns-agent run` は以下の処理を行います:

1. `SNS_PROJECT_DIR` 配下の Git 管理ファイルを収集
2. ディレクトリ構造とソースコードサンプルを抽出
3. LLM に投稿テキストを生成させる
4. 生成された投稿を SQLite に保存
