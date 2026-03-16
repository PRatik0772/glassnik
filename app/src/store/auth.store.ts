import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('userId', String(userId));
    set({ accessToken, userId });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userId');
    set({ accessToken: null, userId: null });
  },

  loadTokens: async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const userIdStr = await SecureStore.getItemAsync('userId');
    set({
      accessToken,
      userId: userIdStr ? parseInt(userIdStr, 10) : null,
      isLoading: false,
    });
  },
}));
