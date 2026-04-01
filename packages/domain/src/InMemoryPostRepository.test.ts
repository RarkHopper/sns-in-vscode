import { describe, expect, it } from 'vitest';
import { Author } from './Author.js';
import { InMemoryPostRepository } from './InMemoryPostRepository.js';
import { Post } from './Post.js';
import { PostBody } from './PostBody.js';
import { PostId } from './PostId.js';

function makePost(id: string, offsetMs = 0): Post {
  return new Post(
    PostId.of(id),
    Author.of('@opencode-bot'),
    PostBody.of('テスト投稿'),
    new Date(1000 + offsetMs),
  );
}

describe('InMemoryPostRepository', () => {
  it('初期ダミーデータが findMany で返ってくる', async () => {
    const repo = new InMemoryPostRepository();
    const posts = await repo.findMany();
    expect(posts.length).toBeGreaterThan(0);
  });

  it('save した投稿が findMany に含まれる', async () => {
    const repo = new InMemoryPostRepository([]);
    const post = makePost('test-1');
    await repo.save(post);
    const posts = await repo.findMany();
    expect(posts[0]?.id.value).toBe('test-1');
  });

  it('findMany は新しい順で返す', async () => {
    const repo = new InMemoryPostRepository([makePost('old', 0), makePost('new', 1000)]);
    const posts = await repo.findMany();
    expect(posts[0]?.id.value).toBe('new');
    expect(posts[1]?.id.value).toBe('old');
  });

  it('limit で件数を絞れる', async () => {
    const repo = new InMemoryPostRepository([
      makePost('a', 0),
      makePost('b', 1000),
      makePost('c', 2000),
    ]);
    const posts = await repo.findMany(undefined, 2);
    expect(posts).toHaveLength(2);
  });

  it('cursor を渡すとその続きを返す', async () => {
    const repo = new InMemoryPostRepository([
      makePost('a', 0),
      makePost('b', 1000),
      makePost('c', 2000),
    ]);
    // 新しい順: c, b, a  → cursor=b の続きは a
    const posts = await repo.findMany('b', 10);
    expect(posts).toHaveLength(1);
    expect(posts[0]?.id.value).toBe('a');
  });

  it('存在しない cursor は空配列を返す', async () => {
    const repo = new InMemoryPostRepository([makePost('a', 0)]);
    const posts = await repo.findMany('not-exist');
    expect(posts).toHaveLength(0);
  });
});
