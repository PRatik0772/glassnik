import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { VideoItem } from '../types';
import { C, F } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2.2;
const CARD_H = CARD_W * (16 / 9);

interface Props { video: VideoItem; onPress: () => void; }

export function EditorialCard({ video, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: CARD_W }} activeOpacity={0.9}>
      <View style={[styles.imageWrap, { height: CARD_H }]}>
        <Image source={{ uri: video.thumbnailUrl ?? '' }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </View>
      {video.category && <Text style={styles.tag}>{video.category.toUpperCase()}</Text>}
      <Text style={styles.place} numberOfLines={1}>{video.place}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: C.surface, marginBottom: 6 },
  tag: { fontFamily: F.bodySemiBold, fontSize: 10, color: C.sand, marginBottom: 2 },
  place: { fontFamily: F.displayMedium, fontSize: 13, color: C.charcoal },
});
