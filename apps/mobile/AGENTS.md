# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing any code.

## About this repository

This is a repository that contains the first version of a expo app developing a weather app. It's in work in progress.

## Rules

- This repository uses the good practices of Clean Code.
- This repository implements Hexagonal Architecture.

## Current Context & Architecture (Updated)

### 1. Hexagonal Architecture (Live Data)
- **Domain:** `WeatherEntity.ts` defines the clean data structure (outdoor, indoor, wind, barometer, rain, astronomy).
- **Infrastructure:** `WeatherApiAdapter.ts` fetches raw JSON from the Davis Weather station (`http://148.204.57.118/wflexp.json`). `WeatherApiMapper.ts` maps raw fields (like `sunrt`, `bartr`) into the `WeatherEntity`.
- **Application:** `GetLiveWeatherUseCase.ts` acts as the port bridge and is injected globally via `DependencyProvider.tsx`.
- **UI Polling:** The main layout (`index.tsx`) polls this use case and stores `WeatherEntity` in state.

### 2. UI & Presentation Layer
- **Component Stack:** `HeroWidget`, `HeaderControls`, `TelemetryStrip`, `TelemetryGrid`, `WindWidget`, `SolarTrajectory`.
- **Global Context:** `UnitContext.tsx` handles metric/imperial switching globally with pure math converters (`convertTemp`, `convertSpeed`).
- **Animations:** Heavy use of `react-native-reanimated` for sliding tabs, pulsing status dots, and expanding UI drawers.
- **Mathematical SVGs (`react-native-svg`):**
  - **Barometer:** Parses the 3-hour trend to draw an accurate Bezier sparkline.
  - **Solar Trajectory:** Computes `astronomy.sunrise`/`sunset` strings against device time to calculate the sun's exact SVG coordinates along a daytime arc.
  - **Wind Widget:** Uses Reanimated `withTiming` to smoothly rotate a compass needle to the exact heading on every data fetch.

### 3. Styling & Theming (Tailwind v4 / `uniwind`)
- **Theme Logic:** `uniwind` computes styles at build-time. Because CSS variables inside `@media (prefers-color-scheme)` didn't update dynamically across the app upon a manual state toggle, we **DO NOT** use CSS variables for colors.
- **The Solution:** Every widget explicitly defines its colors using Tailwind `dark:` variants (e.g., `bg-[#f1f5f9] dark:bg-[#1c1f2a]`). This forces React Native to dynamically invert the styles on every render.
- **Manual Toggle:** `HeaderControls.tsx` has a Sun/Moon toggle. It uses `Appearance.setColorScheme('dark'|'light')`. `uniwind` flawlessly tracks this native API to instantly flip the entire app layout. (Web manual toggle is bypassed to rely on browser OS settings).

### 4. Remaining / Future Work
- Database integration for persistent historical data.
- The "Historical & Forecast" screens (and widgets) have not been started yet.
