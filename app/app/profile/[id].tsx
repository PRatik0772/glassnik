import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Dimensions, Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getUserProfile } from '../../src/api/user';
import { useFeedStore } from '../../src/store/feed.store';
import { UserProfile } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const GRID_GAP = 2;
const THUMB = (width - GRID_GAP * 2) / 3;

// Colour per initial letter for avatar background
function avatarColor(name: string) {
  const colours = ['#4ECDC4', '#E8735A', '#C4B5A0', '#6C9BCE', '#A8D5BA', '#F4A261'];
  return colours[name.charCodeAt(0) % colours.length];
}

export default function VideographerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);

  useEffect(() => {
    if (!id) return;
    getUserProfile(Number(id))
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = useCallback(async () => {
    if (!profile) return;
    await Share.share({
      message: `Check out ${profile.displayName} on Glassnik — eye-POV travel experiences`,
      url: `https://glassnik.com/videographer/${profile.id}`,
    });
  }, [profile]);

  const openVideo = (videoId: number) => {
    setActiveVideoId(String(videoId));
    router.push('/(viewer)');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4ECDC4" size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Feather name="user-x" size={40} color="rgba(255,255,255,0.3)" />
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.back()}>
          <Text style={styles.ghostBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = (profile.displayName || profile.username || '?')[0].toUpperCase();
  const bgColor = avatarColor(profile.displayName);

  const ProfileHeader = () => (
    <View>
      {/* Dark gradient header */}
      <LinearGradient
        colors={['#1a1a17', '#111']}
        style={[styles.headerBand, { paddingTop: insets.top + 8 }]}
      >
        {/* Nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare} activeOpacity={0.7}>
            <Feather name="share-2" size={18} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: bgColor }]}>
            <View style={[styles.avatarInner, { backgroundColor: bgColor }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          </View>

          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.handle}>@{profile.username}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { val: String(profile.videoCount), label: 'Videos' },
              { val: profile.followerCount.toLocaleString(), label: 'Followers' },
              { val: '—', label: 'Following' },
            ].map((s, i, arr) => (
              <View key={s.label} style={styles.statCell}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                {i < arr.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>

          {/* Follow + Message buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing((f) => !f)}
              activeOpacity={0.85}
            >
              <Feather
                name={following ? 'user-check' : 'user-plus'}
                size={15}
                color={following ? '#111' : C.white}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.followBtnText, following && { color: '#111' }]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.msgBtn} activeOpacity={0.8}>
              <Feather name="message-circle" size={15} color={C.white} style={{ marginRight: 6 }} />
              <Text style={styles.msgBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Grid label */}
      <View style={styles.gridHeader}>
        <Feather name="film" size={14} color="rgba(255,255,255,0.5)" />
        <Text style={styles.gridHeaderText}>Eye-POV Experiences</Text>
        <Text style={styles.gridHeaderCount}>{profile.videos.length}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={profile.videos}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        ListHeaderComponent={<ProfileHeader />}
        columnWrapperStyle={{ gap: GRID_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openVideo(item.id)}
            activeOpacity={0.85}
            style={styles.thumb}
          >
            <Image
              source={{ uri: item.thumbnailUrl ?? '' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.thumbGradient}
            >
              <Feather name="eye" size={9} color="rgba(255,255,255,0.6)" />
              <Text style={styles.thumbViews}>
                {item.viewCount ? `${(item.viewCount / 1000).toFixed(1)}K` : '—'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="video-off" size={32} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  centered: {
    flex: 1, backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32,
  },
  errorText: { color: 'rgba(255,255,255,0.5)', fontFamily: F.body, fontSize: 15 },
  ghostBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10,
  },
  ghostBtnText: { color: C.white, fontFamily: F.bodySemiBold, fontSize: 13 },

  headerBand: { paddingHorizontal: 16, paddingBottom: 24 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  avatarSection: { alignItems: 'center' },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2.5, padding: 3, marginBottom: 14,
  },
  avatarInner: {
    flex: 1, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: F.display, fontSize: 34, color: '#111' },
  displayName: { fontFamily: F.display, fontSize: 22, color: C.white, marginBottom: 4 },
  handle: { fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },

  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statCell: { alignItems: 'center', paddingHorizontal: 22, position: 'relative' },
  statVal: { fontFamily: F.display, fontSize: 20, color: C.white },
  statLabel: { fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statDivider: {
    position: 'absolute', right: 0, top: 6, bottom: 6,
    width: 1, backgroundColor: 'rgba(255,255,255,0.08)',
  },

  actionsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  followBtn: {
    flex: 1, height: 42, borderRadius: 21,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  followBtnActive: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
  followBtnText: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.white },
  msgBtn: {
    flex: 1, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  msgBtnText: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.white },

  gridHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  gridHeaderText: {
    flex: 1, fontFamily: F.bodySemiBold, fontSize: 12,
    color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
  },
  gridHeaderCount: { fontFamily: F.bodySemiBold, fontSize: 12, color: 'rgba(255,255,255,0.3)' },

  thumb: { width: THUMB, height: THUMB, backgroundColor: '#1a1a1a', overflow: 'hidden' },
  thumbGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 30, flexDirection: 'row', alignItems: 'center',
    gap: 3, paddingHorizontal: 5, paddingBottom: 4,
  },
  thumbViews: { fontFamily: F.bodySemiBold, fontSize: 9, color: 'rgba(255,255,255,0.6)' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.25)' },
});
