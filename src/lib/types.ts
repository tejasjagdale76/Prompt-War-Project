export type PlaceCategory =
  | "all"
  | "tourist"
  | "restaurant"
  | "historical"
  | "park"
  | "hotel";

export interface Place {
  id: string;
  name: string;
  category: "tourist" | "restaurant" | "historical" | "park" | "hotel";
  categoryLabel: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  source: "live" | "curated";
  rawType?: string;
}

export type ReportCategory =
  | "pothole"
  | "waterlogging"
  | "streetlight"
  | "obstruction"
  | "cleanliness"
  | "other";

export type ReportStatus = "Pending verification" | "Verified" | "Resolved";

export interface CommunityReportItem {
  id: string;
  category: ReportCategory;
  categoryLabel: string;
  title: string;
  description: string;
  locationAddress: string;
  latitude: number | null;
  longitude: number | null;
  observationTime: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  conditionText: string;
  windSpeed: number;
  windDirection: number;
  relativeHumidity: number;
  precipitation: number;
  isDay: boolean;
  timestamp: string;
}

export interface WeatherDailyForecast {
  date: string;
  weatherCode: number;
  conditionText: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
}

export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: WeatherCurrent;
  daily: WeatherDailyForecast[];
  source: "open-meteo";
  retrievedAt: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][]; // [latitude, longitude] tuples for Leaflet
  steps: RouteStep[];
  provider: "osrm" | "fallback-direct";
  summary: string;
}

export interface CityConfig {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  zoom: number;
  bbox?: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
}
