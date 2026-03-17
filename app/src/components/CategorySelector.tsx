import { Modal, View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet } from 'react-native';
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
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleSelect(item.value)}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              {activeCategory === item.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowText: {
    color: '#ffffff',
    fontSize: 16,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
  },
});
