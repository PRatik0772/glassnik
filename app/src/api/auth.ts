import { apiClient } from './client';

export interface AuthUser {
  id: number;
  email: string;
  username: string | null;
  displayName: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string): Promise<void> =>
    apiClient.post('/auth/logout', { refreshToken }).then(() => {}),
};
