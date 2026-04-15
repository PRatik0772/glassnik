import { useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeedStore } from '../../src/store/feed.store';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const CARD_H = CARD_W * (4 / 3);

const CATEGORIES = [
  { label: 'All', icon: 'globe' },
  { label: 'Nature', icon: 'wind' },
  { label: 'Culture', icon: 'layers' },
  { label: 'Adventure', icon: 'anchor' },
  { label: 'Food & Markets', icon: 'shopping-bag' },
  { label: 'Architecture', icon: 'home' },
  { label: 'Events', icon: 'calendar' },
] as const;

function VideoCard({ video, onPress }: { video: VideoItem; onPress: () => void }) {
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
      <LinearGradient
        colors={['transparent', 'rgba(18,18,16,0.82)']}
        style={styles.cardGradient}
      >
        {video.category && (
          <Text style={styles.cardCategory}>{video.category.toUpperCase()}</Text>
        )}
        <Text style={styles.cardPlace} numberOfLines={1}>{video.place}</Text>
        <Text style={styles.cardLocation}>{video.city}, {video.country}</Text>
        <View style={styles.cardViews}>
          <Feather name="eye" size={10} color="rgba(255,255,255,0.55)" />
          <Text style={styles.cardViewsText}>{(video.viewCount / 1000).toFixed(1)}K</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);

  const filtered = MOCK_VIDEOS.filter((v) => {
    const matchesQuery = !query || [v.place, v.city, v.country, v.category].some(
      (f) => f?.toLowerCase().includes(query.toLowerCase())
    );
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const openVideo = (video: VideoItem) => {
    setActiveVideoId(String(video.id));
    router.push('/(viewer)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity
          style={styles.discoveryBtn}
          onPress={() => router.push('/discovery' as any)}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={16} color={C.charcoal} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={C.sand} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search places, categories..."
          placeholderTextColor={C.sand}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
            <Feather name="x" size={16} color={C.sand} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.chip, activeCategory === cat.label && styles.chipActive]}
            onPress={() => setActiveCategory(cat.label)}
            activeOpacity={0.75}
          >
            <Feather
              name={cat.icon as any}
              size={12}
              color={activeCategory === cat.label ? C.cream : C.charcoal}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.chipText, activeCategory === cat.label && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? 'experience' : 'experiences'}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
      </Text>

      {/* Grid */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="search" size={36} color={C.sand} />
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyHint}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <VideoCard video={item} onPress={() => openVideo(item)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerTitle: { fontFamily: F.display, fontSize: 28, color: C.charcoal },
  discoveryBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface,
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: {
    flex: 1, fontFamily: F.body, fontSize: 14, color: C.charcoal,
  },

  chipRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.charcoal, borderColor: C.charcoal },
  chipText: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.charcoal },
  chipTextActive: { color: C.cream },

  resultCount: {
    fontFamily: F.body, fontSize: 11, color: C.muted,
    paddingHorizontal: 16, marginBottom: 10,
    letterSpacing: 0.3,
  },

  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { borderRadius: 14, overflow: 'hidden', backgroundColor: C.surface },
  cardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '55%', justifyContent: 'flex-end', padding: 10,
  },
  cardCategory: { color: 'rgba(255,255,255,0.55)', fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 0.8, marginBottom: 3 },
  cardPlace: { fontFamily: F.display, fontSize: 15, color: C.white, marginBottom: 2 },
  cardLocation: { fontFamily: F.body, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },
  cardViews: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  cardViewsText: { fontFamily: F.bodySemiBold, fontSize: 9, color: 'rgba(255,255,255,0.55)' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontFamily: F.displayMedium, fontSize: 18, color: C.charcoal },
  emptyHint: { fontFamily: F.body, fontSize: 13, color: C.muted },
});
