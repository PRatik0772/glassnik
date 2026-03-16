import { Image, TouchableOpacity, View, Dimensions } from 'react-native';
import { VideoItem } from '../types';

const { width } = Dimensions.get('window');

interface Props {
  video: Omit<VideoItem, 'owner'>;
  columns?: 2 | 3;
  onPress: () => void;
}

export function VideoThumbnail({ video, columns = 2, onPress }: Props) {
  const gap = columns === 2 ? 24 : 2;
  const padding = columns === 2 ? 12 : 1;
  const itemWidth = (width - padding * 2 - gap * (columns - 1)) / columns;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: itemWidth, aspectRatio: 9 / 16, marginBottom: gap }}
    >
      {video.thumbnailUrl ? (
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
      )}
    </TouchableOpacity>
  );
}
