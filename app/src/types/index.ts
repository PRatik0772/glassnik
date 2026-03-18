export interface VideoOwner {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface VideoItem {
  id: number;
  muxPlaybackId: string | null;
  webVideoUrl?: string; // direct MP4 URL for web/mock, overrides muxPlaybackId on web
  thumbnailUrl: string | null;
  place: string | null;
  city: string | null;
  country: string | null;
  category: string | null;
  viewCount: number;
  owner: VideoOwner;
}

export interface FeedResponse {
  data: VideoItem[];
  nextCursor: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  videoCount: number;
  followerCount: number;
  videos: Omit<VideoItem, 'owner'>[];
}
