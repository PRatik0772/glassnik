import { apiClient } from './client';
import { UserProfile } from '../types';

export const getUserProfile = (id: number) =>
  apiClient.get<UserProfile>(`/users/${id}`).then((r) => r.data);
