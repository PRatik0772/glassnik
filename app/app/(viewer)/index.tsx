import { useState, useRef, useCallback } from 'react';
import {
  View, FlatList, Dimensions, Text, TouchableOpacity,
  StyleSheet, Platform, Share,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { useFeed } from '../../src/hooks/useFeed';
import { useFeedStore } from '../../src/store/feed.store';
import { useSavedStore } from '../../src/store/saved.store';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  'Street Scenes', 'Food & Markets', 'Nature & Adventure',
  'Historic Sites', 'Beaches & Islands', 'Shopping', 'Events',
];

// ─── Category overlay ────────────────────────────────────────────────────────
function CategoryOverlay({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      <View style={styles.categoryPanel}>
        <Text style={styles.categoryPanelSection}>Categories</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={styles.categoryRow}
            onPress={() => { onSelect(cat); onClose(); }}
            activeOpacity={0.7}
          >
            <Feather
              name={selected === cat ? 'check-circle' : 'circle'}
              size={16}
              color={selected === cat ? '#4ECDC4' : 'rgba(255,255,255,0.4)'}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.categoryRowText, selected === cat && { color: '#4ECDC4' }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.categoryPanelSection}>Discover</Text>
        {['Explore Nearby', 'Discover New Countries', 'Global Highlights'].map((label) => (
          <TouchableOpacity
            key={label}
            style={styles.categoryRow}
            onPress={() => { router.push('/discovery' as any); onClose(); }}
            activeOpacity={0.7}
          >
            <Feather name="compass" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 12 }} />
            <Text style={styles.categoryRowText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Single feed item ────────────────────────────────────────────────────────
function FeedItem({
  item, isActive, muted, onToggleMute, onTapNext, categoryFilter, onCategoryPress,
}: {
  item: VideoItem;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onTapNext: () => void;
  categoryFilter: string;
  onCategoryPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved } = useSavedStore();
  const [liked, setLiked] = useState(false);
  const saved = isSaved(String(item.id));

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Watch "${item.place}" on Glassnik — the Eye-POV travel experience app`,
        url: `https://glassnik.com/video/${item.id}`,
      });
    } catch {}
  }, [item.place, item.id]);

  const initial = (item.owner.displayName || item.owner.username || '?')[0].toUpperCase();

  return (
    <View style={{ width, height }}>
      {/* Tap anywhere on video = next video */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onTapNext}
        style={StyleSheet.absoluteFill}
      >
        <VideoPlayer video={item} isActive={isActive} muted={muted} />
      </TouchableOpacity>

      {/* Top warm vignette */}
      <LinearGradient
        colors={[C.vignette, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180 }}
        pointerEvents="none"
      />
      {/* Bottom dark vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(10,9,8,0.88)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 }}
        pointerEvents="none"
      />

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]} pointerEvents="box-none">
        {/* Left: back + videographer name + avatar */}
        <View style={styles.topLeft} pointerEvents="box-none">
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={26} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.owner.id}` as any)}
            style={styles.videographerBtn}
            activeOpacity={0.8}
          >
            <View style={styles.miniAvatar}>
              <Text style={styles.miniAvatarText}>{initial}</Text>
            </View>
            <Text style={styles.videographerName} numberOfLines={1}>
              @{item.owner.username}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: mute + teal Discovery button */}
        <View style={styles.topRight} pointerEvents="box-none">
          <TouchableOpacity onPress={onToggleMute} style={styles.iconBtn} activeOpacity={0.7}>
            <Feather name={muted ? 'volume-x' : 'volume-2'} size={18} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/discovery' as any)}
            style={styles.discoveryBtn}
            activeOpacity={0.8}
          >
            <Feather name="menu" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chip */}
      <TouchableOpacity
        onPress={onCategoryPress}
        style={[styles.categoryChip, { top: insets.top + 66 }]}
        activeOpacity={0.8}
      >
        <Feather name="layers" size={12} color="#fff" style={{ marginRight: 5 }} />
        <Text style={styles.categoryChipText}>{categoryFilter}</Text>
        <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* ── BOTTOM CENTRE: Place + Location ── */}
      <View style={[styles.bottomMeta, { bottom: insets.bottom + 82 }]} pointerEvents="none">
        <Text style={styles.metaPlace}>{item.place}</Text>
        <Text style={styles.metaLocation}>
          {item.city}{item.city && item.country ? ', ' : ''}{item.country}
        </Text>
      </View>

      {/* ── BOTTOM RIGHT: Share ── */}
      <TouchableOpacity
        style={[styles.shareBtn, { bottom: insets.bottom + 82 }]}
        onPress={handleShare}
        activeOpacity={0.7}
      >
        <Feather name="share-2" size={22} color={C.white} />
      </TouchableOpacity>

      {/* ── RIGHT RAIL ── */}
      <View style={[styles.rightRail, { bottom: insets.bottom + 190 }]}>
        <TouchableOpacity style={styles.railBtn} onPress={() => setLiked(!liked)} activeOpacity={0.7}>
          <Feather name="heart" size={26} color={liked ? '#E8735A' : C.white} />
          <Text style={[styles.railCount, liked && { color: '#E8735A' }]}>
            {(item.viewCount + (liked ? 1 : 0)).toLocaleString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.railBtn}
          onPress={() => toggleSaved(String(item.id))}
          activeOpacity={0.7}
        >
          <Feather name="bookmark" size={24} color={saved ? C.sand : C.white} />
          <Text style={[styles.railCount, saved && { color: C.sand }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Web wrapper ─────────────────────────────────────────────────────────────
function WebFeed({
  videos, currentIndex, setCurrentIndex, muted, toggleMute, categoryFilter, setCategoryFilter,
}: {
  videos: VideoItem[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  muted: boolean;
  toggleMute: () => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
}) {
  const containerRef = useRef<any>(null);
  const [showCatPanel, setShowCatPanel] = useState(false);

  const goNext = useCallback((index: number) => {
    if (index < videos.length - 1) {
      const next = index + 1;
      setCurrentIndex(next);
      containerRef.current?.scrollTo({ top: next * window.innerHeight, behavior: 'smooth' });
    }
  }, [videos.length, setCurrentIndex]);

  return (
    // @ts-ignore
    <div
      ref={containerRef}
      style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', backgroundColor: '#000' }}
    >
      {videos.map((item, index) => (
        // @ts-ignore
        <div key={item.id} style={{ scrollSnapAlign: 'start', height: '100vh' }}>
          <FeedItem
            item={item}
            isActive={index === currentIndex}
            muted={muted}
            onToggleMute={toggleMute}
            onTapNext={() => goNext(index)}
            categoryFilter={categoryFilter}
            onCategoryPress={() => setShowCatPanel(true)}
          />
        </div>
      ))}
      <CategoryOverlay
        visible={showCatPanel}
        selected={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setShowCatPanel(false)}
      />
    </div>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function FeedScreen() {
  const { videos, currentIndex } = useFeed();
  const setCurrentIndex = useFeedStore((s) => s.setCurrentIndex);
  const [muted, setMuted] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showCatPanel, setShowCatPanel] = useState(false);
  const listRef = useRef<FlatList<VideoItem>>(null);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const goNext = useCallback((index: number) => {
    if (index < videos.length - 1) {
      const next = index + 1;
      setCurrentIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }
  }, [videos.length, setCurrentIndex]);

  if (Platform.OS === 'web') {
    return (
      <WebFeed
        videos={videos}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        muted={muted}
        toggleMute={toggleMute}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        ref={listRef}
        data={videos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <FeedItem
            item={item}
            isActive={index === currentIndex}
            muted={muted}
            onToggleMute={toggleMute}
            onTapNext={() => goNext(index)}
            categoryFilter={categoryFilter}
            onCategoryPress={() => setShowCatPanel(true)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
      />
      <CategoryOverlay
        visible={showCatPanel}
        selected={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setShowCatPanel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12, zIndex: 20,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 6, marginRight: 4 },
  videographerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  miniAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.sand, borderWidth: 1.5, borderColor: C.white,
    alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { color: C.charcoal, fontSize: 13, fontFamily: F.bodySemiBold },
  videographerName: {
    color: C.white, fontFamily: F.bodySemiBold, fontSize: 13, maxWidth: 130,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  discoveryBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4ECDC4',
    alignItems: 'center', justifyContent: 'center',
  },
  // Category chip
  categoryChip: {
    position: 'absolute', left: 12, zIndex: 15,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  categoryChipText: { color: C.white, fontFamily: F.bodySemiBold, fontSize: 12 },
  // Bottom
  bottomMeta: { position: 'absolute', left: 16, right: 80 },
  metaPlace: {
    fontFamily: F.display, fontSize: 26, color: C.white, marginBottom: 4, lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  metaLocation: {
    fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  shareBtn: {
    position: 'absolute', right: 16, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  // Right rail
  rightRail: { position: 'absolute', right: 14, alignItems: 'center', gap: 24, zIndex: 10 },
  railBtn: { alignItems: 'center', gap: 5 },
  railCount: { fontFamily: F.bodySemiBold, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  // Category panel
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, justifyContent: 'flex-end' },
  categoryPanel: {
    backgroundColor: 'rgba(18,16,14,0.98)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 20, paddingBottom: 48, paddingHorizontal: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  categoryPanelSection: {
    color: 'rgba(255,255,255,0.35)', fontFamily: F.bodySemiBold,
    fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase',
    marginTop: 16, marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  categoryRowText: { color: C.white, fontFamily: F.body, fontSize: 15 },
});
