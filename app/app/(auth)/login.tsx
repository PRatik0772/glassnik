import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      await setTokens(data.accessToken, data.user.id);
      router.replace('/');
    } catch {
      Alert.alert('Login failed', 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2">Glassnik</Text>
      <Text className="text-gray-400 mb-8">Sign in to continue</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-6"
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-teal rounded-xl py-4 items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-4 items-center"
        onPress={() => router.push('/(auth)/register')}
      >
        <Text className="text-gray-400">
          Don't have an account? <Text className="text-teal">Register</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-3 items-center" onPress={() => router.replace('/')}>
        <Text className="text-gray-500 text-sm">Continue as guest</Text>
      </TouchableOpacity>
    </View>
  );
}
