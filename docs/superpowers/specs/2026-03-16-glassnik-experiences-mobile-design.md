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

Sections 8–15 (Trending, Nearby, Videographers, Global Attractions, Spotify, Upload, AI processing) are post-MVP and are scaffolded but not implemented.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Expo SDK 51+ with Expo Router | File-based routing, deep linking, fast setup |
| Styling | NativeWind v4 (Tailwind for RN) | Utility-first, consistent with web conventions |
| State | Zustand | Lightweight, no boilerplate |
| API client | Axios | Simple, interceptor support for JWT refresh |
| Video playback | Mux (`@mux/mux-player-react-native`) | Official RN SDK, usage-based pricing |
| Gestures | `react-native-gesture-handler` | Tap/swipe on video player |
| Secure storage | `expo-secure-store` | JWT token persistence |
| Location | `expo-location` | Nearby tab (scaffolded) |
| Sharing | `expo-sharing` + `expo-clipboard` | Share button on viewer |

---

## 3. Project Structure

```
app/                                    ← Expo Router root
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (viewer)/
│   ├── _layout.tsx                     ← Full-screen layout, hides status bar
│   └── index.tsx                       ← Eye-POV player (app entry point)
├── discovery.tsx                       ← Discovery modal (··· button)
├── profile/
│   └── [id].tsx                        ← Videographer profile page
├── upload.tsx                          ← Upload questionnaire (scaffolded)
└── _layout.tsx                         ← Root layout — auth gate

src/
├── api/
│   ├── client.ts                       ← Axios instance + JWT interceptor
│   ├── feed.ts                         ← GET /mobile/feed
│   ├── user.ts                         ← GET /user/:id/profile
│   └── search.ts                       ← GET /mobile/search
├── store/
│   ├── auth.store.ts                   ← accessToken, refreshToken, user flags
│   └── feed.store.ts                   ← videos[], currentIndex, activeCategory
├── components/
│   ├── VideoPlayer.tsx                 ← Mux full-screen player wrapper
│   ├── VideoOverlay.tsx                ← Metadata + controls overlay
│   ├── CategorySelector.tsx            ← Bottom sheet with category list
│   ├── DiscoveryModal.tsx              ← Discovery screen container
│   ├── ExploreTab.tsx                  ← 2-column thumbnail grid
│   └── VideographerCard.tsx            ← Avatar + name + follow button
└── hooks/
    ├── useFeed.ts                      ← Paginated video fetching + pre-fetch
    └── useVideoGestures.ts             ← Tap → next, swipe down → previous
```

---

## 4. Screen Designs

### 4.1 Full-Screen Eye-POV Viewer

**Trigger:** App open (authenticated or guest)
**Layout:**
```
┌─────────────────────────────────┐
│ [Avatar] Videographer Name [═══]│  ← top-left: avatar+name tap→profile
│                                 │     top-right: teal category button
│                                 │
│     (full-screen video)         │  ← Mux player, autoplay, muted default
│                                 │
│                                 │
│  Place Name              [↑↑]  │  ← bottom-left: place + city, country
│  City, Country                  │     bottom-right: share button
└─────────────────────────────────┘
     [···] top corner → Discovery
```

**Gestures:**
- Tap → advance to next video (`currentIndex + 1`)
- Swipe down → go to previous video (`currentIndex - 1`)

**States:**
- Loading: full-screen dark background + centered spinner
- Empty: "No videos available" message + refresh button
- Error: "Something went wrong" + retry button
- Success: video autoplays

**Pre-fetch logic:** When user reaches `currentIndex === videos.length - 3`, fetch the next page and append to store.

---

### 4.2 Category Selector

**Trigger:** Tap teal category button (top right of viewer)
**Behaviour:** Opens a bottom sheet with a list of categories. Selecting a category resets the feed and fetches `GET /mobile/feed?category=<selected>`.

**Categories (MVP):**
Street Scenes, Food & Markets, Nature & Adventure, Historic Sites, Beaches & Islands, Shopping, Events

---

### 4.3 Discovery Screen

**Trigger:** Tap `···` button on viewer
**Layout:** Full-screen modal with search bar at top and horizontal tab navigation.

**Tabs (MVP — Explore only fully implemented):**
- Explore (default)
- Videographers (scaffolded)
- Trending (scaffolded)
- Nearby (scaffolded)
- Global (scaffolded)
- Spotify (scaffolded)

**States:** Loading skeleton, empty state with prompt, error with retry.

---

### 4.4 Explore Tab

**Layout:**
```
Search bar: "Search location or videos..."
Category chips: [All] [Temples] [Markets] [Camping] ...  (horizontal scroll)
Section header: "Trending now"
2-column masonry grid of video thumbnails
  Each card: thumbnail image + place name + city overlay
```

**Behaviour:**
- Tapping a category chip filters the grid
- Tapping a thumbnail closes the Discovery modal and jumps the viewer to that video

---

### 4.5 Videographer Profile Page

**Trigger:** Tap videographer name or avatar in viewer
**Layout:** Slides up over viewer as a modal stack.

```
← Back    Videographer Name
[Avatar 80px]
Display Name
@username
[X videos]  [Y followers]
[Follow / Following button]
3-column grid of their uploaded videos
```

**Behaviour:**
- Tapping a video in the grid → opens viewer filtered to that videographer's content, starting at that video

---

## 5. Backend Changes Required

The following changes must be made to the NestJS backend before mobile development begins:

### 5.1 VideoAsset Schema (Prisma)

Add to `VideoAsset` model:
```prisma
place          String?
city           String?
country        String?
category       String?
thumbnailUrl   String?   @map("thumbnail_url")
viewCount      Int       @default(0) @map("view_count")
```

### 5.2 New / Modified API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/mobile/feed` | Existing — add `category` and `trending` query params |
| GET | `/mobile/search?q=` | New — search by place, city, videographer |
| GET | `/user/:id/profile` | New — public profile with video count + follower count |

### 5.3 Feed Response Shape

Each video in the feed must include:
```json
{
  "id": 1,
  "publicUrl": "https://...",
  "thumbnailUrl": "https://...",
  "place": "Chatuchak Market",
  "city": "Bangkok",
  "country": "Thailand",
  "category": "Street Scenes",
  "viewCount": 2300,
  "owner": {
    "id": 5,
    "username": "jasoncarter",
    "displayName": "Jason Carter",
    "avatarUrl": "https://..."
  }
}
```

---

## 6. Screen State Requirements

All screens must implement these four states:

| State | Viewer | Discovery | Profile |
|-------|--------|-----------|---------|
| Loading | Full-screen spinner | Skeleton grid | Skeleton rows |
| Empty | "No videos" + refresh | "No results" + clear filters | "No videos yet" |
| Error | "Something went wrong" + retry | "Couldn't load" + retry | "Couldn't load" + retry |
| Success | Video autoplays | Grid renders | Grid renders |

---

## 7. Out of Scope (Post-MVP)

- Trending tab implementation
- Nearby tab (GPS-based filtering)
- Videographers search tab
- Global attractions map
- Spotify integration
- Upload screen + AI processing pipeline
- Authentication (viewer can watch without login for MVP)
- Live streaming (covered in separate Glassnik platform spec)

---

## 8. Build Order

1. Backend schema migration (add VideoAsset fields)
2. Update `/mobile/feed` to support category + trending filters
3. Add `/mobile/search` endpoint
4. Add `/user/:id/profile` endpoint
5. Scaffold Expo app in `app/` folder
6. Auth screens (login + register)
7. Core viewer screen (VideoPlayer + VideoOverlay + gestures)
8. Category selector bottom sheet
9. Discovery modal + Explore tab
10. Videographer profile page
11. State handling (loading/empty/error) on all screens
