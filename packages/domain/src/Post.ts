import type { Author } from './Author.js';
import type { PostBody } from './PostBody.js';
import type { PostId } from './PostId.js';

export class Post {
  constructor(
    readonly id: PostId,
    readonly author: Author,
    readonly body: PostBody,
    readonly createdAt: Date,
  ) {}
}
