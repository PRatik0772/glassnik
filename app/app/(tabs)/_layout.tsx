import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../src/constants/theme';

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ opacity: focused ? 1 : 0.35 }}>{children}</View>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.sand }} />}
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
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              {/* Home icon — roof + body */}
              <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', bottom: 0, width: 18, height: 12, borderWidth: 1.5, borderColor: C.charcoal, borderRadius: 2 }} />
                <View style={{ position: 'absolute', top: 1, width: 0, height: 0, borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: C.charcoal }} />
              </View>
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: C.charcoal, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.charcoal }} />
              </View>
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View style={{ width: 16, height: 20, borderWidth: 1.5, borderColor: C.charcoal, borderRadius: 2 }} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: C.charcoal }} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
