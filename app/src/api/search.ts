import { apiClient } from './client';
import { VideoItem } from '../types';

export const searchVideos = (q: string) =>
  apiClient.get<VideoItem[]>('/mobile/search', { params: { q } }).then((r) => r.data);
