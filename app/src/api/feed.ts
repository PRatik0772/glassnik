import { apiClient } from './client';
import { FeedResponse } from '../types';

export const getFeed = (params: {
  cursor?: string;
  limit?: number;
  category?: string;
  trending?: boolean;
}) => apiClient.get<FeedResponse>('/mobile/feed', { params }).then((r) => r.data);
