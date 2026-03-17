import { Image, TouchableOpacity, View, Text, Dimensions, StyleSheet } from 'react-native';
import { VideoItem } from '../types';

const { width } = Dimensions.get('window');

interface Props {
  video: Omit<VideoItem, 'owner'>;
  columns?: 2 | 3;
  onPress: () => void;
}

export function VideoThumbnail({ video, columns = 2, onPress }: Props) {
  const gap = columns === 2 ? 12 : 2;
  const padding = columns === 2 ? 12 : 1;
  const itemWidth = (width - padding * 2 - gap * (columns - 1)) / columns;

  return (
    <TouchableOpacity onPress={onPress} style={{ width: itemWidth, marginBottom: gap }}>
      <View style={styles.card}>
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {video.thumbnailUrl ? (
            <Image
              source={{ uri: video.thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.thumbFallback]} />
          )}
        </View>
        {/* Footer */}
        {(video.place || video.city) && (
          <View style={styles.footer}>
            {video.place ? (
              <Text style={styles.place} numberOfLines={1}>{video.place}</Text>
            ) : null}
            {video.city ? (
              <Text style={styles.city} numberOfLines={1}>{video.city}</Text>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  thumbWrap: {
    aspectRatio: 9 / 16,
  },
  thumbFallback: {
    backgroundColor: '#111',
  },
  footer: {
    padding: 8,
  },
  place: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  city: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
});
