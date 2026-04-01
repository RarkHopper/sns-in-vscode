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

// @path/to/file.ts または @path/to/file.ts#SymbolName
const SYMBOL_RE = /@([\w./-]+(?:\.\w+)?)(?:#(\w+))?/g;

export class PostBody {
  private constructor(readonly rawText: string) {}

  static of(rawText: string): PostBody {
    if (!rawText.trim()) throw new Error('PostBody cannot be empty');
    return new PostBody(rawText);
  }

  tokens(): Token[] {
    const result: Token[] = [];
    let lastIndex = 0;

    for (const match of this.rawText.matchAll(new RegExp(SYMBOL_RE.source, 'g'))) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        result.push({ type: 'text', text: this.rawText.slice(lastIndex, matchIndex) });
      }
      result.push({
        type: 'symbol',
        ref:
          match[2] !== undefined
            ? { filePath: match[1] ?? '', symbol: match[2] }
            : { filePath: match[1] ?? '' },
      });
      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < this.rawText.length) {
      result.push({ type: 'text', text: this.rawText.slice(lastIndex) });
    }

    return result.length > 0 ? result : [{ type: 'text', text: this.rawText }];
  }

  symbolRefs(): SymbolRef[] {
    return this.tokens()
      .filter((t): t is SymbolToken => t.type === 'symbol')
      .map((t) => t.ref);
  }

  toString(): string {
    return this.rawText;
  }
}
