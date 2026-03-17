# Glassnik Experiences Mobile App — Design Spec
**Date:** 2026-03-16
**Scope:** Sections 1–7 of the Glassnik Experiences UX/UI Build Document (MVP)
**Stack:** Expo Router + NativeWind + Zustand + Mux + NestJS backend

---

## 1. Overview

Glassnik Experiences is a mobile app for watching Eye-POV videos captured with smart glasses. Content is organised by category, place, and location. The app opens directly into a full-screen video player — there is no home screen or feed list. Viewers tap to advance and swipe down to go back.

The MVP covers sections 1–7 of the UX spec:
1. Full-screen Eye-POV viewer
2. Tap/swipe navigation
3. Video metadata overlay (place, location, category)
4. Videographer profile page
5. Discovery screen (modal)
6. Explore tab (default discovery view)
7. Category filtering

The following are out of scope for MVP and will NOT be built (not even scaffolded):
- Trending tab, Nearby tab, Videographers tab, Global map, Spotify
- Upload screen + AI processing pipeline
- Live streaming (separate Glassnik platform spec)

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Expo SDK 51+ with Expo Router | File-based routing, deep linking |
| Styling | NativeWind v4 | Tailwind utility classes for RN |
| State | Zustand | Lightweight, no boilerplate |
| API client | Axios | JWT interceptor for token refresh |
| Video playback | `@mux/mux-player-react-native` | Requires EAS development build — Expo Go is NOT supported |
| Gestures | `react-native-gesture-handler` | Tap/swipe on video player |
| Secure storage | `expo-secure-store` | JWT token persistence |
| Sharing | `expo-sharing` + `expo-clipboard` | Share button on viewer |

> **Important:** Because `@mux/mux-player-react-native` is a native module, the app cannot be tested with Expo Go. An **EAS development build** must be created before any video playback can be tested on device.

---

## 3. Project Structure

```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (viewer)/
│   ├── _layout.tsx          ← Full-screen layout, hides status bar, dark bg
│   └── index.tsx            ← Eye-POV player — app entry point for guests + authed users
├── discovery.tsx            ← Discovery modal (··· button)
├── profile/
│   └── [id].tsx             ← Videographer profile page
└── _layout.tsx              ← Root layout — guest mode allowed (see Section 4.1)

src/
├── api/
│   ├── client.ts            ← Axios instance + JWT refresh interceptor
│   ├── feed.ts              ← GET /mobile/feed
│   ├── user.ts              ← GET /user/:id/profile
│   └── search.ts            ← GET /mobile/search
├── store/
│   ├── auth.store.ts        ← accessToken, refreshToken, user flags (nullable for guests)
│   └── feed.store.ts        ← videos[], currentIndex, activeCategory
├── components/
│   ├── VideoPlayer.tsx      ← Mux full-screen player wrapper
│   ├── VideoOverlay.tsx     ← Metadata + controls overlay
│   ├── CategorySelector.tsx ← Bottom sheet category list
│   ├── DiscoveryModal.tsx   ← Discovery screen container + Explore tab
│   └── VideographerCard.tsx ← Avatar + name row
└── hooks/
    ├── useFeed.ts           ← Paginated video fetching + pre-fetch logic
    └── useVideoGestures.ts  ← Tap → next, swipe down → previous
```

---

## 4. Design System

### 4.0 Color & Visual Language

**Palette — Pure Black + White. Zero color accents.**

| Token | Value | Usage |
|-------|-------|-------|
| `bg-base` | `#000000` | App background, video screen |
| `bg-surface` | `#0d0d0d` | Sheets, cards, modals |
| `bg-glass` | `rgba(255,255,255,0.08)` | Glass-frosted buttons, chips |
| `border-glass` | `rgba(255,255,255,0.12)` | Button + card borders |
| `border-muted` | `rgba(255,255,255,0.06)` | Separators in sheets |
| `text-primary` | `rgba(255,255,255,1.0)` | Headlines, active labels |
| `text-secondary` | `rgba(255,255,255,0.55)` | Subtext, metadata |
| `text-muted` | `rgba(255,255,255,0.35)` | Timestamps, placeholders |
| `icon-default` | `rgba(255,255,255,0.85)` | Icons at rest |

**Typography:**

| Role | Weight | Tracking |
|------|--------|---------|
| Place name | Bold (700) | Normal |
| Location (City, Country) | Regular (400) | Wide (0.12em) |
| Category badge | Medium (500) | Wide (0.08em), uppercase |
| Screen title (Explore) | Bold (700) | Normal |
| Chip labels | Medium (500) | Normal |

**Ghost Lens Vignette:**
Applied to every full-screen video as a `position: absolute` overlay, full bleed, no pointer events.
```
radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)
```
This mimics the curved optical falloff of a wide-angle glass lens.

**Glass Buttons:**
All action buttons on the viewer right rail are circular, 48×48dp, with:
- Background: `rgba(255,255,255,0.10)`
- Border: 1px `rgba(255,255,255,0.18)`
- Backdrop blur: `blur(12px)`
- Icon color: white at 0.85 opacity
- Active state: background tints to `rgba(255,255,255,0.20)`

---

## 5. Screen Designs

### 5.1 Full-Screen Eye-POV Viewer

**Guest mode:** `GET /mobile/feed` is publicly accessible (no auth guard). The root layout does NOT redirect to login on first launch. Users can watch without an account.

**Trigger:** App open

**Layout:**
```
┌──────────────────────────────────────┐
│ [Avatar 36px]  Username              │  ← top-left, tap → profile
│                                      │
│  (ghost lens vignette over video)    │  ← full-screen Mux video, autoplay, sound on
│                              [♥]    │  ← right rail: Like
│                              [↗]    │  ← right rail: Share
│                              [⊞]    │  ← right rail: Explore (opens discovery)
│                              [◈]    │  ← right rail: Category
│                                      │
│  [CATEGORY BADGE]                    │  ← bottom-left, uppercase pill
│  Place Name                          │  ← bold, white
│  City, Country                       │  ← muted, wide-tracked
└──────────────────────────────────────┘
```

**Top bar (no background, edge-to-edge):**
- Avatar: 36×36dp circle, `border: 1.5px solid rgba(255,255,255,0.6)`
- Username: `text-primary`, font-weight 500, 14sp
- No category button in top bar — replaced by right rail

**Right rail (TikTok-style, vertically centered):**
4 glass-frosted circular buttons stacked with 16dp gap, positioned 16dp from right edge:
1. **Like** — heart icon (fill on tap, no counter in MVP)
2. **Share** — arrow-up icon (triggers `expo-sharing`)
3. **Explore** — grid icon (opens Discovery modal)
4. **Category** — tag/compass icon (opens Category bottom sheet)

**Bottom-left metadata stack** (24dp from edge, 32dp from bottom safe area):
- Category badge: 24dp height pill, `bg-glass` border, text `text-secondary`, uppercase 10sp
- Place name: Bold 22sp, `text-primary`
- Location: Regular 13sp, `text-secondary`, letter-spacing 0.12em

**Vignette overlay:** `position: absolute`, full bleed, `pointerEvents: 'none'`
```
background: radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)
```

**Gestures:**
- Tap → advance to next video (`currentIndex + 1`)
- Swipe down → go to previous video (`currentIndex - 1`)

**Pre-fetch:** When `currentIndex === videos.length - 3`, fetch next page and append.

**States:**

| State | Behaviour |
|-------|-----------|
| Loading | `#000` full-screen + centered white spinner |
| Empty | "No videos available" + white ghost Refresh button |
| Error | "Something went wrong" + white ghost Retry button |
| Success | Video autoplays with overlay |

---

### 5.2 Category Selector

**Trigger:** Tap Category button (right rail, bottom)
**Behaviour:** Opens a bottom sheet. Selecting a category sets `feed.store.activeCategory`, resets the video list, and fetches `GET /mobile/feed?category=<slug>`.

**Bottom sheet styling:**
- Background: `#0d0d0d`
- Handle: 4×36dp rounded pill, `rgba(255,255,255,0.25)`
- List items: 48dp height, `text-primary` label, `text-secondary` video count
- Active item: white checkmark icon at right edge
- Separators: 1px `rgba(255,255,255,0.06)`

**Categories (MVP):**
`All`, `Street Scenes`, `Food & Markets`, `Nature & Adventure`, `Historic Sites`, `Beaches & Islands`, `Shopping`, `Events`

---

### 5.3 Discovery Screen

**Trigger:** Tap Explore button (right rail, third from top)
**Layout:** Full-screen modal, `#000` background, drag-to-dismiss

**Header:** "Explore" in Bold 28sp, `text-primary`, 24dp top padding

**Search bar:** Glass-frosted input, `bg-glass` background, 1px `border-glass` border, 14dp corner radius, placeholder `text-muted`

**Tab row (horizontal scroll, 16dp gap):**
- Active chip: solid white bg + black text, 24dp height pill
- Inactive chip: `bg-glass` border, `text-secondary` text (ghost style)
- MVP: only "Explore" chip is tappable

**Stub tabs** (Videographers, Trending, Nearby, Global, Spotify): visible but non-functional in MVP — chips render disabled at 0.35 opacity.

---

### 5.4 Explore Tab

**Section label:** "TRENDING NOW" — `text-muted`, uppercase, 10sp, wide-tracked

**2-column masonry grid:**
- Card: `bg-surface` (#0d0d0d), 8dp border radius, 1px `border-glass`
- Thumbnail: 16:9 image, fills card width, rounded top corners
- Card footer: place (13sp bold `text-primary`) + city (11sp `text-secondary`), 8dp padding

**Behaviour:**
- Active chip → filters grid via `GET /mobile/feed?category=<slug>`
- Search input → calls `GET /mobile/search?q=<text>` (debounced 300ms)
- Tap thumbnail → closes Discovery modal + jumps viewer to that video

**States:** Loading skeleton (ghost-white pulse cards), Empty ("No results"), Error + retry.

---

### 5.5 Videographer Profile Page

**Trigger:** Tap videographer name/avatar in viewer
**Background:** `#000000`

**Layout:**
```
← Back (white, top-left)
[Avatar 80px — white ring 2px border]
Display Name  (Bold 20sp, text-primary)
@username     (Regular 13sp, text-secondary)
─────────────── (hairline divider, rgba(255,255,255,0.08))
[X Videos]  |  [Y Followers*]   (stats separated by hairline vertical)
[Follow]   ← ghost button: border rgba(255,255,255,0.25), white text, disabled in MVP
─────────────────────────────────
Tight 3-col video grid (2dp gaps, no padding)
```

**Stats row:** each stat is `text-primary` number (Bold 17sp) over `text-muted` label (11sp Regular)

**Follow button:** 38dp height, full-width (80% of screen), `bg-glass` border, `text-primary`, disabled+opacity 0.4 in MVP

> **Note:** Follow/follower functionality requires a `Follow` junction table in the database, out of scope for MVP. Button renders disabled, follower count shows `0`.

**Behaviour:** Tap video in grid → opens viewer starting at that video, filtered to this videographer.

---

## 6. Backend Changes Required

### 6.1 Prisma Schema — VideoAsset

Add the following fields to the `VideoAsset` model:

```prisma
muxAssetId     String?   @map("mux_asset_id") @db.VarChar(255)
muxPlaybackId  String?   @map("mux_playback_id") @db.VarChar(255)
place          String?   @db.VarChar(255)
city           String?   @db.VarChar(100)
country        String?   @db.VarChar(100)
category       String?   @db.VarChar(100)
thumbnailUrl   String?   @map("thumbnail_url")
viewCount      Int       @default(0) @map("view_count")
```

> `muxPlaybackId` is required for the Mux player to render video. Without it, no video can play.

### 6.2 Prisma Schema — Fix avatarUrl column name

The current `avatarUrl` field maps to `"avatar_varcharurl"` which is a typo. Fix in the next migration:
```prisma
avatarUrl  String?  @map("avatar_url")
```

### 6.3 API Endpoints

#### `GET /mobile/feed` — Update existing

Add optional query params:
- `category` (string slug) — filter by category
- `trending` (boolean) — if `true`, sort by `viewCount DESC` instead of `createdAt DESC`

Response shape per item:
```json
{
  "id": 1,
  "muxPlaybackId": "abc123",
  "thumbnailUrl": "https://...",
  "place": "Chatuchak Market",
  "city": "Bangkok",
  "country": "Thailand",
  "category": "street-scenes",
  "viewCount": 2300,
  "owner": {
    "id": 5,
    "username": "jasoncarter",
    "displayName": "Jason Carter",
    "avatarUrl": "https://..."
  }
}
```

#### `GET /mobile/search?q=` — New endpoint

Search across `place`, `city`, `country`, `owner.username`, `owner.displayName`.
Response: same shape as feed items array (no pagination for MVP).

#### `GET /user/:id/profile` — Update existing `/user/:id`

Update `getPublicProfile()` to also return:
```json
{
  "id": 5,
  "username": "jasoncarter",
  "displayName": "Jason Carter",
  "avatarUrl": "https://...",
  "videoCount": 42,
  "followerCount": 0
}
```
And include a `videos` array of the user's uploaded videos (same shape as feed items).

---

## 7. Build Order

1. Backend: add Mux fields + location/category/viewCount fields to VideoAsset via Prisma migration
2. Backend: fix `avatarUrl` column name typo
3. Backend: update `GET /mobile/feed` to support `category` and `trending` filters
4. Backend: add `GET /mobile/search` endpoint
5. Backend: update `GET /user/:id` to return `videoCount`, `followerCount`, and `videos[]`
6. Mobile: initialise Expo app in `app/` folder with Expo Router + NativeWind
7. Mobile: configure EAS build for development client
8. Mobile: auth screens (login + register)
9. Mobile: core viewer screen (VideoPlayer + VideoOverlay + gestures)
10. Mobile: category selector bottom sheet
11. Mobile: discovery modal + explore tab
12. Mobile: videographer profile page
13. Mobile: loading/empty/error states on all screens
