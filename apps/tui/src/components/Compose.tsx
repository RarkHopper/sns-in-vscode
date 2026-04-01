import { randomUUID } from 'node:crypto';
import type { PostRepository } from '@sns-in-vscode/domain';
import { Author, Post, PostBody, PostId } from '@sns-in-vscode/domain';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

interface Props {
  repository: PostRepository;
  onDone: (post: Post) => void;
  onCancel: () => void;
}

export function Compose({ repository, onDone, onCancel }: Props): React.ReactElement {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  const handleSubmit = (value: string): void => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('投稿内容を入力してください');
      return;
    }

    let body: PostBody;
    try {
      body = PostBody.of(trimmed);
    } catch {
      setError('投稿内容が無効です');
      return;
    }

    const post = new Post(PostId.of(randomUUID()), Author.of('@user'), body, new Date());

    void repository.save(post).then(() => {
      onDone(post);
    });
  };

  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1 },
    React.createElement(
      Text,
      { bold: true, color: 'cyan' },
      '✏️  新規投稿  [Esc] キャンセル  [Enter] 投稿',
    ),
    React.createElement(Text, null, ''),
    React.createElement(
      Box,
      { flexDirection: 'row' },
      React.createElement(Text, { color: 'green' }, '> '),
      React.createElement(TextInput, {
        value: text,
        onChange: setText,
        onSubmit: handleSubmit,
      }),
    ),
    error ? React.createElement(Text, { color: 'red' }, error) : null,
  );
}
