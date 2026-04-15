import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
  refreshToken: string | null;
  userId: number | null;
  displayName: string | null;
  username: string | null;
  isLoading: boolean;
  setSession: (params: {
    accessToken: string;
    refreshToken: string;
    userId: number;
    displayName?: string | null;
    username?: string | null;
  }) => Promise<void>;
  /** @deprecated use setSession */
  setTokens: (accessToken: string, userId: number) => Promise<void>;
  clearTokens: () => Promise<void>;
  loadTokens: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  displayName: null,
  username: null,
  isLoading: true,

  setSession: async ({ accessToken, refreshToken, userId, displayName, username }) => {
    await Promise.all([
      storage.setItem('accessToken', accessToken),
      storage.setItem('refreshToken', refreshToken),
      storage.setItem('userId', String(userId)),
      displayName ? storage.setItem('displayName', displayName) : Promise.resolve(),
      username ? storage.setItem('username', username) : Promise.resolve(),
    ]);
    set({ accessToken, refreshToken, userId, displayName: displayName ?? null, username: username ?? null });
  },

  // Kept for backward compat — callers that don't have a refreshToken yet
  setTokens: async (accessToken, userId) => {
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('userId', String(userId));
    set({ accessToken, userId });
  },

  clearTokens: async () => {
    const { refreshToken } = get();
    await Promise.all([
      storage.deleteItem('accessToken'),
      storage.deleteItem('refreshToken'),
      storage.deleteItem('userId'),
      storage.deleteItem('displayName'),
      storage.deleteItem('username'),
    ]);
    // Best-effort server logout
    if (refreshToken) {
      import('../api/auth').then(({ authApi }) => authApi.logout(refreshToken).catch(() => {}));
    }
    set({ accessToken: null, refreshToken: null, userId: null, displayName: null, username: null });
  },

  loadTokens: async () => {
    const [accessToken, refreshToken, userIdStr, displayName, username] = await Promise.all([
      storage.getItem('accessToken'),
      storage.getItem('refreshToken'),
      storage.getItem('userId'),
      storage.getItem('displayName'),
      storage.getItem('username'),
    ]);
    set({
      accessToken,
      refreshToken,
      userId: userIdStr ? parseInt(userIdStr, 10) : null,
      displayName,
      username,
      isLoading: false,
    });
  },

  refreshAccessToken: async () => {
    const { refreshToken, setSession, userId } = get();
    if (!refreshToken) return false;
    try {
      const { authApi } = await import('../api/auth');
      const tokens = await authApi.refresh(refreshToken);
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: userId!,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
