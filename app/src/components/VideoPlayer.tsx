import { useEffect } from 'react';
import { View, Dimensions, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { VideoItem } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  isActive: boolean;
  muted: boolean;
}

export function VideoPlayer({ video, isActive, muted }: Props) {
  const src = video.webVideoUrl
    ?? (video.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8` : null);

  const player = useVideoPlayer(src ?? '', (p) => {
    p.loop = true;
    p.volume = 0;
  });

  useEffect(() => {
    if (!src) return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, src]);

  useEffect(() => {
    if (!src) return;
    player.volume = muted ? 0 : 1;
  }, [muted, src]);

  // No playable URL — show the thumbnail so the screen is never blank
  if (!src) {
    return (
      <View style={{ width, height, backgroundColor: '#000' }}>
        {video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={{ width, height }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width, height, backgroundColor: '#111' }} />
        )}
      </View>
    );
  }

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}
