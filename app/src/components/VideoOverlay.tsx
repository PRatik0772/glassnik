import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { VideoItem } from '../types';

const GLASS_BTN = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

interface Props {
  video: VideoItem;
  onCategoryPress: () => void;
}

export function VideoOverlay({ video, onCategoryPress }: Props) {
  const [liked, setLiked] = useState(false);
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    if (!video.muxPlaybackId) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(`https://stream.mux.com/${video.muxPlaybackId}.m3u8`);
    }
  };

  const location = [video.city, video.country].filter(Boolean).join(', ');

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Vignette — vertical (top + bottom darkening) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.65)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Vignette — horizontal (left + right darkening) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.4)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top-left: avatar + username */}
      <TouchableOpacity
        style={[styles.topBar, { paddingTop: insets.top + 12 }]}
        onPress={() => router.push(`/profile/${video.owner.id}`)}
        activeOpacity={0.8}
      >
        {video.owner.avatarUrl ? (
          <Image source={{ uri: video.owner.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        <Text style={styles.username} numberOfLines={1}>
          {video.owner.displayName}
        </Text>
      </TouchableOpacity>

      {/* Right rail: 4 glass circular buttons */}
      <View style={styles.rail} pointerEvents="box-none">
        <TouchableOpacity style={GLASS_BTN} onPress={() => setLiked((v) => !v)}>
          <Text style={[styles.railIcon, liked && styles.railIconActive]}>
            {liked ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={GLASS_BTN} onPress={handleShare}>
          <Text style={styles.railIcon}>↑</Text>
        </TouchableOpacity>

        <TouchableOpacity style={GLASS_BTN} onPress={() => router.push('/discovery')}>
          <Text style={styles.railIcon}>⊞</Text>
        </TouchableOpacity>

        <TouchableOpacity style={GLASS_BTN} onPress={onCategoryPress}>
          <Text style={styles.railIcon}>◈</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom-left metadata */}
      <View style={[styles.metadata, { paddingBottom: insets.bottom + 32 }]}>
        {video.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {video.category.replace(/-/g, ' ').toUpperCase()}
            </Text>
          </View>
        )}
        {video.place && (
          <Text style={styles.placeName} numberOfLines={2}>
            {video.place}
          </Text>
        )}
        {location ? <Text style={styles.locationText}>{location}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarFallback: {
    backgroundColor: '#333',
  },
  username: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 180,
  },
  rail: {
    position: 'absolute',
    right: 16,
    top: '35%',
    alignItems: 'center',
    gap: 16,
  },
  railIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
  },
  railIconActive: {
    color: '#ffffff',
  },
  metadata: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 80,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
  placeName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
