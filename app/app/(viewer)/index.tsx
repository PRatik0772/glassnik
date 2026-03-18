import { useState } from 'react';
import {
  View, FlatList, Dimensions, Text, TouchableOpacity, StyleSheet, Platform,
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

function FeedItem({
  item, isActive, muted, onToggleMute,
}: {
  item: VideoItem;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved } = useSavedStore();
  const [liked, setLiked] = useState(false);
  const saved = isSaved(String(item.id));

  return (
    <View style={{ width, height }}>
      {/* Video */}
      <VideoPlayer video={item} isActive={isActive} muted={muted} />

      {/* Warm top vignette */}
      <LinearGradient
        colors={[C.vignette, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }}
        pointerEvents="none"
      />
      {/* Dark bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(20,18,16,0.80)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 }}
        pointerEvents="none"
      />

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={28} color={C.white} />
        </TouchableOpacity>
        <View style={styles.toggle}>
          <Text style={styles.toggleActive}>For You</Text>
          <Text style={styles.toggleInactive}>Following</Text>
        </View>
        <TouchableOpacity onPress={onToggleMute} style={styles.muteBtn} activeOpacity={0.7}>
          <Feather name={muted ? 'volume-x' : 'volume-2'} size={20} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom-left metadata */}
      <View style={[styles.bottomLeft, { bottom: insets.bottom + 90 }]}>
        <Text style={styles.metaUsername}>@{item.owner.username}</Text>
        <Text style={styles.metaPlace}>{item.place}</Text>
        <Text style={styles.metaLocation}>
          {item.city?.toUpperCase()}, {item.country?.toUpperCase()}
        </Text>
      </View>

      {/* Right rail */}
      <View style={[styles.rightRail, { bottom: insets.bottom + 100 }]}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => router.push(`/profile/${item.owner.id}`)}
          style={styles.avatarWrap}
          activeOpacity={0.8}
        >
          <View style={styles.railAvatar} />
          <View style={styles.avatarPlus}>
            <Text style={styles.avatarPlusText}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity style={styles.railBtn} onPress={() => setLiked(!liked)} activeOpacity={0.7}>
          <Feather name="heart" size={28} color={liked ? '#E8735A' : C.white} />
          <Text style={[styles.railCount, liked && { color: '#E8735A' }]}>
            {liked ? '1' : '0'}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.railBtn} activeOpacity={0.7}>
          <Feather name="share-2" size={26} color={C.white} />
          <Text style={styles.railCount}>Share</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity
          style={styles.railBtn}
          onPress={() => toggleSaved(String(item.id))}
          activeOpacity={0.7}
        >
          <Feather name="bookmark" size={26} color={saved ? C.sand : C.white} />
          <Text style={[styles.railCount, saved && { color: C.sand }]}>Save</Text>
        </TouchableOpacity>

        {/* Explore */}
        <TouchableOpacity
          style={styles.railBtn}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.7}
        >
          <Feather name="compass" size={26} color={C.white} />
          <Text style={styles.railCount}>Explore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { videos, currentIndex } = useFeed();
  const setCurrentIndex = useFeedStore((s) => s.setCurrentIndex);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => setMuted((m) => !m);

  if (Platform.OS === 'web') {
    return (
      // @ts-ignore
      <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', backgroundColor: '#000' }}>
        {videos.map((item, index) => (
          // @ts-ignore
          <div key={item.id} style={{ scrollSnapAlign: 'start', height: '100vh' }}>
            <FeedItem
              item={item}
              isActive={index === currentIndex}
              muted={muted}
              onToggleMute={toggleMute}
            />
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
        <FeedItem
          item={item}
          isActive={index === currentIndex}
          muted={muted}
          onToggleMute={toggleMute}
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
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, zIndex: 10,
  },
  backBtn: { position: 'absolute', left: 12, padding: 4 },
  muteBtn: {
    position: 'absolute', right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  toggle: { flexDirection: 'row', gap: 20 },
  toggleActive: {
    fontFamily: F.bodySemiBold, fontSize: 15, color: C.white,
    borderBottomWidth: 2, borderBottomColor: C.white, paddingBottom: 2,
  },
  toggleInactive: { fontFamily: F.bodySemiBold, fontSize: 15, color: 'rgba(255,255,255,0.45)' },
  bottomLeft: { position: 'absolute', left: 16, right: 90 },
  metaUsername: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.whiteMuted, letterSpacing: 0.5, marginBottom: 6 },
  metaPlace: { fontFamily: F.display, fontSize: 28, color: C.white, marginBottom: 4, lineHeight: 34 },
  metaLocation: { fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  rightRail: { position: 'absolute', right: 14, alignItems: 'center', gap: 20, zIndex: 10 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  railAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.sand, borderWidth: 2, borderColor: C.white },
  avatarPlus: {
    position: 'absolute', bottom: -8, left: '50%',
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E8735A',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -9,
  },
  avatarPlusText: { color: C.white, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  railBtn: { alignItems: 'center', gap: 4 },
  railCount: { fontFamily: F.bodySemiBold, fontSize: 11, color: C.whiteMuted },
});
