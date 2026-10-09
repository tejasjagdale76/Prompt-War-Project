"use client";

import React, { useState } from "react";
import {
  Navigation,
  MapPin,
  LocateFixed,
  ArrowUpDown,
  Clock,
  Milestone,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RouteResult, CityConfig } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";

interface RoutePoint {
  lat: number;
  lon: number;
  label?: string;
}

interface RoutePanelProps {
  currentCity: CityConfig;
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  route: RouteResult | null;
  isLoading: boolean;
  error: string | null;
  onSetOrigin: (point: RoutePoint | null) => void;
  onSetDestination: (point: RoutePoint | null) => void;
  onCalculateRoute: () => void;
  onClearRoute: () => void;
}

export function RoutePanel({
  currentCity,
  origin,
  destination,
  route,
  isLoading,
  error,
  onSetOrigin,
  onSetDestination,
  onCalculateRoute,
  onClearRoute,
}: RoutePanelProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  // Request browser geolocation with explicit permission
  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSetOrigin({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Your Current Location",
        });
      },
      (err) => {
        let msg = "Location access denied. Please select an origin on the map.";
        if (err.code === 2) msg = "Location position unavailable.";
        if (err.code === 3) msg = "Location request timed out.";
        setGeoError(msg);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSwap = () => {
    const temp = origin;
    onSetOrigin(destination);
    onSetDestination(temp);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Route Navigator
          </h3>
        </div>
        {(origin || destination || route) && (
          <button
            onClick={onClearRoute}
            className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-3 relative">
        {/* Origin */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Origin (Point A)</span>
            </span>
            <button
              onClick={handleUseCurrentLocation}
              className="text-sky-600 hover:text-sky-700 normal-case font-semibold text-xs flex items-center space-x-1"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Use Current Location</span>
            </button>
          </label>

          <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 truncate">
              {origin ? (
                <span className="font-semibold text-slate-800">
                  {origin.label || `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}`}
                </span>
              ) : (
                <span className="text-slate-400">
                  Click a place popup or tap &quot;Use Current Location&quot;
                </span>
              )}
            </div>
            {origin && (
              <button
                onClick={() => onSetOrigin(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            disabled={!origin && !destination}
            aria-label="Swap Origin and Destination"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full border border-slate-200 shadow-sm transition-all disabled:opacity-40"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Destination (Point B)</span>
          </label>

          <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="flex-1 truncate">
              {destination ? (
                <span className="font-semibold text-slate-800">
                  {destination.label ||
                    `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}`}
                </span>
              ) : (
                <span className="text-slate-400">
                  Select a place from Explore or marker on map
                </span>
              )}
            </div>
            {destination && (
              <button
                onClick={() => onSetDestination(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Geolocation feedback */}
      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Quick Origins for Current City */}
      {!origin && (
        <div className="pt-1">
          <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
            Quick origins in {currentCity.name}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              {
                Pune: [
                  { label: "Pune Railway Station", lat: 18.5289, lon: 73.8744 },
                  { label: "Shivajinagar Bus Stand", lat: 18.5315, lon: 73.8502 },
                  { label: "Swargate Chowk", lat: 18.5014, lon: 73.8582 },
                ],
                Mumbai: [
                  { label: "CSMT Terminus", lat: 18.9401, lon: 72.8353 },
                  { label: "Bandra Kurla Complex", lat: 19.0664, lon: 72.8687 },
                  { label: "Dadar Circle", lat: 19.0178, lon: 72.8478 },
                ],
                Bengaluru: [
                  { label: "Majestic Station", lat: 12.9778, lon: 77.5713 },
                  { label: "MG Road Metro", lat: 12.9754, lon: 77.6066 },
                  { label: "Indiranagar 100ft Rd", lat: 12.9719, lon: 77.6412 },
                ],
              }[currentCity.name] || [
                { label: `${currentCity.name} Center`, lat: currentCity.lat, lon: currentCity.lon },
              ]
            ).map((preset) => (
              <button
                key={preset.label}
                onClick={() => onSetOrigin(preset)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calculate Route Button */}
      <button
        onClick={onCalculateRoute}
        disabled={isLoading || !origin || !destination}
        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Navigation className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        <span>{isLoading ? "Calculating Route..." : "Calculate Route"}</span>
      </button>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Route calculation error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Route Results */}
      {route && (
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl">
              <span className="text-[11px] text-sky-700 flex items-center space-x-1 font-medium">
                <Milestone className="w-3.5 h-3.5" />
                <span>Distance</span>
              </span>
              <p className="text-lg font-bold text-sky-950 mt-0.5">
                {formatDistance(route.distanceKm)}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <span className="text-[11px] text-emerald-700 flex items-center space-x-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. Duration</span>
              </span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">
                {formatDuration(route.durationMinutes)}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">Provider: </span>
            {route.provider === "osrm" ? (
              <span className="text-emerald-700 font-medium">
                OSRM Driving Service (Real Route Geometry)
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                Direct Path Estimation (Public OSRM Offline)
              </span>
            )}
            <p className="mt-1 text-slate-600">{route.summary}</p>
          </div>

          {/* Turn-by-Turn Steps Toggle */}
          {route.steps && route.steps.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-sky-600 py-1"
              >
                <span>Turn-by-turn directions ({route.steps.length} steps)</span>
                {showSteps ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showSteps && (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border-t border-slate-100 pt-2 text-xs">
                  {route.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 text-slate-600 py-1 border-b border-slate-50 last:border-none"
                    >
                      <span className="font-bold text-slate-400 shrink-0 w-4 text-[10px]">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-800 capitalize font-medium">
                          {step.instruction}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {formatDistance(step.distanceMeters / 1000)} (
                          {Math.round(step.durationSeconds / 60)} min)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
