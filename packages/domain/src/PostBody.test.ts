import { describe, expect, it } from 'vitest';
import { PostBody } from './PostBody.js';

describe('PostBody.tokens()', () => {
  it('プレーンテキストは TextToken 1つ', () => {
    const body = PostBody.of('こんにちは');
    expect(body.tokens()).toEqual([{ type: 'text', text: 'こんにちは' }]);
  });

  it('@file のみ（シンボルなし）をパース', () => {
    const body = PostBody.of('@src/index.ts を見てみよう');
    const tokens = body.tokens();
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toEqual({
      type: 'symbol',
      ref: { filePath: 'src/index.ts' },
    });
    expect(tokens[1]).toEqual({ type: 'text', text: ' を見てみよう' });
  });

  it('@file#symbol をパース', () => {
    const body = PostBody.of('@src/auth.ts#login が面白い');
    const tokens = body.tokens();
    expect(tokens[0]).toEqual({
      type: 'symbol',
      ref: { filePath: 'src/auth.ts', symbol: 'login' },
    });
    expect(tokens[1]).toEqual({ type: 'text', text: ' が面白い' });
  });

  it('通常テキストとシンボルが混在する', () => {
    const body = PostBody.of('見て、@foo/bar.ts#Baz と @qux.ts の2つ');
    const tokens = body.tokens();
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toEqual({ type: 'text', text: '見て、' });
    expect(tokens[1]).toMatchObject({
      type: 'symbol',
      ref: { filePath: 'foo/bar.ts', symbol: 'Baz' },
    });
    expect(tokens[2]).toEqual({ type: 'text', text: ' と ' });
    expect(tokens[3]).toMatchObject({
      type: 'symbol',
      ref: { filePath: 'qux.ts' },
    });
    expect(tokens[4]).toEqual({ type: 'text', text: ' の2つ' });
  });

  it('シンボルなしテキストは空配列を返さない', () => {
    const body = PostBody.of('普通のテキスト');
    expect(body.tokens()).toHaveLength(1);
  });
});

describe('PostBody.symbolRefs()', () => {
  it('シンボル参照のみ返す', () => {
    const body = PostBody.of('テキスト @src/a.ts#Foo テキスト @src/b.ts テキスト');
    const refs = body.symbolRefs();
    expect(refs).toHaveLength(2);
    expect(refs[0]).toEqual({ filePath: 'src/a.ts', symbol: 'Foo' });
    expect(refs[1]).toEqual({ filePath: 'src/b.ts' });
  });

  it('シンボルなしは空配列', () => {
    const body = PostBody.of('普通のテキスト');
    expect(body.symbolRefs()).toHaveLength(0);
  });
});
