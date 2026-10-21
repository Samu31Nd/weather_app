# AGENTS.md — apps/web

Web app of the monorepo (see the root `AGENTS.md` for rules, phases and data sources).

## Overview

Weather dashboard (Next.js 16 App Router, React 19, Tailwind 4) for a Davis WeatherLink station. It shows near-real-time conditions and historical charts. UI text is Spanish/English (`lib/language/translations.ts`); the README is in Spanish.

## Commands

Run from the repo root (npm workspaces):

```bash
npm run web                          # dev server on :3000
npm run build --workspace=web
npm run typecheck --workspace=web
```

`next build` now fails on type errors (`ignoreBuildErrors` was removed).

## Environment

Copy `.env.template` to `.env.local`:

- `NEXT_PUBLIC_API_URL` — base URL of the station (must end with `/`; code appends `wflexp.json` and `webdl.php?action=text`).
- `NEXT_PUBLIC_API_CLOUD_URL` — Cloud Function endpoint serving historical views.

## Architecture

Two data paths, both going through Next.js API routes under `app/api/weather/` that act as a proxy (avoids CORS) and as the entry point to a hexagonal-style layering in `lib/`:

- `lib/domain/` — entities and the `WeatherRepository` port.
- `lib/application/` — use cases (`GetWeatherUseCase`) plus unit-conversion/format helpers (values are stored imperial: °F, mph, inHg, in; conversion to metric happens at display time).
- `lib/infrastructure/` — adapters (axios), DTOs, and DTO→entity mappers.

**Real-time** (`/api/weather`): `weatherApiAdapter` fetches `wflexp.json` from the station → `weather.mapper` → `WeatherEntity`. Client side, `components/weather/weather-provider.tsx` polls it with SWR.

**Historical** (`/api/weather/historical`): query params `view` (`vw_clean_weather|vw_temperatura|vw_viento|vw_lluvia|vw_presion`) and `mode` (`specific_date|date_range|last_n_days`) plus `specific_date`, `date_start`, `date_end`, `days`. The route validates them, calls `cloudApiAdapter` (which translates to the Cloud API's `vista`/date params), and picks the mapper by view. Adding a view means touching `HistoricalView` in the domain entity, the DTO/mapper in `cloud-api.*`, and the `switch` in the route (`GetHistoricalWeatherUseCase` exists but the route does not use it). The large commented-out block in the route is the old CSV-scraping implementation, kept for reference.

**Client-side caching**: `components/weather/components/historical-charts.tsx` checks `lib/cache/cache.ts` (localStorage, 24h TTL, cleanup of entries >7 days) keyed by `generateHistoricalCacheKey` before calling the historical route. The CSV download button bypasses the route and hits the station's `webdl.php` directly from the browser; the JSON download exports the processed Cloud API data.

**UI state**: `components/app-provider.tsx` holds language, metric/imperial, theme, current view (`dashboard` | `charts` — a single-page app switching views in `app/page.tsx`, not separate routes), and sidebar state; it also builds the MUI theme. Historical charts use MUI X Charts; `components/ui/` is shadcn/Radix (generated, avoid hand-editing). `recharts` is also installed, with `components/ui/chart.tsx`.
