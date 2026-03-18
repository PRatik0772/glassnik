import { apiClient } from './client';
import { FeedResponse } from '../types';
import { MOCK_FEED_RESPONSE } from './mockData';

const USE_MOCK = true; // Set to false when backend is running

export const getFeed = (params: {
  cursor?: string;
  limit?: number;
  category?: string;
  trending?: boolean;
}): Promise<FeedResponse> => {
  if (USE_MOCK) return Promise.resolve(MOCK_FEED_RESPONSE);
  return apiClient.get<FeedResponse>('/mobile/feed', { params }).then((r) => r.data);
};
