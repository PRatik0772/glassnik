import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../../src/constants/theme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

function TabIcon({ icon, label, focused, upload }: {
  icon: FeatherName; label: string; focused: boolean; upload?: boolean;
}) {
  if (upload) {
    return (
      <View style={styles.uploadBtn}>
        <Feather name="plus" size={24} color="#111" />
      </View>
    );
  }
  return (
    <View style={styles.iconWrap}>
      <Feather name={icon} size={22} color={focused ? C.charcoal : C.sand} />
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: C.cream,
          borderTopWidth: 1,
          borderTopColor: C.border,
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="home" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="search" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          tabBarIcon: () => <TabIcon icon="plus" label="Upload" focused={false} upload />,
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => router.push('/upload' as any)}
              style={styles.uploadTabBtn}
              activeOpacity={0.85}
            >
              <View style={styles.uploadBtn}>
                <Feather name="plus" size={24} color="#111" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="bookmark" label="Saved" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="user" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', gap: 3, paddingTop: 2 },
  label: { fontFamily: F.body, fontSize: 10, color: C.sand, letterSpacing: 0.3 },
  labelActive: { fontFamily: F.bodySemiBold, color: C.charcoal },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.sand, marginTop: 1 },
  uploadBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#4ECDC4',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#4ECDC4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    elevation: 6,
  },
  uploadTabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
