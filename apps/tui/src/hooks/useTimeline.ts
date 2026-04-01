import type { Post, PostRepository } from '@sns-in-vscode/domain';
import { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 5000;

interface TimelineState {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
  lastPrepended: number;
}

interface UseTimeline {
  posts: Post[];
  hasMore: boolean;
  loading: boolean;
  lastPrepended: number;
  loadMore: () => void;
  addPost: (post: Post) => void;
}

export function useTimeline(repository: PostRepository): UseTimeline {
  const [state, setState] = useState<TimelineState>({
    posts: [],
    hasMore: false,
    loading: true,
    lastPrepended: 0,
  });
  const loadingRef = useRef(false);
  const postsRef = useRef<Post[]>([]);

  postsRef.current = state.posts;

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
          lastPrepended: 0,
        }));
        loadingRef.current = false;
      });
    },
    [repository],
  );

  const pollNew = useCallback((): void => {
    void repository.findMany(undefined, PAGE_SIZE).then((fetched) => {
      const existingIds = new Set(postsRef.current.map((p) => p.id.value));
      const newPosts = fetched.filter((p) => !existingIds.has(p.id.value));
      if (newPosts.length === 0) return;
      setState((s) => ({
        ...s,
        posts: [...newPosts, ...s.posts],
        lastPrepended: newPosts.length,
      }));
    });
  }, [repository]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(pollNew, POLL_INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [pollNew]);

  const loadMore = useCallback((): void => {
    const last = state.posts.at(-1);
    if (!state.hasMore || state.loading || !last) return;
    load(last.id.value);
  }, [state, load]);

  const addPost = useCallback((post: Post): void => {
    setState((s) => ({ ...s, posts: [post, ...s.posts], lastPrepended: 1 }));
  }, []);

  return {
    posts: state.posts,
    hasMore: state.hasMore,
    loading: state.loading,
    lastPrepended: state.lastPrepended,
    loadMore,
    addPost,
  };
}
