"use client";

import React from "react";
import { Compass, MapPin, Building2, CloudSun } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { CityConfig } from "@/lib/types";

interface HeaderProps {
  currentCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  pendingReportsCount?: number;
}

export function Header({
  currentCity,
  onCityChange,
  pendingReportsCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-100">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  City<span className="text-sky-600">Scope</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                  Smart City Explorer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Places • Interactive Routing • Weather • Civic Reports
              </p>
            </div>
          </div>

          {/* City Selector and Indicators */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <label htmlFor="city-select" className="sr-only">
                Select City
              </label>
              <select
                id="city-select"
                value={currentCity.name}
                onChange={(e) => {
                  const selected = CITIES[e.target.value];
                  if (selected) onCityChange(selected);
                }}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.values(CITIES).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>

            {pendingReportsCount > 0 && (
              <div
                title={`${pendingReportsCount} pending civic reports in review`}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-md border border-amber-200"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1"></span>
                <span>{pendingReportsCount} Civic Reports</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
