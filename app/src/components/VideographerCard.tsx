import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

export function VideographerCard({ profile }: Props) {
  return (
    <View style={styles.container}>
      {/* Avatar with white ring */}
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]} />
      )}

      <Text style={styles.displayName}>{profile.displayName}</Text>
      <Text style={styles.username}>@{profile.username}</Text>

      {/* Stats row with hairline divider */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile.videoCount}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile.followerCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      {/* Follow button — post-MVP, shown but disabled */}
      <TouchableOpacity style={styles.followBtn} disabled>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  avatarFallback: {
    backgroundColor: '#333',
  },
  displayName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  followBtn: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    opacity: 0.4,
  },
  followText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
});
