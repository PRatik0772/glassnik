import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_VIDEOS, MOCK_PROFILES } from '../../src/api/mockData';
import { C, F } from '../../src/constants/theme';
import { useFeedStore } from '../../src/store/feed.store';

const { width } = Dimensions.get('window');
const GRID_GAP = 2;
const THUMB = (width - GRID_GAP * 2) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const authDisplayName = useAuthStore((s) => s.displayName);
  const authUsername = useAuthStore((s) => s.username);
  const userId = useAuthStore((s) => s.userId);
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);

  // Use real auth data if available, fall back to mock profile
  const fallback = MOCK_PROFILES[1];
  const displayName = authDisplayName ?? fallback.displayName;
  const username = authUsername ?? fallback.username;
  const MY_VIDEOS = userId ? MOCK_VIDEOS.filter((v) => v.owner.id === userId) : [];

  const signOut = async () => {
    await clearTokens();
    router.replace('/onboarding');
  };

  const openVideo = (id: number) => {
    setActiveVideoId(String(id));
    router.push('/(viewer)');
  };

  const STATS = [
    { val: String(MY_VIDEOS.length || fallback.videoCount), label: 'Videos' },
    { val: fallback.followerCount.toLocaleString(), label: 'Followers' },
    { val: '312', label: 'Following' },
  ];

  const Header = () => (
    <View>
      {/* Gradient header band */}
      <LinearGradient
        colors={[C.charcoal, '#2a2a27']}
        style={[styles.headerBand, { paddingTop: insets.top + 12 }]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.wordmark}>GLASSNIK</Text>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Feather name="bell" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={signOut} activeOpacity={0.7}>
              <Feather name="log-out" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>
                {displayName[0].toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.handle}>@{username}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={styles.statCell}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                {i < STATS.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => router.push('/upload' as any)}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="#111" />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Grid header */}
      <View style={styles.gridHeader}>
        <Feather name="grid" size={16} color={C.charcoal} />
        <Text style={styles.gridHeaderText}>Eye-POV Videos</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MY_VIDEOS.length > 0 ? MY_VIDEOS : MOCK_VIDEOS}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<Header />}
        columnWrapperStyle={{ gap: GRID_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
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
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.thumbGradient}
            >
              <Text style={styles.thumbPlace} numberOfLines={1}>{item.place}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="video" size={40} color={C.sand} />
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptyHint}>Upload your first Eye-POV experience</Text>
            <TouchableOpacity
              style={styles.emptyUploadBtn}
              onPress={() => router.push('/upload' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyUploadText}>Upload now</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  // Header band
  headerBand: { paddingHorizontal: 16, paddingBottom: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  wordmark: { fontFamily: F.displayMedium, fontSize: 16, color: C.white },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Avatar section
  avatarSection: { alignItems: 'center' },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2.5, borderColor: '#ffffff',
    padding: 3, marginBottom: 12,
  },
  avatarInner: {
    flex: 1, borderRadius: 40,
    backgroundColor: C.sand,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: F.display, fontSize: 32, color: C.charcoal },
  displayName: { fontFamily: F.display, fontSize: 22, color: C.white, marginBottom: 4 },
  handle: { fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 },

  // Stats
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statCell: { alignItems: 'center', paddingHorizontal: 20, position: 'relative' },
  statVal: { fontFamily: F.display, fontSize: 20, color: C.white },
  statLabel: { fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statDivider: { position: 'absolute', right: 0, top: 4, bottom: 4, width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Action buttons
  actionsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  editBtn: {
    flex: 1, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.white },
  uploadBtn: {
    flex: 1, height: 40, borderRadius: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  uploadBtnText: { fontFamily: F.bodySemiBold, fontSize: 13, color: '#111' },

  // Grid
  gridHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  gridHeaderText: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.charcoal, letterSpacing: 1 },
  thumb: {
    width: THUMB, height: THUMB,
    backgroundColor: C.surface,
    overflow: 'hidden',
  },
  thumbGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 40, justifyContent: 'flex-end', paddingHorizontal: 5, paddingBottom: 4,
  },
  thumbPlace: { fontFamily: F.bodySemiBold, fontSize: 9, color: C.white },

  // Empty state
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontFamily: F.displayMedium, fontSize: 18, color: C.charcoal },
  emptyHint: { fontFamily: F.body, fontSize: 13, color: C.muted },
  emptyUploadBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 12,
    backgroundColor: C.charcoal, borderRadius: 24,
  },
  emptyUploadText: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.cream },
});
