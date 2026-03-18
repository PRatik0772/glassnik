import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FiHome, FiCompass, FiBookmark, FiUser } from 'react-icons/fi';
import { C, F } from '../../src/constants/theme';

const TABS = [
  { name: 'index',   label: 'Home',    Icon: FiHome },
  { name: 'explore', label: 'Explore', Icon: FiCompass },
  { name: 'saved',   label: 'Saved',   Icon: FiBookmark },
  { name: 'profile', label: 'Profile', Icon: FiUser },
] as const;

function TabIcon({ Icon, label, focused }: { Icon: React.ElementType; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Icon
        size={22}
        color={focused ? C.charcoal : C.sand}
        style={{ strokeWidth: focused ? 2.5 : 1.5 }}
      />
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
      {TABS.map(({ name, label, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={Icon} label={label} focused={focused} />
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
