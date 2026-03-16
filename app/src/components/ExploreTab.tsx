import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { searchVideos } from '../api/search';
import { getFeed } from '../api/feed';
import { VideoThumbnail } from './VideoThumbnail';
import { CATEGORIES } from '../constants/categories';
import { VideoItem } from '../types';

const { width } = Dimensions.get('window');
const GAP = 24;
const PADDING = 12;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

export function ExploreTab() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFeed = async (category: string | null) => {
    setLoading(true);
    try {
      const res = await getFeed({ category: category ?? undefined });
      setResults(res.data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      loadFeed(selectedCategory);
      return;
    }
    setLoading(true);
    try {
      const data = await searchVideos(q.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load default feed on mount
  useEffect(() => {
    loadFeed(null);
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 300);
  };

  const handleCategoryPress = (value: string | null) => {
    setSelectedCategory(value);
    setQuery('');
    loadFeed(value);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Search bar */}
      <View className="px-3 py-3">
        <TextInput
          className="bg-gray-900 text-white rounded-xl px-4 py-3"
          placeholder="Search places, cities, categories..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-3 mb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            onPress={() => handleCategoryPress(cat.value)}
            className={`rounded-full px-4 py-2 ${
              selectedCategory === cat.value ? 'bg-teal' : 'bg-gray-800'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === cat.value ? 'text-black' : 'text-white'
              }`}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00B4B4" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: PADDING }}
          columnWrapperStyle={{ gap: GAP }}
          renderItem={({ item }) => (
            <VideoThumbnail
              video={item}
              columns={2}
              onPress={() => router.push(`/profile/${item.owner?.id ?? 0}`)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500">No results found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
