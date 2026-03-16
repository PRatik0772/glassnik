import { View, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ExploreTab } from '../src/components/ExploreTab';

export default function DiscoveryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
        <Text className="text-white text-lg font-bold flex-1">Explore</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-gray-400 text-base">✕</Text>
        </TouchableOpacity>
      </View>

      <ExploreTab />
    </SafeAreaView>
  );
}
