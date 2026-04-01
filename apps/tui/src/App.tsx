import type { Post, PostRepository } from '@sns-in-vscode/domain';
import { useApp } from 'ink';
import React, { useState } from 'react';
import { Compose } from './components/Compose.js';
import { Timeline } from './components/Timeline.js';
import { useTimeline } from './hooks/useTimeline.js';

interface Props {
  repository: PostRepository;
}

export type Mode = 'timeline' | 'compose';

export function App({ repository }: Props): React.ReactElement {
  const { exit } = useApp();
  const [mode, setMode] = useState<Mode>('timeline');
  const { posts, hasMore, loading, loadMore, addPost } = useTimeline(repository);

  const handleDone = (post: Post): void => {
    addPost(post);
    setMode('timeline');
  };

  if (mode === 'compose') {
    return React.createElement(Compose, {
      repository,
      onDone: handleDone,
      onCancel: () => {
        setMode('timeline');
      },
    });
  }

  return React.createElement(Timeline, {
    posts,
    hasMore,
    loading,
    onLoadMore: loadMore,
    onCompose: () => {
      setMode('compose');
    },
    onQuit: exit,
  });
}
