import { Database } from '@sns-in-vscode/db';
import type { LLMClient } from '../LLMClient.js';
import { MockLLMClient } from '../MockLLMClient.js';
import { PostWriter } from '../PostWriter.js';
import { ProjectCollector } from '../ProjectCollector.js';
import { loadPrompt } from '../promptLoader.js';
import { resolveDbPath, resolveProjectDir } from '../utils.js';

export async function runOnce(_args: string[]): Promise<void> {
  const projectDir = resolveProjectDir();
  const dbPath = resolveDbPath();

  console.log(`[agent] Analyzing project: ${projectDir}`);
  const collector = new ProjectCollector(projectDir);
  const info = collector.collect();

  const client: LLMClient = new MockLLMClient();
  const prompt = loadPrompt('analyze-project', {
    projectDir: info.projectDir,
    tree: info.tree,
    samples: info.samples,
  });

  console.log('[agent] Generating post…');
  const text = await client.complete(prompt);

  const db = Database.open(dbPath);
  const writer = new PostWriter(db);
  writer.write(text);
  db.close();

  console.log('[agent] Posted:');
  console.log(text);
}
