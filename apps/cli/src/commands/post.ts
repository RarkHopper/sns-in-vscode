import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { Database } from '@sns-in-vscode/db';
import { hasFlag, resolveDbPath } from '../utils.js';

export function runPost(args: string[]): void {
  if (hasFlag(args, '--help', '-h')) {
    console.log('Usage: sns post "<text>"');
    return;
  }

  const text = args.join(' ').trim();
  if (!text) {
    console.error('Error: post text is required');
    process.exit(1);
  }

  const db = Database.open(resolveDbPath());
  db.run('INSERT INTO posts (id, author, body, created_at) VALUES (?, ?, ?, ?)', [
    randomUUID(),
    '@user',
    text,
    new Date().toISOString(),
  ]);
  db.close();

  console.log('Posted.');
}
