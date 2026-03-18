import { create } from 'zustand';

interface SavedStore {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedIds: [],
  toggleSaved: (id) => set((s) => ({
    savedIds: s.savedIds.includes(id)
      ? s.savedIds.filter((x) => x !== id)
      : [...s.savedIds, id],
  })),
  isSaved: (id) => get().savedIds.includes(id),
}));
