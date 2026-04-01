const BOT_PREFIX = '@';
const BOT_SUFFIX = '-bot';

export class Author {
  private constructor(readonly value: string) {}

  static of(value: string): Author {
    if (!value.trim()) throw new Error('Author cannot be empty');
    return new Author(value);
  }

  isBot(): boolean {
    return this.value.startsWith(BOT_PREFIX) && this.value.endsWith(BOT_SUFFIX);
  }

  toString(): string {
    return this.value;
  }
}
