import { useRef, useState } from 'react';
import {
  View, ScrollView, Text, TouchableOpacity, Dimensions,
  StyleSheet, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/auth.store';
import { authApi } from '../src/api/auth';
import { FloatLabelInput } from '../src/components/FloatLabelInput';
import { C, F } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [tab, setTab] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const goToLogin = () => {
    setError('');
    scrollRef.current?.scrollTo({ y: height, animated: true });
  };

  const handleContinue = async () => {
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);
    try {
      const res = tab === 'signin'
        ? await authApi.login({ email: email.trim(), password })
        : await authApi.register({
            email: email.trim(),
            password,
            displayName: name.trim() || undefined,
          });
      await setSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        userId: res.user.id,
        displayName: res.user.displayName,
        username: res.user.username,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      scrollEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={{ flex: 1 }}
      scrollEventThrottle={16}
    >
      {/* ── SECTION 0: Hero Landing ── */}
      <View style={{ width, height }}>
        {/* Background image */}
        {Platform.OS === 'web' ? (
          // @ts-ignore
          <img
            src="https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=1600"
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.charcoal }]} />
        )}
        {/* Dark overlay */}
        <LinearGradient
          colors={['rgba(28,28,26,0.35)', 'rgba(28,28,26,0.6)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Wordmark */}
        <Text style={[styles.wordmark, { top: insets.top + 16 }]}>GLASSNIK</Text>

        {/* Center content */}
        <View style={styles.heroCenter}>
          <Text style={styles.heroHeadline}>See the world through{'\n'}someone else's eyes</Text>
          <Text style={styles.heroBody}>Discover places, people, and moments — unfiltered</Text>
          <TouchableOpacity style={styles.btnFilled} onPress={goToLogin}>
            <Text style={styles.btnFilledText}>Start Exploring</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={goToLogin}>
            <Text style={styles.btnGhostText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Scroll indicator */}
        <View style={styles.scrollIndicator} />
      </View>

      {/* ── SECTION 1: Login ── */}
      <View style={[styles.loginSection, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.loginWordmark}>GLASSNIK</Text>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {(['signin', 'create'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Inputs */}
        <View style={{ marginTop: 32 }}>
          {tab === 'create' && (
            <FloatLabelInput label="Name" value={name} onChangeText={setName} />
          )}
          <FloatLabelInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <FloatLabelInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* CTA */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} disabled={loading}>
          {loading
            ? <ActivityIndicator color={C.cream} />
            : <Text style={styles.continueText}>
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          {['Google', 'Apple'].map((p) => (
            <TouchableOpacity key={p} style={styles.socialBtn} onPress={handleContinue}>
              <Text style={styles.socialText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wordmark: { position: 'absolute', left: 20, fontFamily: F.displayMedium, fontSize: 18, color: C.white, zIndex: 10 },
  heroCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  heroHeadline: { fontFamily: F.display, fontSize: 42, color: C.white, textAlign: 'center', lineHeight: 52, marginBottom: 12 },
  heroBody: { fontFamily: F.body, fontSize: 16, color: C.whiteMuted, textAlign: 'center', marginBottom: 32 },
  btnFilled: { width: '100%', height: 52, backgroundColor: C.charcoal, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnFilledText: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.cream },
  btnGhost: { width: '100%', height: 52, borderWidth: 1, borderColor: C.white, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnGhostText: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.white },
  scrollIndicator: { alignSelf: 'center', width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  loginSection: { width, minHeight: height, backgroundColor: C.cream, paddingHorizontal: 32, paddingBottom: 60 },
  loginWordmark: { fontFamily: F.displayMedium, fontSize: 18, color: C.charcoal, textAlign: 'center', marginBottom: 24 },
  tabRow: { flexDirection: 'row', gap: 24 },
  tabBtn: { paddingBottom: 8 },
  tabText: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.muted },
  tabTextActive: { color: C.charcoal },
  tabUnderline: { height: 2, backgroundColor: C.sand, borderRadius: 1, marginTop: 4 },
  errorText: { fontFamily: F.body, fontSize: 13, color: '#E8735A', marginTop: 8, marginBottom: 2 },
  continueBtn: { height: 52, backgroundColor: C.charcoal, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  continueText: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.cream },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.sand },
  dividerText: { fontFamily: F.body, fontSize: 12, color: C.muted },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  socialBtn: { flex: 1, height: 52, borderWidth: 1, borderColor: C.charcoal, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  socialText: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.charcoal },
  forgotText: { fontFamily: F.body, fontSize: 13, color: C.muted },
});
