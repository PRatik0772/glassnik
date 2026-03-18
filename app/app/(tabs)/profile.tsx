import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { router } from 'expo-router';
import { C, F } from '../../src/constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const signOut = async () => {
    await clearTokens();
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 32 }]}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar} />
      </View>
      <Text style={styles.name}>Explorer</Text>
      <Text style={styles.username}>@glassnik_user</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[['24', 'Videos'], ['1.2K', 'Following'], ['4.8K', 'Followers']].map(([val, label]) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream, alignItems: 'center' },
  avatarWrap: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: C.sand, padding: 2, marginBottom: 12 },
  avatar: { flex: 1, borderRadius: 40, backgroundColor: C.surface },
  name: { fontFamily: F.display, fontSize: 24, color: C.charcoal },
  username: { fontFamily: F.body, fontSize: 14, color: C.muted, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 32 },
  stat: { alignItems: 'center' },
  statVal: { fontFamily: F.bodySemiBold, fontSize: 18, color: C.charcoal },
  statLabel: { fontFamily: F.body, fontSize: 12, color: C.muted },
  divider: { width: '80%', height: 1, backgroundColor: C.border, marginTop: 24, marginBottom: 24 },
  signOutBtn: { paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: C.charcoal, borderRadius: 10 },
  signOutText: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.charcoal },
});
