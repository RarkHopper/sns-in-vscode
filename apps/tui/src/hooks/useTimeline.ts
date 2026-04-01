import type { Post, PostRepository } from '@sns-in-vscode/domain';
import { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 20;

interface TimelineState {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
}

interface UseTimeline {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  addPost: (post: Post) => void;
}

export function useTimeline(repository: PostRepository): UseTimeline {
  const [state, setState] = useState<TimelineState>({
    posts: [],
    hasMore: false,
    loading: true,
  });
  const loadingRef = useRef(false);

  const load = useCallback(
    (cursor?: string): void => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setState((s) => ({ ...s, loading: true }));

      void repository.findMany(cursor, PAGE_SIZE).then((fetched) => {
        setState((s) => ({
          posts: cursor ? [...s.posts, ...fetched] : fetched,
          hasMore: fetched.length === PAGE_SIZE,
          loading: false,
        }));
        loadingRef.current = false;
      });
    },
    [repository],
  );

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = useCallback((): void => {
    const last = state.posts.at(-1);
    if (!state.hasMore || state.loading || !last) return;
    load(last.id.value);
  }, [state, load]);

  const addPost = useCallback((post: Post): void => {
    setState((s) => ({ ...s, posts: [post, ...s.posts] }));
  }, []);

  return { posts: state.posts, hasMore: state.hasMore, loading: state.loading, loadMore, addPost };
}
