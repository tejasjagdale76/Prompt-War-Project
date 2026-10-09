# CityScope — Smart City Explorer

CityScope transforms scattered urban information into an actionable, cohesive web platform for discovering places, navigating routes, understanding live weather conditions, and submitting civic community reports.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Leaflet**, **Open-Meteo**, **OSRM**, and **SQLite (via Prisma)**.

---

## 🌟 Core Modules

1. **Module 1: Explore Places**
   - Search places by name with debounced inputs.
   - Filter by categories: *Tourist attractions*, *Historical landmarks*, *Restaurants & cafes*, *Parks & public spaces*, and *Hotels*.
   - Live OpenStreetMap geocoding with graceful fallback to a verified Pune curated dataset when external APIs are rate-limited or unreachable.
   - Distances calculated using Haversine geodesics relative to city center.
   - Quick "Locate on Map" and "Navigate / Directions" actions.

2. **Module 2: Interactive Map & Routing**
   - Interactive Leaflet map centered on Pune, Maharashtra (with multi-city support).
   - Dynamic marker synchronization for places and civic hazard reports.
   - Route finder powered by public **Project-OSRM** returning real street-level route polylines, provider-computed distance (km), estimated duration, and turn-by-turn driving steps.
   - Browser geolocation support with explicit user permissions and fallback handling.
   - Direct distance/route fallback calculation if public OSRM is offline.
   - Interactive coordinate picker by clicking anywhere on the city map.

3. **Module 3: Weather Dashboard**
   - Real-time meteorological readings powered by **Open-Meteo API**.
   - Current temperature, apparent temperature ("feels like"), humidity, precipitation, wind speed & direction, and daylight indicator.
   - 7-day weather forecast with WMO weather condition code interpretations and precipitation probabilities.
   - In-memory caching (10-minute TTL) to respect provider rate limits.

4. **Module 4: Community Civic Reports**
   - Citizen reporting for road hazards: *Potholes*, *Waterlogging / Flooding*, *Broken Streetlights*, *Road Obstructions*, *Cleanliness / Garbage*, and *Other Civic Issues*.
   - Input validation enforced on both client and server via **Zod**.
   - Persistent storage backed by **SQLite** through **Prisma ORM**.
   - Submissions start strictly with `Pending verification` status.
   - Built-in duplicate detection (flags submissions in close proximity within 2 hours).
   - Filter by status (*Pending verification*, *Verified*, *Resolved*) and category.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS |
| **Maps** | Leaflet & OpenStreetMap Tiles |
| **Routing** | Project-OSRM Public Routing API |
| **Weather** | Open-Meteo API |
| **Database** | SQLite with Prisma ORM |
| **Validation** | Zod |
| **Testing** | Vitest |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node.js `v24.x`)
- npm `v9.0.0` or higher

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_DEFAULT_CITY="Pune"
NEXT_PUBLIC_DEFAULT_LAT="18.5204"
NEXT_PUBLIC_DEFAULT_LON="73.8567"
```

### 3. Database Initialization & Seeding
Push the Prisma schema to generate the local SQLite database and populate initial demonstration reports:
```bash
# Push schema to SQLite
npx prisma db push

# Seed initial Pune community reports
node prisma/seed.js
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Test Suite
CityScope includes comprehensive unit and integration tests covering data normalization, Zod validation, OSRM routing resilience, and SQLite persistence:
```bash
npm run test
```

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 📐 Architecture & Project Structure

```
├── prisma/
│   ├── schema.prisma       # SQLite data model for CommunityReport
│   └── seed.js             # Seed script for Pune civic reports
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── places/     # GET /api/places (OSM search & curated fallback)
│   │   │   ├── reports/    # GET & POST /api/reports (Zod + SQLite persistence)
│   │   │   ├── routing/    # GET /api/routing (OSRM route calculations)
│   │   │   └── weather/    # GET /api/weather (Open-Meteo live readings)
│   │   ├── layout.tsx      # Root application layout
│   │   ├── page.tsx        # Unified CityScope dashboard
│   │   └── globals.css     # Tailwind styling & Leaflet map configurations
│   ├── components/
│   │   ├── Header.tsx      # App brand & city switcher
│   │   ├── Navigation.tsx  # 4-module navigation tab bar
│   │   ├── places/         # PlaceCard, PlaceList, PlaceDetailModal
│   │   ├── map/            # CityMap, LeafletMapInner, RoutePanel
│   │   ├── weather/        # WeatherWidget (current + 7-day forecast)
│   │   └── reports/        # ReportForm, ReportList
│   └── lib/
│       ├── constants.ts    # Cities, Pune curated landmarks, WMO codes
│       ├── db.ts           # Prisma client singleton
│       ├── types.ts        # TypeScript data contracts
│       ├── utils.ts        # Haversine distance, time and number formatters
│       ├── validation.ts   # Zod validation schemas
│       └── services/       # Place, Weather, Routing, and Report services
└── tests/
    ├── normalization_and_formatting.test.ts
    ├── validation.test.ts
    ├── services.test.ts
    └── persistence.test.ts
```

---

## 🔒 Known Limitations & Scope Boundaries

1. **Public APIs**: Places and routing rely on OpenStreetMap Photon and Project-OSRM public demo servers. If third-party servers rate limit or become unreachable, CityScope automatically activates its resilient local fallback with clear UI indicators.
2. **Moderation**: Guest submissions automatically receive `Pending verification`. Administrative status elevation is intentionally reserved for authenticated municipal portals in future releases.
3. **Storage**: Utilizes SQLite for zero-configuration, lightweight local deployment suitable for computer engineering evaluation without external cloud dependencies.
