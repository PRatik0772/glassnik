import { View, Dimensions } from 'react-native';
import { VideoItem } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  isActive: boolean;
}

export function VideoPlayer({ video }: Props) {
  // webVideoUrl takes priority (mock/direct MP4), then Mux stream, then thumbnail image
  const videoSrc = video.webVideoUrl
    ?? (video.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8` : null);

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      {videoSrc ? (
        // @ts-ignore — web-only <video> element
        <video
          src={videoSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : video.thumbnailUrl ? (
        // @ts-ignore — web-only <img> element
        <img
          src={video.thumbnailUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt={video.place ?? ''}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#111' }} />
      )}
    </View>
  );
}
