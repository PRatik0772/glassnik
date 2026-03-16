import { View, Dimensions } from 'react-native';
import { VideoItem } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  isActive: boolean;
}

export function VideoPlayer({ video }: Props) {
  const src = video.muxPlaybackId
    ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8`
    : null;

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      {src ? (
        // @ts-ignore — web-only <video> element
        <video
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#111' }} />
      )}
    </View>
  );
}
