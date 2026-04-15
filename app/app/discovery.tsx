import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, ScrollView, Dimensions, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { C, F } from '../src/constants/theme';
import { MOCK_VIDEOS, MOCK_PROFILES } from '../src/api/mockData';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 3) / 2;

const TABS = ['Explore', 'Videographers', 'Trending', 'Nearby', 'Global', 'Spotify'] as const;
type Tab = typeof TABS[number];

const CATEGORIES = [
  { label: 'Street Scenes', icon: 'map-pin' },
  { label: 'Food & Markets', icon: 'shopping-bag' },
  { label: 'Nature & Adventure', icon: 'wind' },
  { label: 'Historic Sites', icon: 'layers' },
  { label: 'Beaches & Islands', icon: 'anchor' },
  { label: 'Shopping', icon: 'tag' },
  { label: 'Events', icon: 'calendar' },
  { label: 'See more', icon: 'chevron-right' },
] as const;

// ─── Sub-tab screens ─────────────────────────────────────────────────────────

function ExploreTab({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const filtered = MOCK_VIDEOS.filter(
    (v) =>
      !search ||
      v.place?.toLowerCase().includes(search.toLowerCase()) ||
      v.category?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.label} style={styles.chip} activeOpacity={0.7}
            onPress={() => setSearch(cat.label === 'See more' ? '' : cat.label)}>
            <Feather name={cat.icon as any} size={13} color={C.white} style={{ marginRight: 5 }} />
            <Text style={styles.chipText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Trending Now</Text>
      <View style={styles.grid}>
        {filtered.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.gridThumb, i % 2 === 0 ? { marginRight: 1.5 } : { marginLeft: 1.5 }]}
            onPress={() => router.push('/(viewer)' as any)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: item.thumbnailUrl ?? '' }}
              style={styles.thumbImg}
              contentFit="cover"
            />
            <View style={styles.thumbOverlay}>
              <Feather name="eye" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.thumbViews}>{(item.viewCount / 1000).toFixed(1)}K</Text>
            </View>
            <View style={styles.thumbMeta}>
              <Text style={styles.thumbCategory}>{item.category}</Text>
              <Text style={styles.thumbPlace} numberOfLines={1}>{item.place}</Text>
              <Text style={styles.thumbLocation}>{item.city}, {item.country}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function VideographersTab() {
  const profiles = Object.values(MOCK_PROFILES);
  return (
    <FlatList
      data={profiles}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.videographerRow}
          onPress={() => router.push(`/profile/${item.id}` as any)}
          activeOpacity={0.8}
        >
          <View style={styles.vgAvatar}>
            <Text style={styles.vgAvatarText}>{item.displayName[0]}</Text>
          </View>
          <View style={styles.vgInfo}>
            <Text style={styles.vgName}>{item.displayName}</Text>
            <Text style={styles.vgHandle}>@{item.username}</Text>
            <Text style={styles.vgStats}>{item.videoCount} videos · {item.followerCount.toLocaleString()} followers</Text>
          </View>
          <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function TrendingTab() {
  const sorted = [...MOCK_VIDEOS].sort((a, b) => b.viewCount - a.viewCount);
  return (
    <FlatList
      data={sorted}
      keyExtractor={(v) => String(v.id)}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.trendingRow}
          onPress={() => router.push('/(viewer)' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.trendRank}>#{index + 1}</Text>
          <Image source={{ uri: item.thumbnailUrl ?? '' }} style={styles.trendThumb} contentFit="cover" />
          <View style={styles.trendInfo}>
            <Text style={styles.trendCategory}>{item.category} · {item.place}</Text>
            <Text style={styles.trendPlace} numberOfLines={1}>{item.place}</Text>
            <Text style={styles.trendLocation}>{item.city}, {item.country}</Text>
            <View style={styles.trendStats}>
              <Feather name="eye" size={11} color="rgba(255,255,255,0.5)" />
              <Text style={styles.trendViews}>{(item.viewCount / 1000).toFixed(1)}K views</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function NearbyTab() {
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [videos, setVideos] = useState(MOCK_VIDEOS);

  const requestLocation = async () => {
    setLocStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocStatus('denied'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      setCoords({ lat, lng });
      setLocStatus('granted');
      // Fetch nearby from backend; falls back to mock on error
      const { getNearbyFeed } = await import('../src/api/feed');
      const data = await getNearbyFeed({ lat, lng, radius: 50 });
      if (data.length > 0) setVideos(data as any);
    } catch {
      setLocStatus('denied');
    }
  };

  useEffect(() => { requestLocation(); }, []);

  if (locStatus === 'loading') {
    return (
      <View style={styles.nearbyPermission}>
        <ActivityIndicator color="#4ECDC4" />
        <Text style={styles.nearbyPermissionText}>Getting your location…</Text>
      </View>
    );
  }

  if (locStatus === 'denied') {
    return (
      <View style={styles.nearbyPermission}>
        <Feather name="map-pin" size={36} color="rgba(255,255,255,0.2)" />
        <Text style={styles.nearbyPermissionTitle}>Location access needed</Text>
        <Text style={styles.nearbyPermissionText}>
          Enable location in Settings to discover Eye-POV experiences near you
        </Text>
        <TouchableOpacity style={styles.nearbyRetryBtn} onPress={requestLocation} activeOpacity={0.8}>
          <Text style={styles.nearbyRetryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* Location header */}
      <View style={styles.nearbyHeader}>
        <Feather name="map-pin" size={16} color="#4ECDC4" />
        <Text style={styles.nearbyLocation}>
          {coords ? `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°` : 'Your Location'}
        </Text>
        <TouchableOpacity
          style={styles.nearbyRefreshBtn}
          onPress={requestLocation}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={13} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      {videos.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.nearbyCard}
          onPress={() => router.push('/(viewer)' as any)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.thumbnailUrl ?? '' }} style={styles.nearbyThumb} contentFit="cover" />
          <View style={styles.nearbyOverlay}>
            <View style={styles.nearbyViews}>
              <Feather name="eye" size={11} color="rgba(255,255,255,0.8)" />
              <Text style={styles.nearbyViewsText}>{(item.viewCount / 1000).toFixed(1)}K</Text>
            </View>
          </View>
          <View style={styles.nearbyMeta}>
            <Text style={styles.nearbyCategory}>{item.category} · {item.place}</Text>
            <Text style={styles.nearbyPlace} numberOfLines={1}>{item.place}</Text>
            <Text style={styles.nearbyCity}>{item.city}, {item.country}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function GlobalTab() {
  const PINS = [
    { label: 'Bangkok', top: '52%', left: '68%' },
    { label: 'Tokyo', top: '42%', left: '78%' },
    { label: 'Rome', top: '38%', left: '50%' },
    { label: 'Paris', top: '34%', left: '47%' },
    { label: 'New York', top: '40%', left: '22%' },
  ];
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.mapContainer}>
        {/* Map placeholder */}
        <View style={styles.mapBg}>
          <Text style={styles.mapTitle}>Global Experiences</Text>
          {PINS.map((pin) => (
            <TouchableOpacity
              key={pin.label}
              style={[styles.mapPin, { top: pin.top as any, left: pin.left as any }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(viewer)' as any)}
            >
              <Feather name="map-pin" size={20} color="#4ECDC4" />
              <Text style={styles.mapPinLabel}>{pin.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.globalCard}>
        <Image
          source={{ uri: MOCK_VIDEOS[0].thumbnailUrl ?? '' }}
          style={styles.globalCardThumb}
          contentFit="cover"
        />
        <View style={{ flex: 1, padding: 12 }}>
          <Text style={styles.globalCardCategory}>Events · Exploring</Text>
          <Text style={styles.globalCardPlace}>{MOCK_VIDEOS[0].place}</Text>
          <Text style={styles.globalCardCity}>{MOCK_VIDEOS[0].city}, {MOCK_VIDEOS[0].country}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={styles.globalBtn} onPress={() => router.push('/(viewer)' as any)} activeOpacity={0.8}>
              <Feather name="play" size={12} color={C.white} />
              <Text style={styles.globalBtnText}>Watch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.globalBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} activeOpacity={0.8}>
              <Text style={[styles.globalBtnText, { color: C.white }]}>View all in location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SpotifyTab() {
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const MODES = ['Play Liked Songs', 'Play Selected Playlist', 'Play Saved Albums', 'Spotify Recommended'];
  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View style={styles.spotifyHeader}>
        <Feather name="music" size={32} color="#1DB954" />
        <Text style={styles.spotifyTitle}>Spotify Integration</Text>
        <Text style={styles.spotifySubtitle}>
          Listen to music while watching Eye-POV experiences. Music plays automatically and stays on across videos.
        </Text>
      </View>

      {!connected ? (
        <TouchableOpacity style={styles.spotifyConnectBtn} onPress={() => setConnected(true)} activeOpacity={0.8}>
          <Feather name="music" size={18} color={C.white} />
          <Text style={styles.spotifyConnectText}>Connect Spotify</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <View style={styles.spotifyConnected}>
            <Feather name="check-circle" size={16} color="#1DB954" />
            <Text style={styles.spotifyConnectedText}>Connected to Spotify</Text>
          </View>
          <Text style={styles.spotifyModeLabel}>Default Playback Mode</Text>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={styles.spotifyModeRow}
              onPress={() => setMode(m)}
              activeOpacity={0.7}
            >
              <Feather
                name={mode === m ? 'check-circle' : 'circle'}
                size={16}
                color={mode === m ? '#1DB954' : 'rgba(255,255,255,0.35)'}
              />
              <Text style={[styles.spotifyModeText, mode === m && { color: '#1DB954' }]}>{m}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.spotifyDivider} />
          <Text style={styles.spotifyNote}>
            Category-based music: When enabled, Spotify automatically suggests music that matches the vibe of the category you are watching.
          </Text>
          <TouchableOpacity style={[styles.spotifyConnectBtn, { backgroundColor: '#333', marginTop: 16 }]}
            onPress={() => setConnected(false)} activeOpacity={0.8}>
            <Text style={styles.spotifyConnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Main Discovery Screen ───────────────────────────────────────────────────
export default function DiscoveryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Explore');
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const renderTab = () => {
    switch (activeTab) {
      case 'Explore': return <ExploreTab search={search} setSearch={setSearch} />;
      case 'Videographers': return <VideographersTab />;
      case 'Trending': return <TrendingTab />;
      case 'Nearby': return <NearbyTab />;
      case 'Global': return <GlobalTab />;
      case 'Spotify': return <SpotifyTab />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discovery</Text>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)} style={styles.closeBtn} activeOpacity={0.7}>
          <Feather name="x" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations or videos..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <Feather name="x-circle" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={{ flex: 1 }}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontFamily: F.display, fontSize: 26, color: C.white },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: C.white, fontFamily: F.body, fontSize: 14 },
  tabBar: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 4, gap: 8, alignItems: 'center', height: 50 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)',
    alignSelf: 'center', height: 34, justifyContent: 'center',
  },
  tabActive: { backgroundColor: '#4ECDC4' },
  tabText: { fontFamily: F.bodySemiBold, fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  tabTextActive: { color: '#111' },

  // Explore
  chipRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  chipText: { color: C.white, fontFamily: F.bodySemiBold, fontSize: 12 },
  sectionLabel: {
    fontFamily: F.bodySemiBold, fontSize: 11, color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 1 },
  gridThumb: { width: THUMB_SIZE, height: THUMB_SIZE * 1.2, marginBottom: 3, position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  thumbOverlay: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  thumbViews: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: F.bodySemiBold },
  thumbMeta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10, backgroundColor: 'rgba(0,0,0,0.6)',
  },
  thumbCategory: { color: '#4ECDC4', fontSize: 9, fontFamily: F.bodySemiBold, letterSpacing: 0.5 },
  thumbPlace: { color: C.white, fontSize: 13, fontFamily: F.bodySemiBold, marginTop: 2 },
  thumbLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: F.body, marginTop: 1 },

  // Videographers
  videographerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  vgAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.sand, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  vgAvatarText: { fontFamily: F.bodySemiBold, fontSize: 18, color: C.charcoal },
  vgInfo: { flex: 1 },
  vgName: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.white },
  vgHandle: { fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  vgStats: { fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  followBtn: {
    borderWidth: 1, borderColor: '#4ECDC4',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
  },
  followBtnText: { color: '#4ECDC4', fontFamily: F.bodySemiBold, fontSize: 12 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20 },

  // Trending
  trendingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  trendRank: { fontFamily: F.display, fontSize: 20, color: 'rgba(255,255,255,0.2)', width: 32 },
  trendThumb: { width: 90, height: 60, borderRadius: 8, marginRight: 12 },
  trendInfo: { flex: 1 },
  trendCategory: { color: '#4ECDC4', fontSize: 10, fontFamily: F.bodySemiBold, letterSpacing: 0.5 },
  trendPlace: { color: C.white, fontSize: 14, fontFamily: F.bodySemiBold, marginTop: 3 },
  trendLocation: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: F.body, marginTop: 2 },
  trendStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  trendViews: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: F.body },

  // Nearby
  nearbyPermission: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 14, padding: 32,
  },
  nearbyPermissionTitle: { fontFamily: F.display, fontSize: 20, color: C.white, textAlign: 'center' },
  nearbyPermissionText: { fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 21 },
  nearbyRetryBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 12,
    backgroundColor: '#4ECDC4', borderRadius: 24,
  },
  nearbyRetryText: { fontFamily: F.bodySemiBold, fontSize: 13, color: '#111' },
  nearbyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  nearbyLocation: { flex: 1, color: C.white, fontFamily: F.bodySemiBold, fontSize: 13 },
  nearbyRefreshBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(78,205,196,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  nearbyCard: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  nearbyThumb: { width: '100%', height: 180 },
  nearbyOverlay: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  nearbyViews: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3,
  },
  nearbyViewsText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: F.bodySemiBold },
  nearbyMeta: { padding: 12 },
  nearbyCategory: { color: '#4ECDC4', fontSize: 10, fontFamily: F.bodySemiBold, letterSpacing: 0.5 },
  nearbyPlace: { color: C.white, fontSize: 15, fontFamily: F.bodySemiBold, marginTop: 3 },
  nearbyCity: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: F.body, marginTop: 2 },

  // Global
  mapContainer: { marginHorizontal: 16, marginTop: 8, marginBottom: 20 },
  mapBg: {
    height: 220, backgroundColor: '#1a2744', borderRadius: 16,
    position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  mapTitle: { fontFamily: F.display, fontSize: 18, color: 'rgba(255,255,255,0.5)', position: 'absolute', top: 16 },
  mapPin: { position: 'absolute', alignItems: 'center' },
  mapPinLabel: { color: C.white, fontFamily: F.bodySemiBold, fontSize: 9, marginTop: 2, textAlign: 'center' },
  globalCard: {
    flexDirection: 'row', marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
  },
  globalCardThumb: { width: 110, height: 100 },
  globalCardCategory: { color: '#4ECDC4', fontSize: 9, fontFamily: F.bodySemiBold, letterSpacing: 0.5 },
  globalCardPlace: { color: C.white, fontSize: 14, fontFamily: F.bodySemiBold, marginTop: 4 },
  globalCardCity: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: F.body, marginTop: 2 },
  globalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#4ECDC4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  globalBtnText: { color: '#111', fontFamily: F.bodySemiBold, fontSize: 11 },

  // Spotify
  spotifyHeader: { alignItems: 'center', marginBottom: 28 },
  spotifyTitle: { fontFamily: F.display, fontSize: 24, color: C.white, marginTop: 12 },
  spotifySubtitle: { fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  spotifyConnectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#1DB954', borderRadius: 30, paddingVertical: 16,
  },
  spotifyConnectText: { color: C.white, fontFamily: F.bodySemiBold, fontSize: 15 },
  spotifyConnected: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  spotifyConnectedText: { color: '#1DB954', fontFamily: F.bodySemiBold, fontSize: 14 },
  spotifyModeLabel: { color: 'rgba(255,255,255,0.4)', fontFamily: F.bodySemiBold, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  spotifyModeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  spotifyModeText: { color: C.white, fontFamily: F.body, fontSize: 15 },
  spotifyDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },
  spotifyNote: { color: 'rgba(255,255,255,0.4)', fontFamily: F.body, fontSize: 13, lineHeight: 20 },
});
