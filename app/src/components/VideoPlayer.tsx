import { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { VideoItem } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  isActive: boolean;
}

export function VideoPlayer({ video, isActive }: Props) {
  const src = video.muxPlaybackId
    ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8`
    : null;

  const player = useVideoPlayer(src, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

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
