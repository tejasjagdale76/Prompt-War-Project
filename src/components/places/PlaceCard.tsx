"use client";

import React from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Compass,
  Utensils,
  Landmark,
  Trees,
  Hotel,
} from "lucide-react";
import { Place } from "@/lib/types";
import { formatDistance } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  onSelectOnMap: (place: Place) => void;
  onGetDirections: (place: Place) => void;
  onViewDetails: (place: Place) => void;
}

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; icon: React.ElementType }
> = {
  tourist: {
    bg: "bg-purple-50 border-purple-200 text-purple-700",
    text: "text-purple-600",
    icon: Compass,
  },
  historical: {
    bg: "bg-amber-50 border-amber-200 text-amber-700",
    text: "text-amber-600",
    icon: Landmark,
  },
  restaurant: {
    bg: "bg-orange-50 border-orange-200 text-orange-700",
    text: "text-orange-600",
    icon: Utensils,
  },
  park: {
    bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    text: "text-emerald-600",
    icon: Trees,
  },
  hotel: {
    bg: "bg-sky-50 border-sky-200 text-sky-700",
    text: "text-sky-600",
    icon: Hotel,
  },
};

export function PlaceCard({
  place,
  onSelectOnMap,
  onGetDirections,
  onViewDetails,
}: PlaceCardProps) {
  const catStyle =
    CATEGORY_STYLES[place.category] || CATEGORY_STYLES.tourist;
  const CategoryIcon = catStyle.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between p-5 group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${catStyle.bg}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{place.categoryLabel}</span>
          </span>

          <div className="flex items-center space-x-1.5">
            {place.source === "curated" && (
              <span
                title="Curated demonstration data"
                className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 rounded border border-slate-200"
              >
                Curated
              </span>
            )}
            {place.distanceKm !== undefined && (
              <span className="text-xs font-medium text-slate-500">
                ~{formatDistance(place.distanceKm)}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(place)}
          className="text-base font-bold text-slate-900 group-hover:text-sky-600 cursor-pointer line-clamp-1 transition-colors"
        >
          {place.name}
        </h3>

        {/* Address */}
        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 flex items-start space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{place.address}</span>
        </p>

        {/* Coordinates */}
        <div className="mt-2 text-[11px] font-mono text-slate-400">
          {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectOnMap(place)}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>Locate</span>
        </button>

        <button
          onClick={() => onGetDirections(place)}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>

        <button
          onClick={() => onViewDetails(place)}
          aria-label="View Place Details"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
