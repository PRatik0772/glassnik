export interface VideoOwner {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface VideoItem {
  id: number;
  muxPlaybackId: string | null;
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
