import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSavedStore } from '../../src/store/saved.store';
import { useFeedStore } from '../../src/store/feed.store';
import { EditorialCard } from '../../src/components/EditorialCard';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const savedIds = useSavedStore((s) => s.savedIds);
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);
  const saved = MOCK_VIDEOS.filter((v) => savedIds.includes(String(v.id)));

  const openVideo = (video: VideoItem) => {
    setActiveVideoId(String(video.id));
    router.push('/(viewer)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Saved</Text>
      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved videos yet</Text>
          <Text style={styles.emptyHint}>Tap the bookmark icon on any video</Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => <EditorialCard video={item} onPress={() => openVideo(item)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  header: { fontFamily: F.display, fontSize: 28, color: C.charcoal, padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: F.displayMedium, fontSize: 18, color: C.charcoal, marginBottom: 8 },
  emptyHint: { fontFamily: F.body, fontSize: 14, color: C.muted },
});
