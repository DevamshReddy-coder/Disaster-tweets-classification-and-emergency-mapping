# DisasterSense - Real-Time Disaster Intelligence UI

A mission-critical dashboard for classifying incoming tweets into disaster categories and visualizing them on an interactive map for emergency response teams. 

## Features

- **Live Tweet Stream Panel**: Real-time simulated scrolling feed of classified disaster tweets.
- **Interactive Emergency Map**: Leaflet integration visualizing tweets on an interactive Carto basemap. Displays high-severity density zones and color-coded disaster markers. 
- **Classification Insights Panel**: Data-dense analytics dashboard featuring Recharts (Donut and Line Charts) to display disaster distribution and severity trends.
- **Alerts System**: Smart toast notifications asynchronously popping up on critical, high-severity disaster detections.
- **Dark & Light Mode Support**: Toggles between high-contrast dark operations mode and bright daylight modes.

## Architecture & Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Contextual CSS Variables + Modules (`index.css`), with custom Dark/Light modes.
- **Mapping**: `leaflet` & `react-leaflet` with Carto light configurations.
- **Analytics Visualization**: `recharts` for responsive SVG pie/line charts.
- **Icons**: `lucide-react`.

## Running Locally

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the development server
   ```bash
   npm run dev
   ```
3. Open the prompted `localhost` URL in your browser to view the DisasterSense application.

## Advanced Behaviors

- The map allows toggling to "Focus on High Severity" (filtering only clusters strictly over severity 4).
- Stream panel supports a reactive pause / play switch to freeze live real-time signals. 
- Dynamic confidence bars integrated in every TweetCard visually align with their disaster classification type context colors.
