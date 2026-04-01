import type { Post, SymbolToken, TextToken, Token } from '@sns-in-vscode/domain';
import { Box, Text } from 'ink';
import React from 'react';

interface Props {
  post: Post;
  selected: boolean;
}

/** トークン列を改行で分割して行の配列に変換する。 */
function splitIntoLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    if (token.type === 'text') {
      const parts = token.text.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) lines.push([]);
        const part = parts[i];
        if (part) lines[lines.length - 1]?.push({ type: 'text', text: part });
      }
    } else {
      lines[lines.length - 1]?.push(token);
    }
  }
  return lines;
}

export function PostItem({ post, selected }: Props): React.ReactElement {
  const prefix = selected ? '▶ ' : '  ';
  const time = post.createdAt.toLocaleString('ja-JP');
  const lines = splitIntoLines(post.body.tokens());

  const bodyNodes = lines.map((lineTokens, lineIdx) =>
    React.createElement(
      Box,
      { key: lineIdx, flexDirection: 'row' },
      ...lineTokens.map((token, i) => {
        if (token.type === 'text') {
          const t = token as TextToken;
          return React.createElement(Text, { key: i }, t.text);
        }
        const t = token as SymbolToken;
        const label = t.ref.symbol ? `@${t.ref.filePath}#${t.ref.symbol}` : `@${t.ref.filePath}`;
        return React.createElement(Text, { key: i, color: 'yellow', bold: true }, label);
      }),
    ),
  );

  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      borderStyle: 'single',
      borderColor: selected ? 'cyan' : 'gray',
      paddingX: 1,
      marginBottom: 0,
    },
    React.createElement(
      Text,
      { color: selected ? 'cyan' : 'gray', dimColor: !selected },
      `${prefix}${post.author.toString()}  ${time}`,
    ),
    React.createElement(Box, { flexDirection: 'column' }, ...bodyNodes),
  );
}
