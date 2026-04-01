import type { Post } from '@sns-in-vscode/domain';
import { Box, Text, useInput } from 'ink';
import React, { useEffect, useRef, useState } from 'react';
import { openInVSCode } from '../utils/codeJump.js';
import { PostItem } from './PostItem.js';

const AUTO_SCROLL_MS = 1000;
const PAUSE_RESUME_MS = 5000;

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseTemporarily = (): void => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setPaused(false);
    }, PAUSE_RESUME_MS);
  };

  useEffect(() => {
    if (paused || posts.length === 0) return;
    const timer = setInterval(() => {
      setSelectedIndex((i) => {
        const next = i + 1;
        if (next >= posts.length) {
          if (hasMore && !loading) onLoadMore();
          return 0;
        }
        if (next >= posts.length - 3 && hasMore && !loading) onLoadMore();
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [paused, posts.length, hasMore, loading, onLoadMore]);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    if (input === 'n') {
      onCompose();
      return;
    }
    if (input === ' ') {
      if (paused) {
        setPaused(false);
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      } else {
        setPaused(true);
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      }
      return;
    }

    const current = posts[selectedIndex];
    if (input === 'o' && current) {
      const first = current.body.symbolRefs()[0];
      if (first) openInVSCode(first.filePath);
      return;
    }

    if (key.downArrow || input === 'j') {
      pauseTemporarily();
      setSelectedIndex((i) => Math.min(i + 1, posts.length - 1));
    } else if (key.upArrow || input === 'k') {
      pauseTemporarily();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  });

  const statusText = loading ? '⏳' : paused ? `⏸ PAUSED  [Space] 再開` : '▶ AUTO';

  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1 },
    React.createElement(
      Text,
      { bold: true, color: 'cyan' },
      `📱 SNS  [↑↓] scroll  [Space] pause  [n] post  [o] open  [q] quit   ${statusText}`,
    ),
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
