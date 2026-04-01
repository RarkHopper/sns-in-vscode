import { randomUUID } from 'node:crypto';
import type { Database } from '@sns-in-vscode/db';

export class PostWriter {
  constructor(private readonly db: Database) {}

  write(text: string, author = '@opencode-bot'): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.db.run('INSERT INTO posts (id, author, body, created_at) VALUES (?, ?, ?, ?)', [
      randomUUID(),
      author,
      trimmed,
      new Date().toISOString(),
    ]);
  }
}
