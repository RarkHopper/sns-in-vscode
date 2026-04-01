import type { PostRole, PromptContext } from './PostRole.js';
import { loadRolePrompt } from './promptLoader.js';

export const architectRole: PostRole = {
  name: 'architect',
  description: 'アーキテクチャの視点から設計上の面白い判断を投稿',
  buildPrompt: (ctx: PromptContext) => loadRolePrompt('architect', ctx),
};
