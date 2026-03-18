import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../../src/constants/theme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

const TABS: { name: string; label: string; icon: FeatherName }[] = [
  { name: 'index',   label: 'Home',    icon: 'home' },
  { name: 'explore', label: 'Explore', icon: 'compass' },
  { name: 'saved',   label: 'Saved',   icon: 'bookmark' },
  { name: 'profile', label: 'Profile', icon: 'user' },
];

function TabIcon({ icon, label, focused }: { icon: FeatherName; label: string; focused: boolean }) {
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
      {TABS.map(({ name, label, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={icon} label={label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', gap: 3, paddingTop: 2 },
  label: { fontFamily: F.body, fontSize: 10, color: C.sand, letterSpacing: 0.3 },
  labelActive: { fontFamily: F.bodySemiBold, color: C.charcoal },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.sand, marginTop: 1 },
});
