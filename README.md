# University Weather Station App

A cross-platform mobile application built with **React Native** and **Expo** designed to fetch, process, and beautifully display live telemetry data from our university's local weather station.

## About the Project

This application serves as the frontend client for a university project focused on data gathering and atmospheric monitoring. It connects directly to the campus Davis Weather Station to retrieve raw live JSON payloads, decodes the proprietary metrics, and displays them via a rich, glassmorphic UI.

The system is built using strict **Hexagonal Architecture** principles to cleanly separate the domain logic (Weather Entities), the infrastructure (Weather APIs and JSON mapping), and the presentation layer (React Native UI).

### Features
* **Live Telemetry Engine:** Connects and polls the local weather station to receive real-time data packets.
* **Smart Conversions:** Global context provider allowing seamless toggling between Metric and US/Imperial units with live conversions.
* **Mathematical SVGs:** Uses pure mathematics to draw live Bezier curves for the barometer trends and exact solar trajectories based on sunrise/sunset data.
* **Native Dynamic Theming:** Fully supports device-level Light and Dark mode using Native Tailwind variables (`uniwind`) and dynamic glassmorphism.

## Future Roadmap (TODOs)

While the live telemetry engine is fully operational, the following features are actively pending implementation:
* **[ ] Historical Data Integration:** Connecting to a time-series database to track and graph weather data over the past days, weeks, and months.
* **[ ] Forecasting Engine:** Implementing predictive weather models or integrating a forecasting API to predict upcoming university campus weather.
* **[ ] Push Notifications:** Alerts for severe weather anomalies (high winds, extreme UV, flash floods).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo server:**
   ```bash
   npx expo start
   ```

3. Connect to the local university network (required to fetch the live station IP data directly without CORS blockers).

## Technologies Used
* **React Native (Expo SDK 57)**
* **NativeWind (v4 / uniwind)** for Tailwind CSS styling
* **React Native Reanimated** for 60fps telemetry animations
* **React Native SVG** for dynamic charts and arcs
* **Lucide Icons**
