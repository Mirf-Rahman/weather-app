<div align="center">

# Weather App

Modern, fast, accessible weather dashboard built with **React 18 + TypeScript + Vite** using the **OpenWeather** APIs. Features a polished UI, dynamic gradients, day & hourly forecast explorer, theming, time‑zone awareness and smart local caching.

</div>

## Overview
Fast, type‑safe weather client with debounced search, geocoded suggestions, expandable hourly forecast, theme + unit preferences, and resilient caching.

**Typical use case:** Quickly compare local time and weather for multiple cities, drill into near‑term hourly trends, and switch units or themes seamlessly on desktop or mobile.

## Tech Stack
**Core:** React 18, TypeScript, Vite

**Data / HTTP:** Axios (typed wrappers), OpenWeather REST (current, forecast, geocode), date-fns for time formatting & timezone offset handling (manual offset math; no heavy tz lib)

**State & Logic:** Custom hook (`useWeather`) for orchestration (fetch, cache, refresh, refetch on preference changes)

**Styling:** Hand‑crafted CSS (glassmorphism, gradients, responsive layout) split across `AppLayout.css`, `styles/theme.css`, `styles/enhanced.css`

**Tooling / Quality:** ESLint + @typescript-eslint, Vitest + Testing Library (jsdom), strict TS config

**Build:** Vite 5 (ESM, fast HMR, environment variable prefix `VITE_`)
## ✨ Key Features (Implemented)

### 1. Search & Acquisition 🔍
- Debounced city search (400ms) with OpenWeather Direct Geocoding suggestions
- Recent search history & last city persistence (localStorage)
- One‑click geolocation (HTML5 `navigator.geolocation`)
- Smart label formatting: City, State (if any), Country

### 2. Current Conditions & Hourly Insight 🌤️
- Rich current card: temperature, feels like, humidity, pressure, wind, visibility, sunrise, sunset
- Dual time context: remote local time vs user device time (auto updates every 30s)
- Observation vs live clock timestamps surfaced for clarity
- Contextual status text (temperature band + condition + advisory wording)

### 3. Forecast Explorer 📆
- 5‑day / 3‑hour feed grouped by calendar day with per‑day min/max aggregation
- Expandable glass panel reveals upcoming hours (first 6 entries) with temp, feels like, humidity, wind
- Animated panel entry + gradient continuity below overlay
- Weather summary sentence generated per day (dominant condition + temp range)

### 4. Personalization & Preferences ⚙️
- Persisted unit system toggle (Metric °C / Imperial °F) with automatic refetch
- Persisted 12h / 24h time format toggle
- Persisted light / dark theme toggle (document `data-theme` attribute)

### 5. Interface & Visual System 🎨
- Glassmorphism layers (blur + translucency) with subtle radial lighting accents
- Continuous adaptive gradient behind expanding forecast (no harsh solid blocks)
- Masked scroll fade inside details panel (visual depth + readability)
- Responsive grid & typography scaling (clamp + auto-fit patterns)

### 6. Performance & Data Handling ⚡
- LocalStorage namespaced cache: `cache:<type>:<units>:<key>` (separates unit domains)
- Automatic refresh every 10 minutes (balanced with free tier limits)
- Manual refresh button with controlled spinner duration (UX feedback)
- Cache‑busting timestamp query param prevents stale CDN responses

### 7. Resilience & Error Experience 🛡️
- Graceful failure states with retry action component
- Skeleton / spinner feedback during network operations
- Defensive empty state when no city selected

### 8. Accessibility & Semantics ♿
- Forecast day cards: focusable, `role="button"`, `aria-pressed` for expanded state
- Alt text on condition icons, accessible labels on interactive toggles
- High‑contrast mindful color selections and large hit areas

### 9. Testing & Quality 🔍
- Vitest + Testing Library base setup (jsdom environment)
- Example API smoke test scaffold (skipped to avoid network by default)
- Strict TypeScript config enforcing safe patterns

### 10. Extensibility Hooks 🔌
- Central `useWeather` hook encapsulates fetch, cache, refresh, unit/time/theme side‑effects
- Clear separation of API layer (`api/weather.ts`) from presentation components
- Theming variables exposed via CSS custom properties and class hooks

### 11. Notable Implementation Details 🧩
- Manual timezone offset math (avoids heavier timezone libs)
- Progressive enhancement styling (works without JS animations; degrades gracefully)
- Icon requests served straight from OpenWeather static CDN (no bundling overhead)
## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (Vite 5 recommends modern Node; 20+ ideal)
- An OpenWeather API Key (free tier works). Create one at: https://openweathermap.org/api

### 2. Clone & Install
```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
npm install
```

### 3. Configure Environment
Create a `.env` file in the project root:
```bash
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```
Vite automatically exposes variables prefixed with `VITE_` via `import.meta.env`.

### 4. Run Dev Server
```bash
npm run dev
```
Open the printed local URL (typically http://localhost:5173).

### 5. Build Production Bundle
```bash
npm run build
npm run preview   # Serve the dist/ build locally
```

## 🔧 Scripts
- `npm run dev` – Start development server (fast HMR)
- `npm run build` – Production build (outputs to `dist/`)
- `npm run preview` – Serve built assets locally
- `npm run lint` – ESLint over `src/`
- `npm run test` – Run Vitest unit / component tests


## 🔌 Data Flow & Caching
`useWeather` orchestrates data fetches and state:
- Parallel current + forecast requests by city or coordinates
- LocalStorage cache per (type, units, key) namespace
- Last searched city & UI preferences (theme, time format) persisted
- Auto refresh timer (10 min) + manual refresh with spinner state
- Refetch on unit change (city or last coordinates)

## 🌐 APIs Used
| Purpose | Endpoint |
|---------|----------|
| Current Weather | `/data/2.5/weather` |
| 5-Day / 3-Hour Forecast | `/data/2.5/forecast` |
| Geocoding (Direct) | `/geo/1.0/direct` |

Parameters: `appid`, `q` or `lat/lon`, `units` (`metric` or `imperial`), and cache-busting `_t` timestamp. 

Rate Limits: Respect OpenWeather free tier limits; avoid aggressive polling (current implementation: manual + 10‑minute auto interval).

## 🎨 UI / UX Notes
- Dynamic gradient background (fixed palettes for dark vs light modes)
- Glassmorphism panels with layered radial highlights
- Forecast expansion overlays gradient (no flat blue blocks)
- Masked scroll fade inside detail panel for subtle depth
- Accessible buttons & semantic roles


## 🤝 Contributing
1. Fork & clone
2. Create branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add X"`
4. Push branch & open PR



---
Enjoy exploring the weather! Contributions & suggestions welcome.


