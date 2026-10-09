"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Navigation, TabType } from "@/components/Navigation";
import { PlaceList } from "@/components/places/PlaceList";
import { CityMap } from "@/components/map/CityMap";
import { RoutePanel } from "@/components/map/RoutePanel";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { ReportForm } from "@/components/reports/ReportForm";
import { ReportList } from "@/components/reports/ReportList";
import { DEFAULT_CITY } from "@/lib/constants";
import {
  CityConfig,
  Place,
  RouteResult,
  CommunityReportItem,
} from "@/lib/types";
import { MapPin, AlertCircle, PlusCircle, Navigation as NavIcon } from "lucide-react";

export default function HomePage() {
  const [currentCity, setCurrentCity] = useState<CityConfig>(DEFAULT_CITY);
  const [activeTab, setActiveTab] = useState<TabType>("explore");

  // Places state
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Routing state
  const [origin, setOrigin] = useState<{
    lat: number;
    lon: number;
    label?: string;
  } | null>(null);
  const [destination, setDestination] = useState<{
    lat: number;
    lon: number;
    label?: string;
  } | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Map interaction & report spot picking
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // Community reports state
  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    resolved: 0,
  });
  const [isReportsLoading, setIsReportsLoading] = useState(true);

  // Load community reports
  const fetchReports = async () => {
    setIsReportsLoading(true);
    try {
      const res = await fetch("/api/reports?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReports(data.reports || []);
          if (data.stats) setReportStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // When city changes, reset place selection and route if out of bounds
  const handleCityChange = (city: CityConfig) => {
    setCurrentCity(city);
    setSelectedPlace(null);
    setRoute(null);
    setOrigin(null);
    setDestination(null);
    setPickedLocation(null);
  };

  // Place Card actions
  const handleSelectOnMap = (place: Place) => {
    setSelectedPlace(place);
    setActiveTab("map");
  };

  const handleGetDirections = (place: Place) => {
    setSelectedPlace(place);
    setDestination({
      lat: place.latitude,
      lon: place.longitude,
      label: place.name,
    });
    setActiveTab("map");
  };

  // Calculate route API call
  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;
    setIsRoutingLoading(true);
    setRoutingError(null);

    try {
      const params = new URLSearchParams({
        originLat: origin.lat.toString(),
        originLon: origin.lon.toString(),
        destLat: destination.lat.toString(),
        destLon: destination.lon.toString(),
      });

      const res = await fetch(`/api/routing?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Route could not be calculated.");
      }

      setRoute(data.route);
    } catch (err: any) {
      setRoutingError(err.message || "Route calculation failed.");
    } finally {
      setIsRoutingLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRoute(null);
    setRoutingError(null);
    setOrigin(null);
    setDestination(null);
  };

  // Map click interaction
  const handleMapClick = (coords: { lat: number; lon: number }) => {
    setPickedLocation(coords);
  };

  // Locate report on map
  const handleLocateReportOnMap = (report: CommunityReportItem) => {
    if (report.latitude && report.longitude) {
      setPickedLocation({ lat: report.latitude, lon: report.longitude });
      setActiveTab("map");
    }
  };

  // New report created
  const handleReportCreated = (newReport: CommunityReportItem) => {
    setReports((prev) => [newReport, ...prev]);
    setReportStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Universal Header */}
      <Header
        currentCity={currentCity}
        onCityChange={handleCityChange}
        pendingReportsCount={reportStats.pending}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reportCount={reports.length}
        placeCount={places.length > 0 ? places.length : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Module 1: Explore Places */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Explore {currentCity.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Search landmarks, attractions, dining spots, and public gardens.
                </p>
              </div>
            </div>

            <PlaceList
              currentCity={currentCity}
              onSelectOnMap={handleSelectOnMap}
              onGetDirections={handleGetDirections}
              onPlacesLoaded={(loadedPlaces) => {
                setPlaces(loadedPlaces);
              }}
            />
          </div>
        )}

        {/* Module 2: Interactive Map & Routing */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Interactive City Map & Route Finder
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Explore places, civic reports, and compute real driving routes in {currentCity.name}.
                </p>
              </div>

              {pickedLocation && (
                <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-xs text-purple-900">
                  <span className="font-mono">
                    Selected: {pickedLocation.lat.toFixed(4)}, {pickedLocation.lon.toFixed(4)}
                  </span>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className="font-bold text-purple-700 hover:text-purple-900 underline ml-1"
                  >
                    File Report Here →
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Route control sidebar */}
              <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
                <RoutePanel
                  currentCity={currentCity}
                  origin={origin}
                  destination={destination}
                  route={route}
                  isLoading={isRoutingLoading}
                  error={routingError}
                  onSetOrigin={setOrigin}
                  onSetDestination={setDestination}
                  onCalculateRoute={handleCalculateRoute}
                  onClearRoute={handleClearRoute}
                />

                <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4 text-xs text-sky-900 space-y-2">
                  <span className="font-bold flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-700" />
                    <span>Map Shortcuts</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    <li>Click any place marker popup to set as Origin or Destination.</li>
                    <li>Click anywhere on the map to pin a spot for a Community Civic Report.</li>
                    <li>Yellow / Red warning markers represent active civic hazard reports.</li>
                  </ul>
                </div>
              </div>

              {/* Full Interactive Leaflet Map */}
              <div className="lg:col-span-8 order-1 lg:order-2 h-[560px] bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                <CityMap
                  center={[currentCity.lat, currentCity.lon]}
                  zoom={currentCity.zoom}
                  places={places}
                  reports={reports}
                  selectedPlace={selectedPlace}
                  origin={origin}
                  destination={destination}
                  route={route}
                  pickedLocation={pickedLocation}
                  onMapClick={handleMapClick}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                  onSetAsOrigin={(pt) => setOrigin(pt)}
                  onSetAsDestination={(pt) => setDestination(pt)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Module 3: Weather Dashboard */}
        {activeTab === "weather" && (
          <div>
            <WeatherWidget currentCity={currentCity} />
          </div>
        )}

        {/* Module 4: Community Reports */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Civic Community Reports
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Report and track local issues like potholes, waterlogging, broken streetlights, and road obstructions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Report Submission Form */}
              <div className="lg:col-span-5">
                <ReportForm
                  currentCity={currentCity}
                  pickedCoords={pickedLocation}
                  onClearPickedCoords={() => setPickedLocation(null)}
                  onReportCreated={handleReportCreated}
                  onSwitchToMapToPick={() => setActiveTab("map")}
                />
              </div>

              {/* Reports Feed & Stats */}
              <div className="lg:col-span-7">
                <ReportList
                  reports={reports}
                  stats={reportStats}
                  isLoading={isReportsLoading}
                  onRefresh={fetchReports}
                  onLocateOnMap={handleLocateReportOnMap}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">CityScope</span>
            <span>• Smart City Explorer MVP</span>
          </div>
          <div>
            OpenStreetMap • Open-Meteo • Project-OSRM • SQLite Persistence
          </div>
        </div>
      </footer>
    </div>
  );
}
