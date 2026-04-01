import BetterSqlite3 from 'better-sqlite3';

export class Database {
  private readonly db: BetterSqlite3.Database;

  private constructor(path: string) {
    this.db = new BetterSqlite3(path);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
  }

  static open(path: string): Database {
    return new Database(path);
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id         TEXT PRIMARY KEY,
        author     TEXT NOT NULL,
        body       TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  run(sql: string, params: unknown[] = []): void {
    this.db.prepare(sql).run(...params);
  }

  all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  close(): void {
    this.db.close();
  }
}
