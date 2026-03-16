import { useCallback, useEffect } from 'react';
import { getFeed } from '../api/feed';
import { useFeedStore } from '../store/feed.store';

export function useFeed() {
  const {
    videos,
    currentIndex,
    activeCategory,
    nextCursor,
    hasMore,
    isLoading,
    error,
    setVideos,
    appendVideos,
    setCurrentIndex,
    setLoading,
    setError,
    reset,
  } = useFeedStore();

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeed({ category: activeCategory ?? undefined });
      setVideos(res.data, res.nextCursor);
    } catch {
      setError('Could not load videos. Tap to retry.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !nextCursor) return;
    setLoading(true);
    try {
      const res = await getFeed({ cursor: nextCursor, category: activeCategory ?? undefined });
      appendVideos(res.data, res.nextCursor);
    } catch {
      // silently fail for pagination
    } finally {
      setLoading(false);
    }
  }, [hasMore, isLoading, nextCursor, activeCategory]);

  // Pre-fetch when 3 from end
  useEffect(() => {
    if (videos.length > 0 && currentIndex >= videos.length - 3) {
      loadMore();
    }
  }, [currentIndex, videos.length]);

  // Reload when category changes
  useEffect(() => {
    reset();
    loadInitial();
  }, [activeCategory]);

  const goNext = useCallback(() => {
    if (currentIndex < videos.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, videos.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  return { videos, currentIndex, isLoading, error, goNext, goPrev, reload: loadInitial };
}
