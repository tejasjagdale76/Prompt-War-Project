"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Place, RouteResult, CommunityReportItem } from "@/lib/types";

interface CityMapProps {
  center: [number, number];
  zoom: number;
  places: Place[];
  reports: CommunityReportItem[];
  selectedPlace: Place | null;
  origin: { lat: number; lon: number; label?: string } | null;
  destination: { lat: number; lon: number; label?: string } | null;
  route: RouteResult | null;
  pickedLocation: { lat: number; lon: number } | null;
  onMapClick?: (coords: { lat: number; lon: number }) => void;
  onSelectPlace?: (place: Place) => void;
  onSetAsOrigin?: (coords: { lat: number; lon: number; label: string }) => void;
  onSetAsDestination?: (coords: {
    lat: number;
    lon: number;
    label: string;
  }) => void;
}

const DynamicLeafletMap = dynamic(
  () => import("./LeafletMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <span className="text-sm font-semibold">Loading interactive city map...</span>
      </div>
    ),
  }
);

export function CityMap(props: CityMapProps) {
  return <DynamicLeafletMap {...props} />;
}
