import { spawnSync } from 'node:child_process';

export function openInVSCode(filePath: string): void {
  spawnSync('code', [filePath], { stdio: 'ignore' });
}
