import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { resolveDbPath } from '../utils.js';
import { runOnce } from './run.js';

const DEFAULT_CONCURRENCY = 4;

export async function startDaemon(_args: string[]): Promise<void> {
  const concurrency =
    Number.parseInt(process.env['SNS_AGENT_CONCURRENCY'] ?? '', 10) || DEFAULT_CONCURRENCY;

  const pidFile = join(resolveDbPath(), '..', 'agent.pid');
  writeFileSync(pidFile, String(process.pid), 'utf8');

  console.log(
    `[agent] Starting daemon (concurrency: ${String(concurrency)}, PID: ${String(process.pid)})`,
  );
  console.log(`[agent] PID written to: ${pidFile}`);

  /** 1ワーカー: 完了次第すぐ次を実行し続ける。 */
  const worker = async (id: number): Promise<void> => {
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
