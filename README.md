<div align="center">

# Weather App

Modern, fast, accessible weather dashboard built with **React 18 + TypeScript + Vite** using the **OpenWeather** APIs. Features a polished glass UI, dynamic gradients, day & hourly forecast explorer, theming, time‑zone awareness and smart local caching.

</div>

## ✨ Key Features (Implemented)

- 🔍 Debounced city search with geocoding suggestions (OpenWeather Direct Geocoding API) & recent history (localStorage)
- 📍 "Use My Location" geolocation lookup (navigator.geolocation)
- 🌡️ Current conditions card with: temp, feels like, humidity, pressure, wind, visibility, sunrise/sunset, live local time vs user time, observation timestamp
- 📆 5‑Day / 3‑Hour forecast grouped per day with min/max & expandable glass panel showing first 18 hours (6 entries) with key metrics
- 🌓 Light / Dark theme toggle (persisted) + weather condition theme class hooks
- 🕒 12h / 24h time format toggle (persisted)
- ♻️ Manual refresh button + automatic refresh every 10 minutes
- 📦 Local caching of last successful fetch per city/coordinates (localStorage) + last city persistence
- 🚫 Graceful error messaging with retry & loading skeleton / spinner
- 🪟 Gradient background continues beneath expanding forecast panel (glass overlay) for immersive feel
- ♿ Keyboard & accessibility considerations (role/button, aria labels, focusable forecast cards)
- 🔁 Unit toggle (Metric °C / Imperial °F) with immediate refetch & UI update
- 🧭 Time‑zone aware remote vs local time display with periodic clock updates
- 🔐 Cache‑busting timestamp param added to API calls to avoid stale intermediary caches
- 🧪 Vitest + Testing Library setup (sample smoke test included)

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


