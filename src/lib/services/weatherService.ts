import { DEFAULT_CITY, WMO_WEATHER_CODES } from "../constants";
import { WeatherData, WeatherDailyForecast } from "../types";

// In-memory cache for weather results (key = lat_lon, ttl = 10 minutes)
interface CacheEntry {
  data: WeatherData;
  expiresAt: number;
}
const weatherCache = new Map<string, CacheEntry>();

export async function fetchWeatherData(
  lat: number = DEFAULT_CITY.lat,
  lon: number = DEFAULT_CITY.lon,
  cityName: string = DEFAULT_CITY.name
): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lon.toString());
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m"
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    );
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();

    const current = data.current;
    const daily = data.daily;

    if (!current) {
      throw new Error("Malformed weather response: current weather missing");
    }

    const weatherCode = current.weather_code ?? 0;
    const conditionText =
      WMO_WEATHER_CODES[weatherCode]?.text || "Clear / Fair";

    const dailyForecasts: WeatherDailyForecast[] = [];
    if (daily && Array.isArray(daily.time)) {
      for (let i = 0; i < daily.time.length; i++) {
        const code = daily.weather_code?.[i] ?? 0;
        dailyForecasts.push({
          date: daily.time[i],
          weatherCode: code,
          conditionText: WMO_WEATHER_CODES[code]?.text || "Fair",
          maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
          minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
          precipitationProbability:
            daily.precipitation_probability_max?.[i] ?? 0,
        });
      }
    }

    const weatherData: WeatherData = {
      city: cityName,
      latitude: lat,
      longitude: lon,
      timezone: data.timezone || "Asia/Kolkata",
      current: {
        temperature: Math.round(current.temperature_2m ?? 0),
        apparentTemperature: Math.round(current.apparent_temperature ?? 0),
        weatherCode,
        conditionText,
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        windDirection: current.wind_direction_10m ?? 0,
        relativeHumidity: current.relative_humidity_2m ?? 0,
        precipitation: current.precipitation ?? 0,
        isDay: Boolean(current.is_day),
        timestamp: current.time || new Date().toISOString(),
      },
      daily: dailyForecasts.slice(0, 7),
      source: "open-meteo",
      retrievedAt: new Date().toISOString(),
    };

    // Cache for 10 minutes
    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: now + 10 * 60 * 1000,
    });

    return weatherData;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If cache has expired item, return it as fallback rather than failing completely
    if (cached) {
      return cached.data;
    }

    throw new Error(
      error.name === "AbortError"
        ? "Weather service request timed out after 6 seconds"
        : `Unable to fetch live weather data: ${error.message}`
    );
  }
}
