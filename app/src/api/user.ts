import { apiClient } from './client';
import { UserProfile } from '../types';
import { MOCK_PROFILES } from './mockData';

const USE_MOCK = true;

export const getUserProfile = (id: number): Promise<UserProfile> => {
  if (USE_MOCK) {
    const profile = MOCK_PROFILES[id] ?? MOCK_PROFILES[1];
    return Promise.resolve(profile);
  }
  return apiClient.get<UserProfile>(`/users/${id}`).then((r) => r.data);
};
