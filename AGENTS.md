# Ena-Spotter

Two-package repo: **Django 6.0 backend** (`backend/`) + **Vite + React 19 frontend** (`frontend/`).

## Structure

```
backend/
  api/              — main app (views.py: plan_trip endpoint)
    services/
      eld.py        — HOS rules engine (70hr/8day, 11/14 rules)
      routing.py    — Nominatim geocoding + OSRM routing
  config/           — Django project config (settings, urls)
  manage.py
  venv/             — Python venv (committed)
  db.sqlite3
frontend/
  src/
    App.jsx         — Main app: trip planner with map + ELD logs
    components/
      TopNav.jsx    — Dark sticky nav (64px, yellow brand)
      TripForm.jsx  — Input form (locations, cycle hours)
      MapView.jsx   — Leaflet map with route polyline + markers
      RouteInfo.jsx — Trip stats, waypoints, stops/rests
      EldLogSheet.jsx — Canvas-drawn daily log grid
      EldLogs.jsx   — Container for daily log sheets
      Footer.jsx    — Light footer
  index.css         — Design system tokens (colors, spacing, fonts)
  App.css           — All component styles
  DESIGN.md         — Binance-inspired design system spec (NOT code)
  vite.config.js    — Vite 8 + @vitejs/plugin-react
  eslint.config.js  — Flat config (JSX, react-hooks, react-refresh)
```

## Commands

```bash
# Frontend (from frontend/)
npm run dev       # Vite dev server (port 5173, HMR)
npm run build     # Production build into dist/
npm run lint      # ESLint
npm run preview   # Preview production build

# Backend (from backend/, venv active)
& venv/Scripts/python manage.py runserver  # Dev server (port 8000)
& venv/Scripts/python manage.py test       # Run tests
& venv/Scripts/python manage.py check      # System check
```

## Architecture

- **Frontend**: Vite 8 + React 19 (JSX, no TypeScript). Plain CSS with CSS custom properties for design tokens. Entry: `src/main.jsx` → `App.jsx`.
- **Backend**: Django 6.0 with SQLite. Single API endpoint `POST /api/plan-trip/`.
- **Design system**: Binance-inspired colors, typography (BinanceNova/binancePlex fallback stack), spacing (4px base), and component styles defined in `index.css` and `App.css`. `DESIGN.md` is the spec reference.

## API

`POST /api/plan-trip/`
- Body: `{ current_location, pickup_location, dropoff_location, cycle_used_hours }`
- Returns: `{ route, waypoints, stops, daily_logs }`
- Backend geocodes via Nominatim (rate-limited, 1s between calls), routes via OSRM.

## ELD Rules

- Property-carrying driver, 70hr/8day cycle, no adverse conditions
- Max 11hr drive / 14hr on-duty per day, 10hr off-duty rest
- 30-min break after 8hr continuous driving
- Fueling every 1000 miles (30 min ON), 1hr pickup/dropoff
- Average speed 55 MPH for planning

## Key gotchas

- `api` app IS now in `INSTALLED_APPS` — added there.
- Custom CORS middleware at `api/cors.py` — allows all origins (dev convenience). Handles OPTIONS preflight before view dispatch (important: `@require_POST` would otherwise return 405 on OPTIONS).
- Backend venv at `backend/venv/` — activate before running Django commands. `requests` has been installed.
- Nominatim rate limit: add `time.sleep(1.1)` between geocode calls in `views.py`.
- Vite 8 ships with Rolldown (Rust bundler). The `lightningcss` native binary (`lightningcss.win32-x64-msvc.node`) may be blocked by Windows AppLocker/Application Control — in that case `vite.config.js` has `build.minify: false` as a workaround. Dev server always works.
- Frontend is plain JSX (no TypeScript). ESLint uses flat config.
- No tests exist yet. No models defined — ELD logic is in Python services, not persisted.

## Design system reference

All design tokens in `index.css` as `--color-*`, `--space-*`, `--radius-*`, `--font-*` variables. Use these exclusively — no inline styles, no ad-hoc values. Component patterns defined in `DESIGN.md` (dark canvas, yellow CTAs, hairline borders, card surfaces).
