import { Database } from '@sns-in-vscode/db';
import { OpenCodeDriver } from '../OpenCodeDriver.js';
import { PostWriter } from '../PostWriter.js';
import { pickRole } from '../roles/index.js';
import { resolveDbPath, resolveProjectDir } from '../utils.js';

export async function runOnce(_args: string[]): Promise<void> {
  const projectDir = resolveProjectDir();
  const dbPath = resolveDbPath();

  const role = pickRole();
  console.log(`[agent] role=${role.name} project=${projectDir}`);

  const driver = new OpenCodeDriver({ projectDir });
  const text = await driver.complete(role.buildPrompt());

  const db = Database.open(dbPath);
  new PostWriter(db).write(text, `@${role.name}-bot`);
  db.close();

  console.log(`[agent] posted as @${role.name}-bot:`);
  console.log(text);
}
