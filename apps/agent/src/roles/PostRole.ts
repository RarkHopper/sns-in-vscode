export interface RecentPost {
  author: string;
  body: string;
}

/** opencode run に渡す前に動的に注入されるコンテキスト。 */
export interface PromptContext {
  /** 直近の投稿一覧（他投稿への反応・同調・批判に使う）。 */
  recent_posts: RecentPost[];
  /** 過去のエージェント投稿本文（重複回避用）。 */
  agent_posts: { body: string }[];
  /** リアクションロール用：反応する特定の投稿。 */
  target_post: RecentPost | null;
}

export interface PostRole {
  /** ロール識別子（投稿の author に使われる） */
  readonly name: string;
  /** ロールの説明 */
  readonly description: string;
  /**
   * opencode run に渡すプロンプトを生成する。
   * prompts/roles/<name>.md を mustache でレンダリングする。
   */
  buildPrompt(context: PromptContext): string;
}
