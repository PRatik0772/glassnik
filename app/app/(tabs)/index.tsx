import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  Dimensions, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFeedStore } from '../../src/store/feed.store';
import { FeaturedCard } from '../../src/components/FeaturedCard';
import { ContentRow } from '../../src/components/ContentRow';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);

  const openVideo = (video: VideoItem) => {
    setActiveVideoId(String(video.id));
    router.push('/(viewer)');
  };

  const featured = MOCK_VIDEOS.slice(0, 4);
  const trending = MOCK_VIDEOS.slice(0, 3);
  const nearby = MOCK_VIDEOS.slice(2, 5);
  const following = MOCK_VIDEOS.slice(3, 6);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>GLASSNIK</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/discovery' as any)}
            activeOpacity={0.7}
          >
            <Feather name="search" size={18} color={C.charcoal} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Feather name="bell" size={18} color={C.charcoal} />
            {/* Notification dot */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={styles.avatar}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitial}>E</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.greetingName}>Explorer</Text>
          </View>
          <TouchableOpacity
            style={styles.watchBtn}
            onPress={() => openVideo(MOCK_VIDEOS[0])}
            activeOpacity={0.8}
          >
            <Feather name="play" size={13} color={C.cream} style={{ marginRight: 5 }} />
            <Text style={styles.watchBtnText}>Watch now</Text>
          </TouchableOpacity>
        </View>

        {/* Category quick-filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {['All', 'Nature', 'Culture', 'Adventure', 'Architecture', 'Events'].map((cat) => (
            <TouchableOpacity key={cat} style={styles.catChip} activeOpacity={0.75}>
              <Text style={styles.catChipText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured strip */}
        <Text style={styles.sectionLabel}>FEATURED</Text>
        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + 12}
          decelerationRate="fast"
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => <FeaturedCard video={item} onPress={() => openVideo(item)} />}
          style={{ marginTop: 8 }}
        />

        {/* Content rows */}
        <ContentRow label="TRENDING NOW" videos={trending} onPress={openVideo} />
        <ContentRow label="NEAR YOU" videos={nearby} onPress={openVideo} />
        <ContentRow label="FOLLOWING" videos={following} onPress={openVideo} />

        {/* CTA banner */}
        <TouchableOpacity
          style={styles.ctaBanner}
          onPress={() => router.push('/upload' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaTitle}>Share your perspective</Text>
            <Text style={styles.ctaBody}>Upload your Eye-POV experience and reach thousands of explorers</Text>
          </View>
          <View style={styles.ctaIcon}>
            <Feather name="video" size={22} color={C.cream} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.cream,
  },
  wordmark: { fontFamily: F.displayMedium, fontSize: 18, color: C.charcoal },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#E8735A', borderWidth: 1.5, borderColor: C.cream,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.sand, borderWidth: 1.5, borderColor: C.charcoal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.charcoal },

  greetingRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8,
  },
  greeting: { fontFamily: F.body, fontSize: 14, color: C.muted },
  greetingName: { fontFamily: F.display, fontSize: 28, color: C.charcoal, marginTop: 2 },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.charcoal, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  watchBtnText: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.cream },

  categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  catChipText: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.charcoal },

  sectionLabel: {
    fontFamily: F.bodySemiBold, fontSize: 11, color: C.charcoal,
    letterSpacing: 1.5, paddingLeft: 16, marginBottom: 4,
  },

  ctaBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 32,
    backgroundColor: C.charcoal, borderRadius: 16,
    padding: 20, gap: 16,
  },
  ctaLeft: { flex: 1 },
  ctaTitle: { fontFamily: F.display, fontSize: 18, color: C.cream, marginBottom: 6 },
  ctaBody: { fontFamily: F.body, fontSize: 13, color: 'rgba(245,240,232,0.6)', lineHeight: 19 },
  ctaIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
});
