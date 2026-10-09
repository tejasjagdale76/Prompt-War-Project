"use client";

import React from "react";
import { X, MapPin, Navigation, Tag, Globe, CheckCircle } from "lucide-react";
import { Place } from "@/lib/types";
import { formatDistance } from "@/lib/utils";

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  onSelectOnMap: (place: Place) => void;
  onGetDirections: (place: Place) => void;
}

export function PlaceDetailModal({
  place,
  onClose,
  onSelectOnMap,
  onGetDirections,
}: PlaceDetailModalProps) {
  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-5 text-white flex items-start justify-between">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-2">
              {place.categoryLabel}
            </span>
            <h2 className="text-xl font-bold leading-tight">{place.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Address & Location
            </label>
            <p className="mt-1 text-sm text-slate-800 flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{place.address}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500">Latitude</span>
              <p className="text-sm font-mono font-medium text-slate-800">
                {place.latitude.toFixed(6)}°
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Longitude</span>
              <p className="text-sm font-mono font-medium text-slate-800">
                {place.longitude.toFixed(6)}°
              </p>
            </div>
            {place.distanceKm !== undefined && (
              <div>
                <span className="text-xs text-slate-500">Approx. Distance</span>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDistance(place.distanceKm)}
                </p>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-500">Data Source</span>
              <p className="text-sm font-semibold text-slate-800 flex items-center space-x-1">
                {place.source === "live" ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live OpenStreetMap</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                    <span>Curated Dataset</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {place.rawType && (
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Tag className="w-3.5 h-3.5" />
              <span>OSM Tag: {place.rawType}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              onClose();
              onSelectOnMap(place);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Locate on Map
          </button>
          <button
            onClick={() => {
              onClose();
              onGetDirections(place);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate Here</span>
          </button>
        </div>
      </div>
    </div>
  );
}
