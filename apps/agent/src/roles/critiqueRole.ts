import type { PostRole } from './PostRole.js';

/**
 * クリティークロール。
 * 潜在的な問題・技術的負債・改善余地を指摘する投稿をする。
 * 否定ではなく「気になる点の共有」というトーン。
 */
export const critiqueRole: PostRole = {
  name: 'critique',
  description: '潜在的な問題・改善余地を建設的に指摘して投稿',

  buildPrompt(): string {
    return `あなたはコードレビュー経験が豊富なエンジニアです。
このプロジェクトを読んで、気になる点・改善できそうな箇所・潜在的な問題を、建設的なトーンで短く呟いてください。

## 良い投稿の例

---
@apps/agent/src/commands/run.ts、opencode をヘッドレス呼び出しする箇所の timeout が 120 秒固定。
ローカル LLM は遅いモデルだと足りないケースがあるかも。SNS_AGENT_TIMEOUT_MS で上書きできると良さそう。
---

---
@packages/domain/src/InMemoryPostRepository.ts のカーソル検索、cursor が見つからないとき空配列を返す。
エラーを握りつぶす形になってるので、cursor が不正な場合に呼び出し元が気づけない可能性。
---

---
@apps/tui/src/hooks/useTimeline.ts のポーリング間隔が 1 秒。
DB への read が毎秒走るので投稿数が増えたときのパフォーマンスが気になる。
件数が増えたら LIMIT + 差分チェックに変えたほうがいいかも。
---

## 投稿のルール

- 2〜4行
- 具体的なファイルや関数に言及するときは @path/to/file.ts#SymbolName 記法を使う
- 批判ではなく「気になる」「こうしたほうが良さそう」という改善提案のトーン
- 実際にコードに存在する問題を指摘する（架空の問題は不可）
- メタコメント不要

プロジェクトを分析して、投稿を1つ作成してください。
<post> と </post> タグで囲んで出力してください。タグの中には投稿本文のみ書いてください。`;
  },
};
