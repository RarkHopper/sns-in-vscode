import type { LLMClient } from './LLMClient.js';

const MOCK_POSTS = [
  'このプロジェクト、モノレポ構成がシンプルで良い。\napps/ と packages/ の分離がきれいだね。',
  '@apps/vscode-extension/src/domain/PostBody.ts#tokens を見ると\n@file#symbol のパースロジックが丁寧に実装されている。',
  'SQLiteのWALモードを使っているのが地味に良い選択。\n書き込みと読み込みが並行できるので拡張しやすい。',
  'IntersectionObserver で無限スクロールを実装しているのはシンプルで好み。\npolling より効率的だし実装量も少ない。',
  'postMessage プロトコルが型安全なのは良い設計。\nExtensionMessage と WebviewMessage で送受信を明確に分離している。',
];

export class MockLLMClient implements LLMClient {
  private index = 0;

  complete(_prompt: string): Promise<string> {
    const post = MOCK_POSTS[this.index % MOCK_POSTS.length] ?? MOCK_POSTS[0] ?? '';
    this.index++;
    return Promise.resolve(post);
  }
}
