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

## 🗂️ Project Structure
```
src/
	api/                OpenWeather API wrappers (current, forecast, geocode)
	components/         Reusable UI components (cards, forecast grid, inputs)
	hooks/              Custom React hooks (useWeather state/data manager)
	styles/             Global + theme + enhancement CSS
	App.tsx             Root UI composition + theming + routing-like home state
	AppLayout.css       Primary layout & glass / gradient styling
	main.tsx            Entry mounting React root
	__tests__/          Vitest tests
```

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

## ♿ Accessibility & Semantics
- Buttons use `aria-pressed` where appropriate
- Forecast items focusable with keyboard (tab navigation)
- Labels and alt text for icons / images

## 🔍 Testing
<div align="center">

# Weather App

Fast, type‑safe, accessible weather forecasting dashboard. One‑liner: A React + TypeScript client that fetches real‑time & forecast weather data (OpenWeather) with geocoding, theming, caching, and time‑zone aware presentation.

</div>

## 1. Overview
This project delivers a polished consumer weather experience: instant search with suggestions, current conditions, expandable multi‑day forecast, live local vs remote time comparison, theming, and resilient caching. Built to be easily extensible (e.g. One Call API, alerts, PWA, favorites).

## 2. One‑Liner (Pitch)
Modern weather UI that merges geocoded search, live conditions, and an expandable hourly forecast into a performant, themed, fully client‑side experience.

## 3. Real Use Case
Someone planning travel can search multiple cities, compare local vs destination time instantly, view short‑term temperature ranges and hourly conditions, then quickly toggle units and themes for clarity—without re‑entering data thanks to persisted preferences and caching.

## 4. Tech Stack
### Frontend
- React 18 + TypeScript – Component architecture & type safety
- Vite – Fast dev server & optimized build
- Axios – HTTP requests with interceptable config
- date-fns – Time formatting & manipulation
- Vitest + Testing Library – Unit/component testing suite
- ESLint + TypeScript ESLint – Linting & static analysis

### Styling / UI
- Custom CSS (glassmorphism, gradients, responsive layout)
- CSS variables for dynamic gradient themes
- Accessible semantic HTML patterns (no heavy UI frameworks)

### Platform / Tooling
- Node.js 18+
- LocalStorage for lightweight persistence
- Browser Geolocation API for current position

## 5. Core Features (Categorized)
### Data & Forecasting
- Current weather (temp, feels like, humidity, pressure, wind, visibility, sunrise, sunset)
- 5‑Day / 3‑Hour forecast grouped per day (min/max + hourly subset)
- Hourly panel with key metrics (temp, feels-like, humidity, wind)
- Cache‑busting query param to avoid stale responses

### Interaction & UX
- Debounced city search with geocode suggestions
- Recent searches persistence
- Geolocation based lookup
- Unit toggle (Metric / Imperial)
- 12h / 24h time format toggle
- Manual refresh + auto refresh (10 min interval)

### Presentation
- Light/Dark theme toggle (persisted)
- Weather condition mapped theme class hook
- Gradient background extends beneath expanding forecast (glass overlay)
- Glass panels, masked scroll fade, subtle motion

### State & Caching
- LocalStorage caching keyed by (type, units, identifier)
- Persisted last city, theme, time format
- Refetch on unit change or manual refresh

### Resilience & Quality
- Error message component with retry
- Loading spinner & skeleton placeholders (CSS shimmer)
- Strict TypeScript configuration
- Basic test harness ready for expansion

### Accessibility
- Keyboard focusable forecast cards
- `aria-pressed` and descriptive alt text
- Semantic clickable areas (role=button where needed)

## 6. Architecture Overview
- `App.tsx` controls global UI state (theme, time format, units, home vs dashboard) and composes feature components.
- `useWeather` hook encapsulates fetching logic, persistence, and refresh strategy.
- `api/weather.ts` provides type‑safe API wrappers (current, forecast, geocode) with shared cache‑busting param.
- Components are pure/presentational where possible (SearchBar, ForecastGrid, CurrentWeatherCard, etc.).
- Styling centralized in `AppLayout.css` plus layered enhancement/theme sheets.

## 7. Data Flow
1. User searches or uses geolocation.
2. `useWeather` fires parallel current + forecast requests.
3. Responses stored in state and localStorage (namespaced by units).
4. UI renders; user toggles units/time/theme triggering controlled effects.
5. Auto refresh interval triggers silent re-fetch.

## 8. Project Structure
```
src/
	api/            OpenWeather API clients
	components/     UI building blocks
	hooks/          Custom hooks (useWeather)
	styles/         Global + theme CSS
	__tests__/      Vitest tests
	App.tsx         Root composition
	main.tsx        Entry point
	AppLayout.css   Layout & core visual system
```

## 9. Environment Variables
| Name | Required | Description |
|------|----------|-------------|
| VITE_OPENWEATHER_API_KEY | Yes | OpenWeather API key (exposed to client) |

Create `.env`:
```
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

## 10. API Integration
Endpoints used:
- `/data/2.5/weather`
- `/data/2.5/forecast`
- `/geo/1.0/direct`

Common params: `appid`, `units`, (`q` OR `lat` + `lon`), `_t` (cache-bust).

## 11. Quick Start
Prerequisites: Node 18+, OpenWeather key.
```
git clone https://github.com/your-username/weather-app.git
cd weather-app
npm install
echo VITE_OPENWEATHER_API_KEY=your_key_here > .env
npm run dev
```
Build & preview:
```
npm run build
npm run preview
```

## 12. Scripts
- `dev` – Dev server with HMR
- `build` – Production build to `dist/`
- `preview` – Local static preview
- `lint` – ESLint over sources
- `test` – Vitest test suite

## 13. Testing
Run all tests:
```
npm run test
```
Add new tests under `src/__tests__` using Vitest + @testing-library/react.

## 14. Performance Considerations
- Minimal dependencies (no large UI framework)
- Parallel fetches reduce TTFB for complete dashboard
- Debounced geocode API reduces unnecessary network
- Cache layering (state + localStorage) shortens warm loads
- CSS driven animations (GPU friendly transforms)

## 15. Accessibility Notes
- Logical heading hierarchy
- Focusable cards & buttons, visible action areas
- Reduced dependence on color alone for state (e.g., active toggles also change elevation/shape)

## 16. Future Enhancements (Roadmap)
- One Call API integration (alerts, minutely)
- Favorites & multi-city comparison view
- Progressive Web App (offline + install)
- Full hourly timeline & charts (temp, wind, precip probability)
- Localization / i18n (date-fns locale + copy extraction)
- ARIA live region for refresh status
- Service worker caching strategy (stale‑while‑revalidate)

## 17. Deployment
Static build (no backend required). Suitable for Vercel, Netlify, GitHub Pages:
```
npm run build
```
Deploy `dist/` and ensure env var is set at build time.

## 18. Contributing
1. Fork and clone
2. Create a branch: `git checkout -b feature/slug`
3. Commit: `git commit -m "feat: add X"`
4. Push & open PR

Style: keep PRs focused; follow conventional commit prefixes.

## 19. License
Add a LICENSE file (e.g., MIT) if you plan public distribution.

## 20. FAQ
**Why only these endpoints?** Simplicity and wide availability of standard key; One Call can be layered later.

**Why client-only?** Enables frictionless static deployment; sensitive data not required.

**How are times calculated?** Remote time derived from API timezone offset vs local system offset (see `CurrentWeatherCard`).

---
Enjoy the project. Feedback and improvements are welcome.


