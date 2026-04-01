import type { Post } from '@sns-in-vscode/domain';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { openInVSCode } from '../utils/codeJump.js';
import { PostItem } from './PostItem.js';

interface Props {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onCompose: () => void;
  onQuit: () => void;
}

export function Timeline({
  posts,
  hasMore,
  loading,
  onLoadMore,
  onCompose,
  onQuit,
}: Props): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    if (input === 'n') {
      onCompose();
      return;
    }

    const current = posts[selectedIndex];

    if (input === 'o' && current) {
      const refs = current.body.symbolRefs();
      const first = refs[0];
      if (first) openInVSCode(first.filePath);
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => {
        const next = Math.min(i + 1, posts.length - 1);
        if (next >= posts.length - 3 && hasMore && !loading) onLoadMore();
        return next;
      });
    } else if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  });

  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1 },
    React.createElement(
      Text,
      { bold: true, color: 'cyan' },
      '📱 SNS Timeline  [j/k] scroll  [n] post  [o] open file  [q] quit',
    ),
    React.createElement(Text, null, ''),
    ...posts.map((post: Post, i: number) =>
      React.createElement(PostItem, {
        key: post.id.value,
        post,
        selected: i === selectedIndex,
      }),
    ),
    loading
      ? React.createElement(Text, { color: 'gray' }, '  Loading...')
      : hasMore
        ? React.createElement(Text, { color: 'gray' }, '  ↓ more (scroll down)')
        : null,
  );
}
