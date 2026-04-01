import type { Post } from '@sns-in-vscode/domain';
import { Box, Text, useInput } from 'ink';
import React, { useEffect, useRef, useState } from 'react';
import { openInVSCode } from '../utils/codeJump.js';
import { PostItem } from './PostItem.js';

interface Props {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
  lastPrepended: number;
  onLoadMore: () => void;
  onCompose: () => void;
  onQuit: () => void;
}

export function Timeline({
  posts,
  hasMore,
  loading,
  lastPrepended,
  onLoadMore,
  onCompose,
  onQuit,
}: Props): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [unseen, setUnseen] = useState(0);
  const prevPrependedRef = useRef(0);

  useEffect(() => {
    if (lastPrepended === 0 || lastPrepended === prevPrependedRef.current) return;
    prevPrependedRef.current = lastPrepended;

    setSelectedIndex((i) => {
      if (i === 0) {
        // 先頭にいる → 新着に自動追従（index 0 のまま = 最新）
        return 0;
      }
      // 過去を読んでいる → 位置をズラさず、未読バナーを出す
      setUnseen((u) => u + lastPrepended);
      return i + lastPrepended;
    });
  }, [lastPrepended]);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    if (input === 'n') {
      onCompose();
      return;
    }
    if (input === 't') {
      setSelectedIndex(0);
      setUnseen(0);
      return;
    }

    const current = posts[selectedIndex];
    if (input === 'o' && current) {
      const first = current.body.symbolRefs()[0];
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
      setSelectedIndex((i) => {
        const next = Math.max(i - 1, 0);
        if (next === 0) setUnseen(0);
        return next;
      });
    }
  });

  const unseenBanner =
    unseen > 0
      ? React.createElement(
          Text,
          { color: 'yellow', bold: true },
          `  ↑ 新着 ${unseen}件  [t] で先頭へ`,
        )
      : null;

  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1 },
    React.createElement(
      Text,
      { bold: true, color: 'cyan' },
      `📱 SNS  [↑↓/j/k] scroll  [t] top  [n] post  [o] open  [q] quit`,
    ),
    unseenBanner,
    React.createElement(Text, null, ''),
    ...posts.map((post: Post, i: number) =>
      React.createElement(PostItem, {
        key: post.id.value,
        post,
        selected: i === selectedIndex,
      }),
    ),
    hasMore && !loading ? React.createElement(Text, { color: 'gray' }, '  ↓ more') : null,
  );
}
