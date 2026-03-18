import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// NOTE: JWT refresh is deferred to post-MVP.
// If access token expires, API calls return 401 and user must log in again.
apiClient.interceptors.request.use(async (config) => {
  const token =
    Platform.OS === 'web'
      ? localStorage.getItem('accessToken')
      : await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
