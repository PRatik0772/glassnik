import { Modal, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { useFeedStore } from '../store/feed.store';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CategorySelector({ visible, onClose }: Props) {
  const { activeCategory, setCategory } = useFeedStore();

  const handleSelect = (value: string | null) => {
    setCategory(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/60"
        activeOpacity={1}
        onPress={onClose}
      />
      <SafeAreaView className="bg-gray-900 rounded-t-2xl">
        <View className="px-4 pt-4 pb-2">
          <Text className="text-white text-lg font-bold mb-4">Select Category</Text>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="py-3 border-b border-gray-800 flex-row justify-between items-center"
                onPress={() => handleSelect(item.value)}
              >
                <Text className="text-white text-base">{item.label}</Text>
                {activeCategory === item.value && (
                  <Text className="text-teal text-base">✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
