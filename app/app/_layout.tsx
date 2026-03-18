import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useAuthStore } from '../src/store/auth.store';
import '../global.css';

export default function RootLayout() {
  const loadTokens = useAuthStore((s) => s.loadTokens);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => { loadTokens(); }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(viewer)" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="profile/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="discovery" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="upload" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
