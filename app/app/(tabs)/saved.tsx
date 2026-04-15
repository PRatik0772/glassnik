import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedStore } from '../../src/store/saved.store';
import { useFeedStore } from '../../src/store/feed.store';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const CARD_H = CARD_W * (4 / 3);

function SavedCard({ video, onPress, onRemove }: { video: VideoItem; onPress: () => void; onRemove: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { width: CARD_W, height: CARD_H }]}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: video.thumbnailUrl ?? '' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {/* Remove bookmark */}
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.8} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Feather name="bookmark" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
      <LinearGradient
        colors={['transparent', 'rgba(18,18,16,0.82)']}
        style={styles.cardGradient}
      >
        {video.category && (
          <Text style={styles.cardCategory}>{video.category.toUpperCase()}</Text>
        )}
        <Text style={styles.cardPlace} numberOfLines={1}>{video.place}</Text>
        <Text style={styles.cardLocation}>{video.city}, {video.country}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { savedIds, toggleSaved } = useSavedStore();
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);
  const saved = MOCK_VIDEOS.filter((v) => savedIds.includes(String(v.id)));

  const openVideo = (video: VideoItem) => {
    setActiveVideoId(String(video.id));
    router.push('/(viewer)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Saved</Text>
          {saved.length > 0 && (
            <Text style={styles.headerCount}>{saved.length} {saved.length === 1 ? 'experience' : 'experiences'}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => router.push('/discovery' as any)}
          activeOpacity={0.8}
        >
          <Feather name="compass" size={16} color={C.charcoal} />
        </TouchableOpacity>
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          {/* Bookmark illustration */}
          <View style={styles.emptyIconWrap}>
            <View style={styles.emptyIconOuter}>
              <Feather name="bookmark" size={36} color={C.sand} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyHint}>
            Tap the bookmark icon while watching{'\n'}a video to save it here
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/(viewer)' as any)}
            activeOpacity={0.8}
          >
            <Feather name="play" size={14} color={C.cream} style={{ marginRight: 6 }} />
            <Text style={styles.emptyBtnText}>Watch videos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={saved}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SavedCard
              video={item}
              onPress={() => openVideo(item)}
              onRemove={() => toggleSaved(String(item.id))}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontFamily: F.display, fontSize: 28, color: C.charcoal },
  headerCount: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 2 },
  exploreBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },

  grid: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 14, overflow: 'hidden', backgroundColor: C.surface },
  removeBtn: {
    position: 'absolute', top: 10, right: 10, zIndex: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '55%', justifyContent: 'flex-end', padding: 10,
  },
  cardCategory: { color: 'rgba(255,255,255,0.55)', fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 0.8, marginBottom: 3 },
  cardPlace: { fontFamily: F.display, fontSize: 15, color: C.white, marginBottom: 2 },
  cardLocation: { fontFamily: F.body, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 80 },
  emptyIconWrap: { marginBottom: 8 },
  emptyIconOuter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: F.display, fontSize: 22, color: C.charcoal },
  emptyHint: { fontFamily: F.body, fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 21 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 13,
    backgroundColor: C.charcoal, borderRadius: 26,
  },
  emptyBtnText: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.cream },
});
