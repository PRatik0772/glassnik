import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach stored access token to every request
apiClient.interceptors.request.use(async (config) => {
  const token =
    Platform.OS === 'web'
      ? localStorage.getItem('accessToken')
      : await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: attempt one silent token refresh, then retry the original request.
// If refresh also fails, clear session and let the app redirect to onboarding.
let refreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (refreshing) {
      // Queue concurrent requests while refresh is in flight
      await new Promise<boolean>((resolve) => refreshQueue.push(resolve));
      return apiClient(original);
    }

    refreshing = true;
    try {
      const { useAuthStore } = await import('../store/auth.store');
      const ok = await useAuthStore.getState().refreshAccessToken();
      refreshQueue.forEach((cb) => cb(ok));
      refreshQueue = [];
      if (!ok) {
        await useAuthStore.getState().clearTokens();
        return Promise.reject(error);
      }
      return apiClient(original);
    } finally {
      refreshing = false;
    }
  },
);
