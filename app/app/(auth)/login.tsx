import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.heading}>Glassnik</Text>
      <Text style={styles.subheading}>Sign in to continue</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.35)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, styles.inputLast]}
        placeholder="Password"
        placeholderTextColor="rgba(255,255,255,0.35)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.primaryBtnText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.linkText}>
          Don't have an account?{' '}
          <Text style={styles.linkTextBold}>Register</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/')}>
        <Text style={styles.guestText}>Continue as guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#0d0d0d',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputLast: {
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#ffffff',
    fontWeight: '600',
  },
  guestBtn: {
    alignItems: 'center',
  },
  guestText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
  },
});
