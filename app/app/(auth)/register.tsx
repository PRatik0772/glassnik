import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/auth.store';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);

  const handleRegister = async () => {
    if (!email || !username || !password) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/register', { email, username, password });
      await setTokens(data.accessToken, data.user.id);
      router.replace('/');
    } catch {
      Alert.alert('Registration failed', 'Email or username may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
      <Text className="text-gray-400 mb-8">Join Glassnik Experiences</Text>
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
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        placeholder="Username"
        placeholderTextColor="#666"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
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
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Account</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity className="mt-4 items-center" onPress={() => router.back()}>
        <Text className="text-gray-400">
          Already have an account? <Text className="text-teal">Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
