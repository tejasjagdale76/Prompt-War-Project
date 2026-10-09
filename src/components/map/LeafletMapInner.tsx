"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place, RouteResult, CommunityReportItem } from "@/lib/types";

interface LeafletMapInnerProps {
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

export default function LeafletMapInner({
  center,
  zoom,
  places,
  reports,
  selectedPlace,
  origin,
  destination,
  route,
  pickedLocation,
  onMapClick,
  onSelectPlace,
  onSetAsOrigin,
  onSetAsDestination,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const onMapClickRef = useRef(onMapClick);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const onSetAsOriginRef = useRef(onSetAsOrigin);
  const onSetAsDestinationRef = useRef(onSetAsDestination);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onSelectPlaceRef.current = onSelectPlace;
    onSetAsOriginRef.current = onSetAsOrigin;
    onSetAsDestinationRef.current = onSetAsDestination;
  });

  const [centerLat, centerLon] = center;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      map.on("click", (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current({ lat: e.latlng.lat, lon: e.latlng.lng });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLon, zoom]);

  // Update view when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLon], zoom);
    }
  }, [centerLat, centerLon, zoom]);

  // Update markers and route whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // 1. Render Places
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const markerHtml = `
        <div style="
          background-color: ${isSelected ? "#0284c7" : "#ffffff"};
          color: ${isSelected ? "#ffffff" : "#0284c7"};
          border: 2px solid #0284c7;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.25);
          font-weight: bold;
          font-size: 11px;
        ">
          📍
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: "custom-place-icon",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon });

      const popupContent = `
        <div style="min-width: 180px; font-family: sans-serif;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${place.name}</strong>
          <span style="display: inline-block; font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-bottom: 6px;">
            ${place.categoryLabel}
          </span>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.3;">${place.address}</p>
          <div style="display: flex; gap: 4px;">
            <button id="dest-btn-${place.id}" style="background: #0284c7; color: white; border: none; padding: 4px 8px; font-size: 11px; border-radius: 4px; cursor: pointer; flex: 1;">
              Set Destination
            </button>
            <button id="orig-btn-${place.id}" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 4px 8px; font-size: 11px; border-radius: 4px; cursor: pointer;">
              Set Origin
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        const destBtn = document.getElementById(`dest-btn-${place.id}`);
        if (destBtn) {
          destBtn.onclick = () => {
            if (onSetAsDestinationRef.current) {
              onSetAsDestinationRef.current({
                lat: place.latitude,
                lon: place.longitude,
                label: place.name,
              });
            }
          };
        }

        const origBtn = document.getElementById(`orig-btn-${place.id}`);
        if (origBtn) {
          origBtn.onclick = () => {
            if (onSetAsOriginRef.current) {
              onSetAsOriginRef.current({
                lat: place.latitude,
                lon: place.longitude,
                label: place.name,
              });
            }
          };
        }
      });

      marker.on("click", () => {
        if (onSelectPlaceRef.current) onSelectPlaceRef.current(place);
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // 2. Render Community Reports
    reports.forEach((rep) => {
      if (rep.latitude == null || rep.longitude == null) return;

      const isResolved = rep.status === "Resolved";
      const isVerified = rep.status === "Verified";
      const badgeBg = isResolved ? "#10b981" : isVerified ? "#f59e0b" : "#ef4444";

      const reportHtml = `
        <div style="
          background-color: ${badgeBg};
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          font-size: 12px;
        ">
          ⚠️
        </div>
      `;

      const repIcon = L.divIcon({
        html: reportHtml,
        className: "custom-report-icon",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const repMarker = L.marker([rep.latitude, rep.longitude], {
        icon: repIcon,
      });

      const repPopup = `
        <div style="min-width: 170px; font-family: sans-serif;">
          <span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">
            Civic Report: ${rep.categoryLabel}
          </span>
          <strong style="font-size: 12px; color: #0f172a; display: block; margin: 4px 0 2px 0;">${rep.title}</strong>
          <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0;">${rep.description}</p>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">Status: ${rep.status}</span>
        </div>
      `;
      repMarker.bindPopup(repPopup);
      markersGroup.addLayer(repMarker);
    });

    // 3. Render Origin Marker (Green)
    if (origin) {
      const origHtml = `
        <div style="
          background-color: #10b981;
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          font-weight: bold;
          font-size: 13px;
        ">
          A
        </div>
      `;
      const origIcon = L.divIcon({
        html: origHtml,
        className: "origin-icon",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const origMarker = L.marker([origin.lat, origin.lon], { icon: origIcon });
      origMarker.bindPopup(
        `<strong>Origin:</strong> ${origin.label || "Start Location"}`
      );
      markersGroup.addLayer(origMarker);
    }

    // 4. Render Destination Marker (Red)
    if (destination) {
      const destHtml = `
        <div style="
          background-color: #ef4444;
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          font-weight: bold;
          font-size: 13px;
        ">
          B
        </div>
      `;
      const destIcon = L.divIcon({
        html: destHtml,
        className: "dest-icon",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const destMarker = L.marker([destination.lat, destination.lon], {
        icon: destIcon,
      });
      destMarker.bindPopup(
        `<strong>Destination:</strong> ${destination.label || "Target Location"}`
      );
      markersGroup.addLayer(destMarker);
    }

    // 5. Render Picked Coordinates Pin (Purple)
    if (pickedLocation) {
      const pickHtml = `
        <div style="
          background-color: #8b5cf6;
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          font-size: 12px;
        ">
          📌
        </div>
      `;
      const pickIcon = L.divIcon({
        html: pickHtml,
        className: "pick-icon",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const pickMarker = L.marker([pickedLocation.lat, pickedLocation.lon], {
        icon: pickIcon,
      });
      pickMarker.bindPopup(
        `<strong>Selected Spot</strong><br/>${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lon.toFixed(5)}`
      );
      markersGroup.addLayer(pickMarker);
    }

    // 6. Render Route Polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (route && route.geometry && route.geometry.length > 0) {
      const polyline = L.polyline(route.geometry, {
        color: "#0284c7",
        weight: 6,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routeLayerRef.current = polyline;

      // Fit bounds to show entire route
      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (selectedPlace) {
      // Pan to selected place
      map.panTo([selectedPlace.latitude, selectedPlace.longitude], {
        animate: true,
      });
    }
  }, [
    places,
    reports,
    selectedPlace,
    origin,
    destination,
    route,
    pickedLocation,
  ]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
