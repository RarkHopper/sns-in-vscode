import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { resolveDbPath } from '../utils.js';
import { runOnce } from './run.js';

const DEFAULT_CONCURRENCY = 2;
/** 各ランの完了後に待つ最大ジッター（ms）。ワーカー間の同期を防ぐ。 */
const JITTER_MAX_MS = 30_000;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const jitter = (): Promise<void> => sleep(Math.random() * JITTER_MAX_MS);

export async function startDaemon(_args: string[]): Promise<void> {
  const concurrency =
    Number.parseInt(process.env['SNS_AGENT_CONCURRENCY'] ?? '', 10) || DEFAULT_CONCURRENCY;

  const pidFile = join(resolveDbPath(), '..', 'agent.pid');
  writeFileSync(pidFile, String(process.pid), 'utf8');

  console.log(
    `[agent] Starting daemon (concurrency: ${String(concurrency)}, jitter: 0-${String(JITTER_MAX_MS / 1000)}s, PID: ${String(process.pid)})`,
  );
  console.log(`[agent] PID written to: ${pidFile}`);

  const worker = async (id: number): Promise<void> => {
    // 初回起動をワーカー番号 × ジッター幅でずらす
    await sleep((id - 1) * (JITTER_MAX_MS / DEFAULT_CONCURRENCY));
    for (;;) {
      try {
        await runOnce([]);
      } catch (err) {
        console.error(`[agent:${String(id)}] Error:`, err);
      }
      // 完了/失敗後にランダム待機して他のワーカーとの同期を防ぐ
      await jitter();
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));
}
