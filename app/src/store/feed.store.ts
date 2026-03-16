import { create } from 'zustand';
import { VideoItem } from '../types';

interface FeedState {
  videos: VideoItem[];
  currentIndex: number;
  activeCategory: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  setVideos: (videos: VideoItem[], nextCursor: string | null) => void;
  appendVideos: (videos: VideoItem[], nextCursor: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setCategory: (category: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  videos: [],
  currentIndex: 0,
  activeCategory: null,
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  error: null,

  setVideos: (videos, nextCursor) =>
    set({ videos, nextCursor, hasMore: nextCursor !== null, error: null }),

  appendVideos: (videos, nextCursor) =>
    set((s) => ({
      videos: [...s.videos, ...videos],
      nextCursor,
      hasMore: nextCursor !== null,
    })),

  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setCategory: (activeCategory) => set({ activeCategory }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ videos: [], currentIndex: 0, nextCursor: null, hasMore: true }),
}));
