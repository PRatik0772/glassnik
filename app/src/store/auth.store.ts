import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store is native-only; fall back to localStorage on web
const storage = {
  getItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  deleteItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

interface AuthState {
  accessToken: string | null;
  userId: number | null;
  isLoading: boolean;
  setTokens: (accessToken: string, userId: number) => Promise<void>;
  clearTokens: () => Promise<void>;
  loadTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  isLoading: true,

  setTokens: async (accessToken, userId) => {
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('userId', String(userId));
    set({ accessToken, userId });
  },

  clearTokens: async () => {
    await storage.deleteItem('accessToken');
    await storage.deleteItem('userId');
    set({ accessToken: null, userId: null });
  },

  loadTokens: async () => {
    const accessToken = await storage.getItem('accessToken');
    const userIdStr = await storage.getItem('userId');
    set({
      accessToken,
      userId: userIdStr ? parseInt(userIdStr, 10) : null,
      isLoading: false,
    });
  },
}));
