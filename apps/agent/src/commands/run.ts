import { Database } from '@sns-in-vscode/db';
import { OpenCodeDriver } from '../OpenCodeDriver.js';
import { PostWriter } from '../PostWriter.js';
import { pickRole, reactionRole } from '../roles/index.js';
import type { PostRole, PromptContext, RecentPost } from '../roles/PostRole.js';
import { resolveDbPath, resolveProjectDir } from '../utils.js';

/** DB から直近 N 件の投稿を取得してコンテキストを構築する。 */
function buildContext(db: Database, limit = 10): PromptContext {
  const rows = db.all<{ author: string; body: string }>(
    'SELECT author, body FROM posts ORDER BY created_at DESC LIMIT ?',
    [limit],
  );

  const recent_posts: RecentPost[] = rows.map((r) => ({ author: r.author, body: r.body }));
  const agent_posts = recent_posts
    .filter((r) => r.author.endsWith('-bot'))
    .map((r) => ({ body: r.body }));

  return { recent_posts, agent_posts, target_post: null };
}

/** reaction ロールを使う確率。非ボット投稿が存在する場合のみ有効。 */
const REACTION_PROB = 0.3;

export async function runOnce(_args: string[]): Promise<void> {
  const projectDir = resolveProjectDir();
  const dbPath = resolveDbPath();

  const db = Database.open(dbPath);
  const ctx = buildContext(db);

  // 非ボット投稿が存在し、確率的に reaction ロールを使う
  const nonBotPosts = ctx.recent_posts.filter((p) => !p.author.endsWith('-bot'));
  const useReaction = nonBotPosts.length > 0 && Math.random() < REACTION_PROB;

  let role: PostRole;
  if (useReaction) {
    role = reactionRole;
    const target = nonBotPosts[Math.floor(Math.random() * nonBotPosts.length)];
    ctx.target_post = target ?? null;
  } else {
    role = pickRole();
  }

  console.log(`[agent] role=${role.name} project=${projectDir}`);

  const driver = new OpenCodeDriver({ projectDir });
  const text = await driver.complete(role.buildPrompt(ctx));

  new PostWriter(db).write(text, `@${role.name}-bot`);
  db.close();

  console.log(`[agent] posted as @${role.name}-bot`);
}
