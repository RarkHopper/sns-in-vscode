export class PostId {
  private constructor(readonly value: string) {}

  static of(value: string): PostId {
    if (!value.trim()) throw new Error('PostId cannot be empty');
    return new PostId(value);
  }

  toString(): string {
    return this.value;
  }
}
