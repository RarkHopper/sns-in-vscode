import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { resolveDbPath } from '../utils.js';
import { runOnce } from './run.js';

const DEFAULT_CONCURRENCY = 2;
/** ワーカー起動間隔（ms）。投稿が一度に集中しないようスタッガーをかける。 */
const STAGGER_MS = 10_000;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function startDaemon(_args: string[]): Promise<void> {
  const concurrency =
    Number.parseInt(process.env['SNS_AGENT_CONCURRENCY'] ?? '', 10) || DEFAULT_CONCURRENCY;

  const pidFile = join(resolveDbPath(), '..', 'agent.pid');
  writeFileSync(pidFile, String(process.pid), 'utf8');

  console.log(
    `[agent] Starting daemon (concurrency: ${String(concurrency)}, stagger: ${String(STAGGER_MS / 1000)}s, PID: ${String(process.pid)})`,
  );
  console.log(`[agent] PID written to: ${pidFile}`);

  /** 1ワーカー: 完了次第すぐ次を実行し続ける。 */
  const worker = async (id: number): Promise<void> => {
    // 起動タイミングをずらして投稿が一度に集中しないようにする
    if (id > 1) await sleep((id - 1) * STAGGER_MS);
    for (;;) {
      try {
        await runOnce([]);
      } catch (err) {
        console.error(`[agent:${String(id)}] Error:`, err);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));
}
