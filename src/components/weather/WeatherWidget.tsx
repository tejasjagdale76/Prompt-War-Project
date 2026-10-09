"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  AlertTriangle,
  Clock,
  Compass,
} from "lucide-react";
import { CityConfig, WeatherData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface WeatherWidgetProps {
  currentCity: CityConfig;
}

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2) return CloudSun;
  if (code === 3 || code === 45 || code === 48) return Cloud;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;
  return Sun;
}

export function WeatherWidget({ currentCity }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/weather?lat=${currentCity.lat}&lon=${currentCity.lon}&city=${encodeURIComponent(
          currentCity.name
        )}`
      );

      if (!res.ok) {
        throw new Error(`Weather API error (status ${res.status})`);
      }

      const data = await res.json();
      if (data.success && data.weather) {
        setWeather(data.weather);
      } else {
        throw new Error(data.error || "Failed to parse weather information");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load live weather conditions");
    } finally {
      setIsLoading(false);
    }
  }, [currentCity.name, currentCity.lat, currentCity.lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const CurrentIcon = weather
    ? getWeatherIcon(weather.current.weatherCode)
    : Sun;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {currentCity.name} Live Weather
          </h2>
          <p className="text-xs text-slate-500">
            Real-time meteorological readings powered by Open-Meteo
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {weather && (
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Retrieved {formatRelativeTime(weather.retrievedAt)}</span>
            </span>
          )}

          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Weather service unavailable: </span>
            {error}
            <div className="mt-2">
              <button
                onClick={fetchWeather}
                className="px-3 py-1 bg-rose-600 text-white rounded font-semibold text-xs hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded"></div>
            <div className="h-16 w-32 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Weather Hero Card */}
      {!isLoading && weather && (
        <>
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm mb-3">
                    Current Conditions
                  </span>
                  <div className="flex items-center space-x-4">
                    <CurrentIcon className="w-16 h-16 text-amber-300 drop-shadow" />
                    <div>
                      <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                        {weather.current.temperature}°C
                      </div>
                      <p className="text-lg font-medium text-sky-100 mt-0.5">
                        {weather.current.conditionText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20">
                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>Feels like</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.apparentTemperature}°C
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <Wind className="w-3.5 h-3.5" />
                      <span>Wind</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.windSpeed} km/h
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Humidity</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.relativeHumidity}%
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Wind Dir.</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.windDirection}°
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <CloudRain className="w-3.5 h-3.5" />
                      <span>Precipitation</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.precipitation} mm
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-sky-200 flex items-center space-x-1">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Daylight</span>
                    </span>
                    <p className="text-base font-bold">
                      {weather.current.isDay ? "Daytime" : "Night"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              7-Day Weather Forecast
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {weather.daily.map((day, idx) => {
                const DayIcon = getWeatherIcon(day.weatherCode);
                const dayDate = new Date(day.date);
                const dayName =
                  idx === 0
                    ? "Today"
                    : dayDate.toLocaleDateString("en-US", { weekday: "short" });
                const dateLabel = dayDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all ${
                      idx === 0
                        ? "bg-sky-50 border-sky-200 shadow-sm"
                        : "bg-slate-50 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {dayName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {dateLabel}
                      </span>
                    </div>

                    <div className="my-2.5">
                      <DayIcon
                        className={`w-7 h-7 mx-auto ${
                          idx === 0 ? "text-sky-600" : "text-slate-600"
                        }`}
                      />
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-1 block">
                        {day.conditionText}
                      </span>
                    </div>

                    <div className="w-full pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-800">
                        <span>{day.maxTemp}°</span>
                        <span className="text-slate-400 font-normal">/</span>
                        <span className="text-slate-500 font-normal">
                          {day.minTemp}°
                        </span>
                      </div>
                      {day.precipitationProbability > 0 && (
                        <span className="text-[10px] font-medium text-sky-600 mt-0.5 block">
                          💧 {day.precipitationProbability}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
