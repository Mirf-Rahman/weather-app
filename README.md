<div align="center">

# Aman Skies

Prayer‑aware daily outlook: real‑time conditions, 5‑day/3‑hour forecasts, charts, air quality, and alerts — built with **React 18 + TypeScript + Vite**.

<p><a href="https://weather-app-mir.vercel.app/" target="_blank"><strong>🌐 Live Demo (Vercel)</strong></a></p>

</div>

## Overview

Aman Skies is a fast, polished weather experience with prayer‑time awareness. It features geocoded search, a rich current view, 5‑day / 3‑hour forecasts, charts and analytics, air quality and UV, plus notifications and flexible preferences (theme, units, 12/24‑hour time).

## Features

- Real‑time current conditions (feels‑like, wind, humidity, sunrise/sunset)
- 5‑day / 3‑hour forecast with daily high/low aggregation
- Charts & analytics for trends across temp, wind, and more
- Prayer times with 15‑minute browser notifications and active highlights
- Prayer & weather insights for practical guidance
- Air Quality and UV Index panels
- Personalization: Dark/Light theme, 12/24h, metric/imperial
- Offline caching and settings export/import
- Clean glass UI with responsive layout and subtle animations

## Tech Stack

- React 18, TypeScript, Vite 5
- Axios, date‑fns
- Vitest + Testing Library (jsdom)
- Hand‑crafted CSS (glassmorphism) in `AppLayout.css`, `styles/theme.css`, `styles/enhanced.css`

## AI Backend (Phase 1)

The repo now includes a FastAPI backend scaffold for upcoming AI features (recommendations, predictions, anomaly detection).

Backend quick start:

1) Prereqs
- Python 3.11 (or use Docker)
- Optional: Postgres 15 and Redis 7 (Compose provided)

2) Run with Docker (recommended)

```bash
docker compose up --build
# Backend available at http://localhost:8000/api/health
```

3) Run locally without Docker

```bash
python -m venv .venv && . .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
cp .env.example .env   # set DATABASE_URL/REDIS_URL/OPENWEATHER_API_KEY if desired
uvicorn app.main:app --reload --port 8000
```

4) Frontend → Backend integration
- Frontend client lives in `src/api/ai.ts`
- Set `VITE_AI_BACKEND_URL` in `.env` if not using the default (`http://localhost:8000/api`)

5) Available endpoints (Phase 1)
- `GET /api/health` — service health
- `POST /api/auth/signup` — create user `{ email, password }`
- `POST /api/auth/login` — form login → `{ access_token }`
- `POST /api/weather/ingest` — store basic weather snapshot
- `GET /api/weather/latest?location_name=City` — fetch recent entries

Notes
- For Phase 1, DB tables are created on app start (replace with Alembic migrations in later phases).
- Celery/Redis are configured with a basic `ping` and weather collection task stub (to be expanded in later phases).

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

- `npm run dev` — Start development server (fast HMR)
- `npm run build` — Production build (outputs to `dist/`)
- `npm run preview` — Serve built assets locally
- `npm run lint` — ESLint over `src/`
- `npm run test` — Run Vitest unit / component tests

## Data Flow & Caching

`useWeather` orchestrates fetch, cache, refresh and reacts to unit/theme/time changes. Results are cached per (type, units, key) and refreshed every 10 minutes (or manually via refresh).

## APIs Used

| Purpose                 | Endpoint             |
| ----------------------- | -------------------- |
| Current Weather         | `/data/2.5/weather`  |
| 5‑Day / 3‑Hour Forecast | `/data/2.5/forecast` |
| Geocoding (Direct)      | `/geo/1.0/direct`    |

Parameters: `appid`, `q` or `lat/lon`, `units` (`metric` or `imperial`).

—

Built for clarity and speed. Enjoy Aman Skies ☀️
