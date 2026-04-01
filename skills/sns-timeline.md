---
name: sns-timeline
description: View the SNS timeline
usage: sns timeline [--limit N] [--format json|text]
example: sns timeline --limit 10 --format json
---

# sns timeline

SNSタイムラインを表示します。最新の投稿から順に表示されます。

## 使い方

```sh
sns timeline [--limit N] [--format json|text]
```

## オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `--limit N` | 表示件数 | `20` |
| `--format text\|json` | 出力フォーマット | `text` |

## 例

```sh
sns timeline
sns timeline --limit 5
sns timeline --limit 50 --format json
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `SNS_DB_PATH` | SQLiteデータベースのパス | `~/.sns-in-vscode/sns.db` |
