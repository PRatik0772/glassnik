import { View, Text, Image, TouchableOpacity } from 'react-native';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

export function VideographerCard({ profile }: Props) {
  return (
    <View className="items-center pt-12 pb-6 px-6 bg-black">
      {profile.avatarUrl ? (
        <Image
          source={{ uri: profile.avatarUrl }}
          className="w-20 h-20 rounded-full mb-3"
        />
      ) : (
        <View className="w-20 h-20 rounded-full bg-gray-700 mb-3" />
      )}
      <Text className="text-white text-xl font-bold">{profile.displayName}</Text>
      <Text className="text-gray-400 text-sm mb-4">@{profile.username}</Text>
      <View className="flex-row gap-8 mb-4">
        <View className="items-center">
          <Text className="text-white font-bold text-lg">{profile.videoCount}</Text>
          <Text className="text-gray-400 text-xs">Videos</Text>
        </View>
        <View className="items-center">
          <Text className="text-white font-bold text-lg">{profile.followerCount}</Text>
          <Text className="text-gray-400 text-xs">Followers</Text>
        </View>
      </View>
      {/* Follow button — post-MVP, shown but disabled */}
      <TouchableOpacity
        className="border border-white rounded-full px-8 py-2 opacity-40"
        disabled
      >
        <Text className="text-white font-medium">Follow</Text>
      </TouchableOpacity>
    </View>
  );
}
