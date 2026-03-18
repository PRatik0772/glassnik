# Glassnik Full UI Redesign — Design Spec
**Date:** 2026-03-18
**Status:** Draft

---

## Overview

A complete redesign of the Glassnik mobile app (Expo / React Native, runs in browser via Expo Web). The goal is a full, immersive editorial experience — warm neutrals, bold serif typography, cinematic content — with a continuous spatial flow from landing page through to the video feed.

**Design language:** Editorial / magazine (Airbnb meets Vogue)
**Motion principle:** Everything moves in one direction — upward. Scroll is the navigation.

---

## Color Palette (canonical)

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#F5F0E8` | Primary background (Landing, Login, Dashboard) |
| `surface` | `#EDE8DF` | Card surfaces, input backgrounds |
| `charcoal` | `#1C1C1A` | Primary text, filled buttons, icons |
| `sand` | `#C4B5A0` | Dividers, inactive tabs, category tags, input borders |
| `muted` | `rgba(28,28,26,0.45)` | Secondary text, placeholder labels |
| `white` | `#FFFFFF` | Text on dark/video backgrounds |
| `white-muted` | `rgba(255,255,255,0.65)` | Secondary text on video |
| `vignette` | `rgba(196,181,160,0.35)` | Feed vignette edges (warm sand, not black) |

---

## Typography

| Role | Family | Weight | Size |
|------|--------|--------|------|
| Display / Hero headline | Playfair Display | 700 | 48px |
| Greeting / Section headline | Playfair Display | 600 | 28px |
| Place name (feed) | Playfair Display | 700 | 28px |
| Place name (card) | Playfair Display | 600 | 14px |
| Body copy | Inter | 400 | 16px |
| Button label | Inter | 600 | 15px |
| Row label | Inter | 600 | 11px, letter-spacing 1.5px, uppercase |
| Location / meta | Inter | 400 | 12px, letter-spacing 2px, uppercase |
| Caption | Inter | 400 | 14px |
| Tiny / footnote | Inter | 400 | 12px |

Fonts loaded via `expo-font`. Google Fonts: `Playfair_Display` (600, 700) + `Inter` (400, 600).

**Prerequisites — install before implementation:**
```bash
cd app && expo install expo-blur expo-font
```

---

## Navigation Architecture

### Migration from Existing Structure

The existing codebase has:
```
app/app/
  _layout.tsx          ← root Stack: (auth), (viewer), discovery, profile/[id]
  (auth)/login.tsx
  (auth)/register.tsx
  (viewer)/index.tsx
  discovery.tsx
  profile/[id].tsx
```

**Files to delete:** `(auth)/login.tsx`, `(auth)/register.tsx`, `discovery.tsx`
**Files to replace:** `_layout.tsx` (root), `(viewer)/index.tsx`
**Files to keep:** `profile/[id].tsx` (reuse, restyle later)
**Files to add:** `onboarding.tsx`, `(tabs)/_layout.tsx`, `(tabs)/index.tsx`, `(tabs)/explore.tsx`, `(tabs)/saved.tsx`, `(tabs)/profile.tsx`

Auth state: existing `app/src/store/auth.store.ts` drives the redirect in `app/index.tsx`. Keep the store; redirect logic replaces the (auth) group.

### Target Expo Router Structure

```
app/app/
  _layout.tsx           → root Stack: onboarding (no header), (tabs) (no header), (viewer) (no header)
  index.tsx             → redirects: authed → /(tabs), else → /onboarding
  onboarding.tsx        → scroll-unified: Landing + Login + Sign Up (single screen)
  (tabs)/
    _layout.tsx         → Tabs navigator (4 tabs, no default header)
    index.tsx           → Dashboard (Home tab)
    explore.tsx         → Explore tab
    saved.tsx           → Saved tab
    profile.tsx         → Profile tab
  (viewer)/
    _layout.tsx         → Stack.Screen presentation: "fullScreenModal", headerShown: false
    index.tsx           → Feed (full-screen vertical paging FlatList)
  profile/
    [id].tsx            → Keep existing, restyle later
```

Root `_layout.tsx` stack screens:
```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="onboarding" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="(viewer)" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
  <Stack.Screen name="profile/[id]" />
</Stack>
```

After successful auth in onboarding: `router.replace('/(tabs)')`.

### Feed State Store

Reuse and extend `app/src/store/feed.store.ts`. Add:
```ts
interface FeedStore {
  // existing fields...
  activeVideoId: string | null
  setActiveVideoId: (id: string) => void
}
```

Card tap: call `useFeedStore.getState().setActiveVideoId(video.id)` then `router.push('/(viewer)')`. Feed screen reads `activeVideoId` from the store on mount.

### Feed Entry / Exit (Card → Feed Transition)

**Entry (native):**
1. Card component calls `cardRef.current.measure((x, y, w, h, pageX, pageY) => ...)` on tap to capture absolute position
2. Store position in a `TransitionContext` React context (not Zustand — Reanimated `SharedValue` objects must be created inside React components via `useSharedValue`, they cannot live in Zustand). The context is created in a `TransitionProvider` component that wraps the root Stack navigator. It exports a `useTransitionValues()` hook returning the shared values (`cardX`, `cardY`, `cardW`, `cardH`)
3. Feed screen calls `useTransitionValues()` and runs `useAnimatedStyle` to animate from card rect → full screen over 350ms using `withTiming(..., { easing: Easing.out(Easing.cubic) })`
4. File: `app/src/context/TransitionContext.tsx` — exports `TransitionProvider` and `useTransitionValues`
5. This is a manual Reanimated interpolation approach — no third-party shared element library needed

**Entry (web):** Expo Router stack with `animation: 'fade'` (set on the `(viewer)` Stack.Screen). No layout measurement needed.

**Exit:** Swipe right on Feed (horizontal pan gesture, threshold 80px, velocity > 500) → `router.back()`. On Expo Web, a `←` back button (top-left, below safe area) calls `router.back()` instead.

---

## Screen 1: Landing Page (`onboarding.tsx` — section 0)

### Layout

Full-viewport cinematic hero. A full-screen image (or muted looping video via `expo-video` on native / `<video>` on web) fills the screen edge-to-edge. Warm sand/cream color wash overlay at 20% opacity.

Safe area: top wordmark respects `useSafeAreaInsets().top` + 16px padding.

### Elements

- **Top-left (safe area aware):** `GLASSNIK` — Playfair Display 600, 18px, `#F5F0E8`
- **Center (absolute, vertically centered):**
  - Headline: *"See the world through someone else's eyes"* — Playfair Display 700, 48px, `#F5F0E8`, 2 lines, centered
  - Body: *"Discover places, people, and moments — unfiltered"* — Inter 400, 16px, `rgba(255,255,255,0.65)`, 8px below headline
  - CTAs: 24px below body copy
    - `Start Exploring` — charcoal fill `#1C1C1A`, `#F5F0E8` text, height 52px, radius 12px, full width minus 32px margin
    - `Sign In` — transparent bg, `#F5F0E8` border 1px, `#F5F0E8` text, same dimensions, 12px below
- **Bottom center:** Scroll indicator — 1px wide vertical line, 32px tall, `rgba(255,255,255,0.5)`, pulsing opacity animation (1s ease-in-out, repeat)

### Scroll Transition (Landing → Login)

Implemented with `useAnimatedScrollHandler` + `useSharedValue`. Scroll offset ranges:

| Scroll Y | Effect |
|----------|--------|
| 0–100 | Nothing |
| 100–300 | Hero video/image scales from 1.0 → 0.9, headline + body translate Y from 0 → -60px and opacity 1 → 0. Blur effect: on native, use `expo-blur` `BlurView` (supported on iOS/Android); on web, apply `style={{ filter: 'blur(8px)' }}` via `HeroVideo.web.tsx` platform split (same `.web.tsx` suffix pattern already used by `VideoPlayer.web.tsx`) |
| 200–400 | Cream panel `#F5F0E8` bleeds in from bottom (translateY from +100% → 0%) |
| 300–500 | Login form fades in (opacity 0 → 1) |

Easing: `Easing.out(Easing.cubic)` throughout.

`ScrollView` with `scrollEnabled` on both platform and web. On web: standard browser scroll. On native: `ScrollView` with `scrollEventThrottle={16}`.

---

## Screen 2: Login / Sign Up (`onboarding.tsx` — section 1)

### Layout

Cream `#F5F0E8` full-screen. Centered content column, 32px horizontal padding.

### Elements

- **Top center:** `GLASSNIK` — Playfair Display 600, 18px, charcoal — 48px from top
- **Toggle tabs (24px below wordmark):**
  - `Sign In` / `Create Account` — Inter 600, 14px, charcoal
  - Active tab: 2px solid sand `#C4B5A0` underline
  - Inactive: no border, `muted` color
  - Switching tabs: animates the underline position via `useSharedValue` + `withSpring`
- **Inputs (32px below tabs):**
  - Email: no box, bottom border 1px `#C4B5A0`, label floats up on focus (translateY -20px, scale 0.85, Inter 400 12px sand)
  - Password: same treatment + show/hide toggle icon (charcoal, right side)
  - Create Account adds: Name field (same treatment)
- **CTA (24px below last input):** `Continue` — charcoal fill, cream text, full width, 52px height, 12px radius
- **Divider (16px below CTA):** sand line + Inter 400 12px muted `or continue with`
- **Social row (12px below divider):** Google + Apple buttons side-by-side — ghost, charcoal border 1px, 52px height, 12px radius, Inter 600 14px charcoal
- **Footer (16px below social):** `Forgot password?` — Inter 400 13px, `muted`

### Auth Transition

On successful auth: `router.replace('/(tabs)')`. No scroll animation needed — the route change handles transition.

On `Start Exploring` CTA from landing: scroll programmatically to Login section (via `scrollViewRef.current.scrollTo({ y: screenHeight, animated: true })`).

---

## Screen 3: Dashboard (`(tabs)/index.tsx`)

### Layout

Cream `#F5F0E8` background. `ScrollView` vertical, no paging.

### Header (sticky)

- Background: `#F5F0E8`, bottom border 1px `rgba(196,181,160,0.3)`
- Top-left: `GLASSNIK` — Playfair Display 600, 18px, charcoal
- Top-right: search icon (24px, charcoal) → taps to expand inline search bar with `withSpring` width animation; avatar circle 32px (user photo or initials)
- Below icons: *"Good evening, Pratik"* — Playfair Display 600, 28px, charcoal, 16px top margin

### Featured Strip

- Full-bleed horizontal `FlatList`, `showsHorizontalScrollIndicator={false}`
- Card width: `screenWidth - 32px`, 16:9 ratio
- `snapToInterval`: card width + 12px gap
- `decelerationRate: 'fast'`
- Each card:
  - Image: `Image` with `resizeMode="cover"`, radius 16px
  - Bottom overlay (LinearGradient `transparent → rgba(28,28,26,0.7)`):
    - Category pill: `#C4B5A0` bg, charcoal text, Inter 600 11px, 6px padding horizontal, 4px vertical, 6px radius
    - Place name: Playfair Display 700, 22px, white, 4px below pill
    - Location: Inter 400, 12px, `rgba(255,255,255,0.65)`, letter-spacing 2px, uppercase

### Content Rows (× 3)

Row label: Inter 600, 11px, `#1C1C1A`, letter-spacing 1.5px, uppercase, 24px top margin, 16px left padding.

Horizontal `FlatList` of portrait cards:
- Card: width `(screenWidth - 48px) / 2.2` (bleeds off right edge), aspect ratio 9:16
- Card bg: `#EDE8DF` surface
- Image: `resizeMode="cover"`, full card, radius 12px
- Below image: category tag (sand text, Inter 600, 10px) + place name (Playfair Display 600, 14px, charcoal)
- Gap between cards: 10px
- Left padding: 16px

### Data Sources

| Row | Endpoint (TBD by backend) | Fallback |
|-----|--------------------------|---------|
| Featured Strip | `GET /videos/featured` | Static mock data |
| Trending Now | `GET /videos/trending` | Static mock data |
| Near You | `GET /videos/nearby?lat=&lng=` | Static mock data |
| Following | `GET /videos/following` | Static mock data (empty if no following) |

For initial implementation: use static mock arrays. API integration is a separate task.

### Card Tap → Feed

On card tap: store selected video ID in a Zustand atom / context. Navigate to `/(viewer)`. On web: standard push navigation with fade. On native: Reanimated layout animation scales card to full screen over 350ms, `Easing.out(Easing.cubic)`.

### Bottom Navigation (`(tabs)/_layout.tsx`)

- `Tabs` component from Expo Router
- `tabBarStyle`: cream bg `#F5F0E8`, top border 1px sand `rgba(196,181,160,0.3)`, height 64px + safe area bottom
- `tabBarShowLabel: false` — icon only
- Active icon: charcoal `#1C1C1A`; inactive: `rgba(28,28,26,0.35)`
- Active indicator: 4px × 4px sand `#C4B5A0` dot below icon
- Icons (Lucide or custom SVG): Home, Compass (Explore), Bookmark (Saved), User (Profile)
- Icon size: 24px

### Other Tabs (Explore, Saved, Profile)

Minimal viable screens for initial implementation:

**Explore (`explore.tsx`):** Cream bg, `GLASSNIK` header, search bar (sand border, Inter 16px placeholder), `FlatList` of `EditorialCard` components — same as Content Row cards but in 2-column grid, 10px gap.

**Saved (`saved.tsx`):** Same layout as Explore but filtered to bookmarked videos from local store.

**Profile (`profile.tsx`):** Avatar (80px, sand ring 2px), display name (Playfair Display 700, 24px), username (Inter 400, 14px, muted), stats row (Videos / Following / Followers — Inter 600 16px, Inter 400 12px muted label), divider, 3-column grid of saved video thumbnails.

---

## Screen 4: The Feed (`(viewer)/index.tsx`)

### Layout

True full-bleed video — edge to edge, no safe area padding on bottom. Top `For You / Following` toggle respects `useSafeAreaInsets().top + 12px`.

### Video Layer

- `expo-video` on native, `<video>` fallback on web (existing `VideoPlayer.web.tsx`)
- Autoplay: `shouldPlay={true}`, `isMuted={true}` initially
- Tap anywhere (excluding right rail and bottom overlay tap targets) → toggle `isMuted`
- Warm vignette: `LinearGradient` overlay, `rgba(196,181,160,0.35)` at edges:
  - Top: `rgba(196,181,160,0.35) → transparent` (top 120px)
  - Bottom: `transparent → rgba(28,28,26,0.55)` (bottom 200px)
  - Left edge + Right edge: subtle 40px `rgba(196,181,160,0.2) → transparent`

### Feed Scroll (native)

`FlatList` with `pagingEnabled={true}`, `showsVerticalScrollIndicator={false}`, vertical. Each item is full screen height.

**Web fallback:** On web, `pagingEnabled` does not work reliably. Use a `div` with `overflow-y: scroll; scroll-snap-type: y mandatory` via inline style or `ScrollView` with custom web scroll snap CSS. Each video section: `scroll-snap-align: start; height: 100vh`.

### Gesture Handling (native only)

Feed uses `GestureDetector` from `react-native-gesture-handler`:

- `Gesture.Pan()` — `activeOffsetX: [-10, 10]` (horizontal threshold to avoid conflicting with vertical paging `FlatList`)
- On pan right (translation X > 80px AND velocity X > 500): `router.back()`
- Simultaneous gestures: `Gesture.Simultaneous(panGesture, nativeScrollGesture)` to allow both vertical scroll and horizontal back-swipe without conflict

On web: no swipe-right gesture. Instead, show a `←` icon button (24px, white, `rgba(255,255,255,0.7)`) top-left (below safe area) that calls `router.back()`.

### Overlay — Bottom Left

Positioned: `position: absolute`, `bottom: 80px` (above bottom safe area), `left: 16px`, `right: 80px` (leaves space for right rail).

- `@marco_ventures` — Inter 600, 13px, `rgba(255,255,255,0.65)`, letter-spacing 1px, uppercase
- `Amalfi Coast` — Playfair Display 700, 28px, white
- `SALERNO, ITALY` — Inter 400, 12px, `rgba(255,255,255,0.65)`, letter-spacing 2px, uppercase
- Caption (1–2 lines) — Inter 400, 14px, `rgba(255,255,255,0.85)` — animated: opacity 1 → 0 after 3s idle via `withDelay(3000, withTiming(0, { duration: 500 }))`; reappears on tap

### Tap Event Priority (Feed Video Surface)

The video surface handles three concerns on a single tap. Priority order (handled by a single `onPress` on the video wrapper `TouchableWithoutFeedback`):

1. **Reset idle timer** — always fires; resets the top bar fade timer and caption fade timer (no visible effect if already visible)
2. **Show caption** — if caption opacity is 0, animate back to 1; restart the 3s auto-hide timer
3. **Toggle mute** — always fires last

These three actions are **not exclusive** — a single tap does all three simultaneously. This is intentional: tap = "I'm interacting, show me everything + toggle mute." No conflicting handler priority needed.

Right rail and bottom overlay tap targets are raised above the video wrapper via `zIndex` and have their own `onPress` handlers — they do not propagate to the video surface.

### Overlay — Right Rail

Positioned: `position: absolute`, `right: 16px`, `bottom: 100px`. Vertical stack, `gap: 28px`. `zIndex: 10` (above video wrapper).

Each item: icon (28px, white) + count/label below (Inter 400, 11px, white) if applicable.

| Item | Icon | Action |
|------|------|--------|
| Avatar | User photo, 44px, sand ring 2px | `router.push('/profile/[id]')` |
| Like | Heart | Toggle like state (optimistic, local for now) |
| Share | Share icon | `Share.share()` from `expo-sharing` |
| Bookmark | Bookmark icon | Toggle saved state in Zustand store (persisted via AsyncStorage) |
| Explore | MapPin icon | Navigate to Explore tab with location filter (see below) |

**Explore tap (MapPin):** Call `useExploreStore.getState().setLocationFilter(video.location)` then `router.push('/(tabs)/explore')`. The Explore tab reads `locationFilter` from `app/src/store/explore.store.ts` on mount and pre-fills the search bar. Store shape:
```ts
interface ExploreStore {
  locationFilter: string | null
  setLocationFilter: (location: string | null) => void
}
```

### Top Bar

- `position: absolute`, `top: safeAreaTop + 12px`, width full, centered
- `For You` / `Following` toggle — Inter 600, 14px, white — active tab underlined with white 1.5px line
- Inactive tab: `rgba(255,255,255,0.5)`
- Idle fade: `withDelay(2000, withTiming(0, { duration: 400 }))` — reappears on any tap via the shared `onPress` handler on the video wrapper (see Tap Event Priority above)

---

## Component Inventory

| Component | File | Description |
|-----------|------|-------------|
| `HeroVideo` | `components/HeroVideo.tsx` + `components/HeroVideo.web.tsx` | Full-screen video/image with warm vignette overlay (web split for CSS blur) |
| `EditorialCard` | `components/EditorialCard.tsx` | Portrait 9:16 card, place name + category tag |
| `FeaturedCard` | `components/FeaturedCard.tsx` | 16:9 landscape hero card with gradient overlay |
| `FloatLabelInput` | `components/FloatLabelInput.tsx` | Bottom-border input with animated floating label |
| `GhostButton` | `components/GhostButton.tsx` | Outlined button, charcoal border |
| `FilledButton` | `components/FilledButton.tsx` | Charcoal fill, cream text |
| `RightRail` | `components/RightRail.tsx` | Vertical icon stack for feed interactions |
| `BottomNav` | via Expo Router Tabs | 4-icon tab bar with sand dot indicator |
| `ContentRow` | `components/ContentRow.tsx` | Labeled horizontal scroll row |
| `OnboardingScrollView` | `components/OnboardingScrollView.tsx` | Scroll-unified landing + login container |
| `TransitionContext` | `app/src/context/TransitionContext.tsx` | `TransitionProvider` + `useTransitionValues()` hook for card → feed animation shared values |
| `explore.store` | `app/src/store/explore.store.ts` | `locationFilter` state for Explore tab pre-fill |

---

## Platform Notes

| Concern | Native | Web |
|---------|--------|-----|
| Feed paging | `FlatList pagingEnabled` | CSS `scroll-snap-type: y mandatory` |
| Shared element (card → feed) | Reanimated layout animation | Fade transition via Expo Router |
| Swipe-right (feed → dashboard) | `GestureDetector` pan gesture | Back button overlay |
| Video | `expo-video` | `VideoPlayer.web.tsx` (`<video>`) |
| Vignette | `expo-linear-gradient` | `expo-linear-gradient` (web supported) |
| Scroll animation | `useAnimatedScrollHandler` | Same (Reanimated supports web) |
| Safe area | `useSafeAreaInsets` | Same |
| Hero blur | `expo-blur` `BlurView` | `HeroVideo.web.tsx` with `style={{ filter: 'blur(8px)' }}` |
| Card → Feed transition | Reanimated `useSharedValue` + `measure()` | Expo Router `animation: 'fade'` |

---

## Bookmark / Save Persistence

For initial implementation: Zustand store with `AsyncStorage` persistence (via `zustand/middleware/persist`). Store shape:

```ts
interface SavedStore {
  savedIds: string[]
  toggleSaved: (id: string) => void
  isSaved: (id: string) => boolean
}
```

Server sync is a separate future task.

---

## Success Criteria

1. Onboarding scroll (landing → login) is seamless — no navigation cut, pure scroll transform
2. Auth → Dashboard transition is instant (`router.replace`)
3. Dashboard renders featured strip + 3 content rows with mock data
4. Card → Feed transition feels cinematic on native; graceful fade on web
5. Feed is fully edge-to-edge on mobile; scroll-snap works in browser
6. Warm neutral palette `#F5F0E8 / #1C1C1A / #C4B5A0` is visually consistent across all screens
7. Playfair Display + Inter fonts load correctly on both platforms
8. All 4 tabs are navigable with correct icons and active state
9. Bookmark toggle persists across app restarts (AsyncStorage)
10. Back-swipe on native feed returns to dashboard; back button visible on web
