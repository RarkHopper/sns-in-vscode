import type { Database } from '@sns-in-vscode/db';
import { Author } from './Author.js';
import { Post } from './Post.js';
import { PostBody } from './PostBody.js';
import { PostId } from './PostId.js';
import type { PostRepository } from './PostRepository.js';

interface PostRow {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

export class SqlitePostRepository implements PostRepository {
  constructor(private readonly db: Database) {}

  save(post: Post): Promise<void> {
    this.db.run('INSERT OR REPLACE INTO posts (id, author, body, created_at) VALUES (?, ?, ?, ?)', [
      post.id.toString(),
      post.author.toString(),
      post.body.toString(),
      post.createdAt.toISOString(),
    ]);
    return Promise.resolve();
  }

  findMany(cursor?: string, limit = 20): Promise<Post[]> {
    let rows: PostRow[];

    if (!cursor) {
      rows = this.db.all<PostRow>('SELECT * FROM posts ORDER BY created_at DESC LIMIT ?', [limit]);
    } else {
      rows = this.db.all<PostRow>(
        `SELECT * FROM posts
         WHERE created_at < (SELECT created_at FROM posts WHERE id = ?)
         ORDER BY created_at DESC
         LIMIT ?`,
        [cursor, limit],
      );
    }

    return Promise.resolve(rows.map(rowToPost));
  }
}

function rowToPost(row: PostRow): Post {
  return new Post(
    PostId.of(row.id),
    Author.of(row.author),
    PostBody.of(row.body),
    new Date(row.created_at),
  );
}
