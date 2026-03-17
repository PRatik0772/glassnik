import { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { VideoOverlay } from '../../src/components/VideoOverlay';
import { CategorySelector } from '../../src/components/CategorySelector';
import { useFeed } from '../../src/hooks/useFeed';
import { useFeedStore } from '../../src/store/feed.store';
import { VideoItem } from '../../src/types';

const { height } = Dimensions.get('window');

function VideoItem_({ item, isActive }: { item: VideoItem; isActive: boolean }) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <View style={{ height }}>
      <VideoPlayer video={item} isActive={isActive} />
      <VideoOverlay video={item} onCategoryPress={() => setShowCategories(true)} />
      <CategorySelector visible={showCategories} onClose={() => setShowCategories(false)} />
    </View>
  );
}

export default function ViewerScreen() {
  const { videos, currentIndex, isLoading, error, reload } = useFeed();
  const setCurrentIndex = useFeedStore((s) => s.setCurrentIndex);
  const flatListRef = useRef<FlatList>(null);

  // Swipe down on first video → open discovery
  const swipeDown = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationY > 80 && currentIndex === 0) {
        router.push('/discovery');
      }
    })
    .runOnJS(true);

  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.ghostBtn} onPress={reload}>
          <Text style={styles.ghostBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoading && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No videos yet</Text>
      </View>
    );
  }

  const content = (
    <View style={styles.fill}>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <VideoItem_ item={item} isActive={index === currentIndex} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
      />
    </View>
  );

  if (Platform.OS === 'web') return content;
  return <GestureDetector gesture={swipeDown}>{content}</GestureDetector>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  ghostBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 16,
  },
});
