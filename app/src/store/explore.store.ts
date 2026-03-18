import { create } from 'zustand';

interface ExploreStore {
  locationFilter: string | null;
  setLocationFilter: (location: string | null) => void;
}

export const useExploreStore = create<ExploreStore>((set) => ({
  locationFilter: null,
  setLocationFilter: (location) => set({ locationFilter: location }),
}));
