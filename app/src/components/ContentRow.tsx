import { View, Text, FlatList, StyleSheet } from 'react-native';
import { VideoItem } from '../types';
import { EditorialCard } from './EditorialCard';
import { C, F } from '../constants/theme';

interface Props {
  label: string;
  videos: VideoItem[];
  onPress: (video: VideoItem) => void;
}

export function ContentRow({ label, videos, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <FlatList
        data={videos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 10 }}
        renderItem={({ item }) => <EditorialCard video={item} onPress={() => onPress(item)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  label: { fontFamily: F.bodySemiBold, fontSize: 11, color: C.charcoal, letterSpacing: 1.5, paddingLeft: 16, marginBottom: 12 },
});
