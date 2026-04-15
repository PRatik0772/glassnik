import { apiClient } from './client';
import { UserProfile } from '../types';
import { MOCK_PROFILES } from './mockData';

const USE_MOCK = false;

export const getUserProfile = async (id: number): Promise<UserProfile> => {
  if (USE_MOCK) return MOCK_PROFILES[id] ?? MOCK_PROFILES[1];
  try {
    const res = await apiClient.get<UserProfile>(`/users/${id}`);
    return res.data;
  } catch {
    // Fallback to mock while backend is being set up
    return MOCK_PROFILES[id] ?? MOCK_PROFILES[1];
  }
};
