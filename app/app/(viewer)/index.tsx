import { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
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
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#00B4B4" size="large" />
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-center mb-4">{error}</Text>
        <TouchableOpacity className="bg-teal rounded-xl px-6 py-3" onPress={reload}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoading && videos.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-400 text-lg">No videos yet</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={swipeDown}>
      <View className="flex-1 bg-black">
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
        {/* Discovery button */}
        <TouchableOpacity
          className="absolute top-12 left-4 bg-black/40 rounded-full px-3 py-1"
          onPress={() => router.push('/discovery')}
        >
          <Text className="text-white text-xs font-medium">Explore ↓</Text>
        </TouchableOpacity>
      </View>
    </GestureDetector>
  );
}
