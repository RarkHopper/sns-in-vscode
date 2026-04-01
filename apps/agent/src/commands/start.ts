import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { resolveDbPath } from '../utils.js';
import { runOnce } from './run.js';

const DEFAULT_INTERVAL_MS = 10 * 60 * 1_000; // 10 min

export async function startDaemon(_args: string[]): Promise<void> {
  const intervalMs =
    Number.parseInt(process.env['SNS_INTERVAL_MS'] ?? '', 10) || DEFAULT_INTERVAL_MS;

  const pidFile = join(resolveDbPath(), '..', 'agent.pid');
  writeFileSync(pidFile, String(process.pid), 'utf8');

  console.log(
    `[agent] Starting daemon (interval: ${String(intervalMs / 1000)}s, PID: ${String(process.pid)})`,
  );
  console.log(`[agent] PID written to: ${pidFile}`);

  const loop = async (): Promise<void> => {
    try {
      await runOnce([]);
    } catch (err) {
      console.error('[agent] Error during run:', err);
    }
    setTimeout(() => void loop(), intervalMs);
  };

  await loop();
}
