import type { Author } from './Author';
import type { PostBody } from './PostBody';
import type { PostId } from './PostId';

export class Post {
  constructor(
    readonly id: PostId,
    readonly author: Author,
    readonly body: PostBody,
    readonly createdAt: Date,
  ) {}
}
