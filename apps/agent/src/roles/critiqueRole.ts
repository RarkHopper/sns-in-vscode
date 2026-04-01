import type { PostRole, PromptContext } from './PostRole.js';
import { loadRolePrompt } from './promptLoader.js';

export const critiqueRole: PostRole = {
  name: 'critique',
  description: '潜在的な問題・改善余地を建設的に指摘して投稿',
  buildPrompt: (ctx: PromptContext) => loadRolePrompt('critique', ctx),
};
