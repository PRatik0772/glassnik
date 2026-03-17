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
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { searchVideos } from '../api/search';
import { getFeed } from '../api/feed';
import { VideoThumbnail } from './VideoThumbnail';
import { CATEGORIES } from '../constants/categories';
import { VideoItem } from '../types';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 12;

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
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search places, cities, categories..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => handleCategoryPress(cat.value)}
              style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* TRENDING NOW label — only when not searching */}
      {query === '' && (
        <Text style={styles.sectionLabel}>Trending Now</Text>
      )}

      {/* Results grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <VideoThumbnail
              video={item}
              columns={2}
              onPress={() => router.push(`/profile/${item.owner?.id ?? 0}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchWrap: {
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  chipsScroll: {
    marginBottom: 12,
  },
  chipsContent: {
    paddingHorizontal: PADDING,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#ffffff',
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000000',
  },
  chipTextInactive: {
    color: 'rgba(255,255,255,0.55)',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: PADDING,
    marginBottom: 10,
  },
  gridContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 24,
  },
  gridRow: {
    gap: GAP,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
  },
});
