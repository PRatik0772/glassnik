import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { C } from '../src/constants/theme';

export default function IndexScreen() {
  const { accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (accessToken) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [accessToken, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.charcoal} />
    </View>
  );
}
