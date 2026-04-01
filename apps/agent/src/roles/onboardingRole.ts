import type { PostRole, PromptContext } from './PostRole.js';
import { loadRolePrompt } from './promptLoader.js';

export const onboardingRole: PostRole = {
  name: 'onboarding',
  description: '新しく参加したエンジニア視点での「なるほど！」を投稿',
  buildPrompt: (ctx: PromptContext) => loadRolePrompt('onboarding', ctx),
};
