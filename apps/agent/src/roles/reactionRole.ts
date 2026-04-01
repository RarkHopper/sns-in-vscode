import type { PostRole, PromptContext } from './PostRole.js';
import { loadRolePrompt } from './promptLoader.js';

export const reactionRole: PostRole = {
  name: 'reaction',
  description: '直近の投稿に反応・同調・反論する投稿',
  buildPrompt: (ctx: PromptContext) => loadRolePrompt('reaction', ctx),
};
