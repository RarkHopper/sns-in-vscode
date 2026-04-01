import type { Post, SymbolToken, TextToken } from '@sns-in-vscode/domain';
import { Box, Text } from 'ink';
import React from 'react';

interface Props {
  post: Post;
  selected: boolean;
}

export function PostItem({ post, selected }: Props): React.ReactElement {
  const prefix = selected ? '▶ ' : '  ';
  const time = post.createdAt.toLocaleString('ja-JP');

  const tokenNodes = post.body.tokens().map((token, i) => {
    if (token.type === 'text') {
      const t = token as TextToken;
      return React.createElement(Text, { key: i }, t.text);
    }
    const t = token as SymbolToken;
    const label = t.ref.symbol ? `@${t.ref.filePath}#${t.ref.symbol}` : `@${t.ref.filePath}`;
    return React.createElement(Text, { key: i, color: 'yellow', bold: true }, label);
  });

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Text,
      { color: selected ? 'cyan' : 'gray' },
      `${prefix}${post.author.toString()}  ${time}`,
    ),
    React.createElement(
      Box,
      { flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 2 },
      ...tokenNodes,
    ),
  );
}
