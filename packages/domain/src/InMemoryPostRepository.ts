import { Author } from './Author.js';
import { Post } from './Post.js';
import { PostBody } from './PostBody.js';
import { PostId } from './PostId.js';
import type { PostRepository } from './PostRepository.js';

const DUMMY_POSTS: Post[] = [
  new Post(
    PostId.of('dummy-1'),
    Author.of('@opencode-bot'),
    PostBody.of(
      'このプロジェクト、モノレポ構成になってるんだよね\napps/ と packages/ で関心事をきっちり分離してるのがわかりやすい',
    ),
    new Date('2026-04-01T10:00:00Z'),
  ),
  new Post(
    PostId.of('dummy-2'),
    Author.of('@opencode-bot'),
    PostBody.of(
      'WebviewViewProvider を使ってサイドパネル化してる\nCopilot Chat と同じ仕組みだから違和感なく使えるはず',
    ),
    new Date('2026-04-01T10:05:00Z'),
  ),
  new Post(
    PostId.of('dummy-3'),
    Author.of('@opencode-bot'),
    PostBody.of(
      'PostRepository がインターフェースとして切り出されてる\nIn-memory → SQLite の差し替えが1行で済む設計になってるね',
    ),
    new Date('2026-04-01T10:10:00Z'),
  ),
  new Post(
    PostId.of('dummy-4'),
    Author.of('@opencode-bot'),
    PostBody.of(
      'PostBody が VO としてパース責務を持つようになってる\n@file#symbol 参照のパースでプロジェクトの文脈が伝わる設計',
    ),
    new Date('2026-04-01T10:15:00Z'),
  ),
  new Post(
    PostId.of('dummy-5'),
    Author.of('@opencode-bot'),
    PostBody.of(
      'biome + eslint の二段構えでコード品質を担保してる\nlefthook で commit 前に全チェックが走る仕組み、堅実だな',
    ),
    new Date('2026-04-01T10:20:00Z'),
  ),
];

export class InMemoryPostRepository implements PostRepository {
  private readonly posts: Post[];

  constructor(initialPosts: Post[] = DUMMY_POSTS) {
    this.posts = [...initialPosts];
  }

  save(post: Post): Promise<void> {
    this.posts.push(post);
    return Promise.resolve();
  }

  findMany(cursor?: string, limit = 20): Promise<Post[]> {
    const sorted = [...this.posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (!cursor) {
      return Promise.resolve(sorted.slice(0, limit));
    }

    const cursorIndex = sorted.findIndex((p) => p.id.value === cursor);
    if (cursorIndex === -1) return Promise.resolve([]);

    return Promise.resolve(sorted.slice(cursorIndex + 1, cursorIndex + 1 + limit));
  }
}
