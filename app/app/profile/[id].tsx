import { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getUserProfile } from '../../src/api/user';
import { VideographerCard } from '../../src/components/VideographerCard';
import { VideoThumbnail } from '../../src/components/VideoThumbnail';
import { UserProfile } from '../../src/types';

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const GAP = 2;
const PADDING = 1;
const ITEM_WIDTH = (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getUserProfile(Number(id))
      .then(setProfile)
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#00B4B4" size="large" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-center mb-4">{error ?? 'Profile not found.'}</Text>
        <TouchableOpacity className="bg-teal rounded-xl px-6 py-3" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Close button */}
      <TouchableOpacity className="absolute top-12 right-4 z-10" onPress={() => router.back()}>
        <Text className="text-gray-400 text-lg">✕</Text>
      </TouchableOpacity>

      <FlatList
        data={profile.videos}
        keyExtractor={(item) => String(item.id)}
        numColumns={COLUMNS}
        ListHeaderComponent={<VideographerCard profile={profile} />}
        contentContainerStyle={{ paddingHorizontal: PADDING }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <VideoThumbnail video={item} columns={3} onPress={() => {}} />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center pt-10">
            <Text className="text-gray-500">No videos yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
