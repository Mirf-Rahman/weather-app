<div align="center">

# Aman Skies

Prayer�?`aware daily outlook: real�?`time conditions, 5�?`day/3�?`hour forecasts, charts, air quality, and alerts �?" built with **React 18 + TypeScript + Vite**.

<p><a href="https://weather-app-mir.vercel.app/" target="_blank"><strong>dYO? Live Demo (Vercel)</strong></a></p>

</div>

## Overview

Aman Skies is a fast, polished weather experience with prayer�?`time awareness. It features geocoded search, a rich current view, 5�?`day / 3�?`hour forecasts, charts and analytics, air quality and UV, plus notifications and flexible preferences (theme, units, 12/24�?`hour time).

## Features

- Real�?`time current conditions (feels�?`like, wind, humidity, sunrise/sunset)
- 5�?`day / 3�?`hour forecast with daily high/low aggregation
- Charts & analytics for trends across temp, wind, and more
- Prayer times with 15�?`minute browser notifications and active highlights
- Prayer & weather insights for practical guidance
- Air Quality and UV Index panels
- Personalization: Dark/Light theme, 12/24h, metric/imperial
- Offline caching and settings export/import
- Clean glass UI with responsive layout and subtle animations

## Tech Stack

- React 18, TypeScript, Vite 5
- Axios, date�?`fns
- Vitest + Testing Library (jsdom)
- Hand�?`crafted CSS (glassmorphism) in `AppLayout.css`, `styles/theme.css`, `styles/enhanced.css`

## Quick Start

### 1) Prerequisites

- Node.js 18+
- OpenWeather API Key: https://openweathermap.org/api

### 2) Install

```bash
git clone https://github.com/Mirf-Rahman/weather-app.git
cd weather-app
npm install
```

### 3) Configure

Create a `.env` in the project root:

```bash
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

### 4) Run

```bash
npm run dev
```

Open the printed local URL (typically http://localhost:5173).

### 5) Build

```bash
npm run build
npm run preview   # serve dist/ locally
```

## Scripts

- `npm run dev` �?" Start development server (fast HMR)
- `npm run build` �?" Production build (outputs to `dist/`)
- `npm run preview` �?" Serve built assets locally
- `npm run lint` �?" ESLint over `src/`
- `npm run test` �?" Run Vitest unit / component tests

## Data Flow & Caching

`useWeather` orchestrates fetch, cache, refresh and reacts to unit/theme/time changes. Results are cached per (type, units, key) and refreshed every 10 minutes (or manually via refresh).

## APIs Used

| Purpose                 | Endpoint             |
| ----------------------- | -------------------- |
| Current Weather         | `/data/2.5/weather`  |
| 5�?`Day / 3�?`Hour Forecast | `/data/2.5/forecast` |
| Geocoding (Direct)      | `/geo/1.0/direct`    |

Parameters: `appid`, `q` or `lat/lon`, `units` (`metric` or `imperial`).

�?"

Built for clarity and speed. Enjoy Aman Skies �~?�,?

