import process from 'node:process';
import { Database } from '@sns-in-vscode/db';
import { hasFlag, parseFlag, resolveDbPath } from '../utils.js';

interface PostRow {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

export function runTimeline(args: string[]): void {
  if (hasFlag(args, '--help', '-h')) {
    console.log('Usage: sns timeline [--limit N] [--format json|text]');
    return;
  }

  const limitStr = parseFlag(args, '--limit');
  const limit = limitStr ? Math.max(1, Number.parseInt(limitStr, 10)) : 20;
  const format = parseFlag(args, '--format') ?? 'text';

  if (format !== 'json' && format !== 'text') {
    console.error(`Unknown format: ${format}. Use 'json' or 'text'.`);
    process.exit(1);
  }

  const db = Database.open(resolveDbPath());
  const rows = db.all<PostRow>(
    'SELECT id, author, body, created_at FROM posts ORDER BY created_at DESC LIMIT ?',
    [limit],
  );
  db.close();

  if (format === 'json') {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log('(no posts yet)');
    return;
  }

  for (const row of rows) {
    const time = new Date(row.created_at).toLocaleString('ja-JP');
    console.log(`[${time}] ${row.author}`);
    console.log(row.body);
    console.log();
  }
}
