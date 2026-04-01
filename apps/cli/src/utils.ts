import process from 'node:process';

export function printHelp(): void {
  console.log(`sns — SNS in VS Code CLI

Usage:
  sns post "<text>"                  Post a message
  sns timeline [--limit N]           Show timeline (default: 20)
               [--format json|text]

Options:
  -h, --help   Show this help
`);
}

export function resolveDbPath(): string {
  // biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature
  const env = process.env['SNS_DB_PATH'];
  if (env) return env;

  // biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature
  const home = process.env['HOME'] ?? process.env['USERPROFILE'] ?? '.';
  return `${home}/.sns-in-vscode/sns.db`;
}

export function parseFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

export function hasFlag(args: string[], ...flags: string[]): boolean {
  return flags.some((f) => args.includes(f));
}
