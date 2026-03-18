import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFeedStore } from '../../src/store/feed.store';
import { EditorialCard } from '../../src/components/EditorialCard';
import { MOCK_VIDEOS } from '../../src/api/mockData';
import { VideoItem } from '../../src/types';
import { C, F } from '../../src/constants/theme';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const setActiveVideoId = useFeedStore((s) => s.setActiveVideoId);

  const filtered = query
    ? MOCK_VIDEOS.filter((v) =>
        [v.place, v.city, v.country, v.category].some((f) =>
          f?.toLowerCase().includes(query.toLowerCase())
        )
      )
    : MOCK_VIDEOS;

  const openVideo = (video: VideoItem) => {
    setActiveVideoId(String(video.id));
    router.push('/(viewer)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Explore</Text>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search places, categories..."
          placeholderTextColor={C.sand}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => <EditorialCard video={item} onPress={() => openVideo(item)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  header: { fontFamily: F.display, fontSize: 28, color: C.charcoal, padding: 16 },
  searchWrap: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: C.sand, borderRadius: 10, paddingHorizontal: 14 },
  search: { height: 44, fontFamily: F.body, fontSize: 15, color: C.charcoal } as any,
});
