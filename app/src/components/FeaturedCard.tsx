import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoItem } from '../types';
import { C, F } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;
const CARD_H = CARD_W * (9 / 16);

interface Props { video: VideoItem; onPress: () => void; }

export function FeaturedCard({ video, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width: CARD_W, height: CARD_H }]} activeOpacity={0.9}>
      <Image source={{ uri: video.thumbnailUrl ?? '' }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(28,28,26,0.75)']} style={styles.gradient}>
        {video.category && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{video.category.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.place}>{video.place}</Text>
        <Text style={styles.location}>{video.city}, {video.country}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: C.surface },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', justifyContent: 'flex-end', padding: 14 },
  pill: { backgroundColor: C.sand, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  pillText: { fontFamily: F.bodySemiBold, fontSize: 10, color: C.charcoal },
  place: { fontFamily: F.display, fontSize: 20, color: C.white, marginBottom: 2 },
  location: { fontFamily: F.body, fontSize: 11, color: C.whiteMuted, letterSpacing: 1.5 },
});
