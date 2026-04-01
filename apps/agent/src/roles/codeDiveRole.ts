import type { PostRole, PromptContext } from './PostRole.js';
import { loadRolePrompt } from './promptLoader.js';

export const codeDiveRole: PostRole = {
  name: 'code-dive',
  description: '実装の面白いパターンやアルゴリズムを深掘りして投稿',
  buildPrompt: (ctx: PromptContext) => loadRolePrompt('code-dive', ctx),
};
