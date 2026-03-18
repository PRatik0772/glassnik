import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  Dimensions, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedStore } from '../../src/store/feed.store';
import { FeaturedCard } from '../../src/components/FeaturedCard';
import { ContentRow } from '../../src/components/ContentRow';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

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
          <View style={styles.avatar} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Greeting */}
        <Text style={styles.greeting}>Good evening, Explorer</Text>

        {/* Featured strip */}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.sand },
  greeting: { fontFamily: F.displayMedium, fontSize: 26, color: C.charcoal, paddingHorizontal: 16, paddingVertical: 16 },
});
