import { useCallback } from 'react';
import {
  View, FlatList, Dimensions, Text, TouchableOpacity,
  TouchableWithoutFeedback, StyleSheet, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { useFeed } from '../../src/hooks/useFeed';
import { useFeedStore } from '../../src/store/feed.store';
import { useSavedStore } from '../../src/store/saved.store';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

function FeedItem({ item, isActive }: { item: VideoItem; isActive: boolean }) {
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved } = useSavedStore();
  const saved = isSaved(String(item.id));

  return (
    <View style={{ width, height }}>
      {/* Video layer */}
      <VideoPlayer video={item} isActive={isActive} />

      {/* Warm top vignette */}
      <LinearGradient
        colors={[C.vignette, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }}
        pointerEvents="none"
      />
      {/* Dark bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(28,28,26,0.65)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 260 }}
        pointerEvents="none"
      />

      {/* Tap blocker (pass-through) */}
      <TouchableWithoutFeedback>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        {Platform.OS === 'web' && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.toggle}>
          <Text style={styles.toggleActive}>For You</Text>
          <Text style={styles.toggleInactive}>Following</Text>
        </View>
      </View>

      {/* Bottom-left metadata */}
      <View style={[styles.bottomLeft, { bottom: insets.bottom + 80 }]}>
        <Text style={styles.metaUsername}>@{item.owner.username}</Text>
        <Text style={styles.metaPlace}>{item.place}</Text>
        <Text style={styles.metaLocation}>
          {item.city?.toUpperCase()}, {item.country?.toUpperCase()}
        </Text>
      </View>

      {/* Right rail */}
      <View style={[styles.rightRail, { bottom: insets.bottom + 100 }]}>
        {/* Avatar */}
        <TouchableOpacity onPress={() => router.push(`/profile/${item.owner.id}`)}>
          <View style={styles.railAvatar} />
        </TouchableOpacity>
        {/* Like */}
        <TouchableOpacity style={styles.railBtn}>
          <Text style={styles.railIcon}>♡</Text>
        </TouchableOpacity>
        {/* Share */}
        <TouchableOpacity style={styles.railBtn}>
          <Text style={styles.railIcon}>↑</Text>
        </TouchableOpacity>
        {/* Bookmark */}
        <TouchableOpacity style={styles.railBtn} onPress={() => toggleSaved(String(item.id))}>
          <Text style={[styles.railIcon, saved && { color: C.sand }]}>{saved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        {/* Explore */}
        <TouchableOpacity style={styles.railBtn} onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.railIcon}>⊕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { videos, currentIndex } = useFeed();
  const setCurrentIndex = useFeedStore((s) => s.setCurrentIndex);

  // Web: scroll-snap via CSS
  if (Platform.OS === 'web') {
    return (
      // @ts-ignore
      <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
        {videos.map((item, index) => (
          // @ts-ignore
          <div key={item.id} style={{ scrollSnapAlign: 'start', height: '100vh' }}>
            <FeedItem item={item} isActive={index === currentIndex} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <FeedItem item={item} isActive={index === currentIndex} />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / height);
        setCurrentIndex(index);
      }}
    />
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  backBtn: { position: 'absolute', left: 16, padding: 8 },
  backText: { color: C.white, fontSize: 20, opacity: 0.8 },
  toggle: { flexDirection: 'row', gap: 20 },
  toggleActive: {
    fontFamily: F.bodySemiBold, fontSize: 14, color: C.white,
    borderBottomWidth: 1.5, borderBottomColor: C.white, paddingBottom: 2,
  },
  toggleInactive: { fontFamily: F.bodySemiBold, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  bottomLeft: { position: 'absolute', left: 16, right: 80 },
  metaUsername: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.whiteMuted, letterSpacing: 1, marginBottom: 4 },
  metaPlace: { fontFamily: F.display, fontSize: 26, color: C.white, marginBottom: 2 },
  metaLocation: { fontFamily: F.body, fontSize: 11, color: C.whiteMuted, letterSpacing: 2 },
  rightRail: { position: 'absolute', right: 16, alignItems: 'center', gap: 24, zIndex: 10 },
  railAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.sand, borderWidth: 2, borderColor: C.sand },
  railBtn: { alignItems: 'center' },
  railIcon: { fontSize: 26, color: C.white },
});
