"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  AlertCircle,
  RefreshCw,
  Compass,
  Info,
  MapPin,
} from "lucide-react";
import { PLACE_CATEGORIES } from "@/lib/constants";
import { Place, PlaceCategory, CityConfig } from "@/lib/types";
import { PlaceCard } from "./PlaceCard";
import { PlaceDetailModal } from "./PlaceDetailModal";

interface PlaceListProps {
  currentCity: CityConfig;
  onSelectOnMap: (place: Place) => void;
  onGetDirections: (place: Place) => void;
  onPlacesLoaded?: (places: Place[]) => void;
}

export function PlaceList({
  currentCity,
  onSelectOnMap,
  onGetDirections,
  onPlacesLoaded,
}: PlaceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategory>("all");
  const [places, setPlaces] = useState<Place[]>([]);
  const [sortBy, setSortBy] = useState<"distance" | "name">("distance");
  const [source, setSource] = useState<"live" | "curated">("live");
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlace, setActivePlace] = useState<Place | null>(null);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPlaces = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        city: currentCity.name,
        lat: currentCity.lat.toString(),
        lon: currentCity.lon.toString(),
        category: selectedCategory,
      });

      if (debouncedSearch.trim()) {
        params.set("query", debouncedSearch.trim());
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load places (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setPlaces(data.places);
        setSource(data.source);
        setWarning(data.warning || null);
        if (onPlacesLoaded) {
          onPlacesLoaded(data.places);
        }
      } else {
        throw new Error(data.error || "Malformed response from places API");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load places");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentCity.name,
    currentCity.lat,
    currentCity.lon,
    selectedCategory,
    debouncedSearch,
    onPlacesLoaded,
  ]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search places in ${currentCity.name} (e.g. Shaniwar Wada, cafe, garden)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => fetchPlaces()}
            disabled={isLoading}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {PLACE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as PlaceCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Status & Warning Banner */}
      {warning && (
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Demonstration Mode: </span>
            {warning}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-red-800">
            Unable to load places
          </h4>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={() => fetchPlaces()}
            className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded"></div>
                <div className="h-5 w-12 bg-slate-200 rounded"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-100 rounded"></div>
              <div className="h-8 w-full bg-slate-100 rounded mt-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count & Grid */}
      {!isLoading && !error && places.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 px-1">
            <div className="flex items-center space-x-3">
              <span>
                Showing <strong className="text-slate-800">{places.length}</strong>{" "}
                {places.length === 1 ? "place" : "places"} in {currentCity.name}
              </span>
              <span className="flex items-center space-x-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    source === "live" ? "bg-emerald-500" : "bg-sky-500"
                  }`}
                ></span>
                <span className="capitalize">{source} Data</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-[11px] font-medium text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "distance" | "name")}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="distance">Nearest First</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...places]
              .sort((a, b) => {
                if (sortBy === "name") return a.name.localeCompare(b.name);
                return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
              })
              .map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelectOnMap={onSelectOnMap}
                  onGetDirections={onGetDirections}
                  onViewDetails={(p) => setActivePlace(p)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && places.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No places found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchTerm
              ? `No matching places found for "${searchTerm}" in ${currentCity.name}.`
              : "Try switching categories or clearing search filters."}
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Place Details Modal */}
      <PlaceDetailModal
        place={activePlace}
        onClose={() => setActivePlace(null)}
        onSelectOnMap={onSelectOnMap}
        onGetDirections={onGetDirections}
      />
    </div>
  );
}
