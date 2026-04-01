export interface TextToken {
  type: 'text';
  text: string;
}
export interface SymbolRef {
  filePath: string;
  symbol?: string;
}
export interface SymbolToken {
  type: 'symbol';
  ref: SymbolRef;
}
export type Token = TextToken | SymbolToken;

export class PostBody {
  private constructor(readonly rawText: string) {}

  static of(rawText: string): PostBody {
    if (!rawText.trim()) throw new Error('PostBody cannot be empty');
    return new PostBody(rawText);
  }

  // Step 13 で正規表現パース実装に置き換える
  tokens(): Token[] {
    return [{ type: 'text', text: this.rawText }];
  }

  symbolRefs(): SymbolRef[] {
    return [];
  }

  toString(): string {
    return this.rawText;
  }
}
