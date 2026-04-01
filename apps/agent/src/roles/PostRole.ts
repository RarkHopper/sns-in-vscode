export interface PostRole {
  /** ロール識別子（投稿の author に使われる） */
  readonly name: string;
  /** ロールの説明 */
  readonly description: string;
  /**
   * opencode run に渡すプロンプトを生成する。
   * few-shot 例を含み、<post>...</post> タグで囲んだ出力を要求する。
   */
  buildPrompt(): string;
}
