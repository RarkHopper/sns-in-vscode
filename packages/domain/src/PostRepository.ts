import type { Post } from './Post.js';

export interface PostRepository {
  save(post: Post): Promise<void>;
  findMany(cursor?: string, limit?: number): Promise<Post[]>;
}
