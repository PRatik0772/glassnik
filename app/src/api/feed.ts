import { apiClient } from './client';
import { FeedResponse } from '../types';
import { MOCK_FEED_RESPONSE } from './mockData';

// Flip to false when backend is running. Falls back to mock on connection error.
const USE_MOCK = false;

export const getFeed = async (params: {
  cursor?: string;
  limit?: number;
  category?: string;
  trending?: boolean;
}): Promise<FeedResponse> => {
  if (USE_MOCK) return MOCK_FEED_RESPONSE;
  try {
    const res = await apiClient.get<FeedResponse>('/mobile/feed', { params });
    return res.data;
  } catch {
    // Backend unreachable — serve mock data so the app stays usable
    return MOCK_FEED_RESPONSE;
  }
};

export const searchFeed = async (q: string): Promise<FeedResponse['data']> => {
  if (USE_MOCK) return MOCK_FEED_RESPONSE.data.filter(
    (v) => [v.place, v.city, v.country, v.category]
      .some((f) => f?.toLowerCase().includes(q.toLowerCase()))
  );
  try {
    const res = await apiClient.get<FeedResponse['data']>('/mobile/search', { params: { q } });
    return res.data;
  } catch {
    return [];
  }
};

export const getNearbyFeed = async (params: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<FeedResponse['data']> => {
  if (USE_MOCK) return MOCK_FEED_RESPONSE.data;
  try {
    const res = await apiClient.get<FeedResponse['data']>('/videos/nearby', { params });
    return res.data;
  } catch {
    return MOCK_FEED_RESPONSE.data;
  }
};
