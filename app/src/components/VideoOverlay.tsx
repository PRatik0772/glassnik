import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { VideoItem } from '../types';

const { height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  onCategoryPress: () => void;
}

export function VideoOverlay({ video, onCategoryPress }: Props) {
  const location = [video.place, video.city, video.country].filter(Boolean).join(', ');

  const handleShare = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(`https://stream.mux.com/${video.muxPlaybackId}.m3u8`);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Top row */}
      <View className="flex-row justify-end px-4 pt-12" pointerEvents="box-none">
        <TouchableOpacity
          className="bg-black/40 rounded-full px-3 py-1 mr-2"
          onPress={onCategoryPress}
        >
          <Text className="text-white text-xs font-medium">
            {video.category ?? 'Category'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-black/40 rounded-full p-2" onPress={handleShare}>
          <Text className="text-white text-xs">↑</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row */}
      <View className="absolute bottom-10 left-0 right-0 px-4 flex-row items-end justify-between">
        {/* Videographer info */}
        <TouchableOpacity
          className="flex-row items-center flex-1 mr-4"
          onPress={() => router.push(`/profile/${video.owner.id}`)}
        >
          {video.owner.avatarUrl ? (
            <Image
              source={{ uri: video.owner.avatarUrl }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-600 mr-3" />
          )}
          <View>
            <Text className="text-white font-semibold text-sm">
              {video.owner.displayName}
            </Text>
            {location ? (
              <Text className="text-gray-300 text-xs">{location}</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Follow button — post-MVP, shown but disabled */}
        <TouchableOpacity
          className="border border-white rounded-full px-4 py-1 opacity-50"
          disabled
        >
          <Text className="text-white text-xs font-medium">Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
