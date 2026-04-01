import process from 'node:process';

export function resolveDbPath(): string {
  const env = process.env['SNS_DB_PATH'];
  if (env) return env;

  const home = process.env['HOME'] ?? process.env['USERPROFILE'] ?? '.';
  return `${home}/.sns-in-vscode/sns.db`;
}

export function resolveProjectDir(): string {
  return process.env['SNS_PROJECT_DIR'] ?? process.cwd();
}
