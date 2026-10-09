"use client";

import React from "react";
import { Search, Navigation as NavIcon, CloudSun, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "explore" | "map" | "weather" | "reports";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  reportCount?: number;
  placeCount?: number;
}

export function Navigation({
  activeTab,
  onTabChange,
  reportCount,
  placeCount,
}: NavigationProps) {
  const tabs = [
    {
      id: "explore" as TabType,
      label: "Explore Places",
      shortLabel: "Explore",
      icon: Search,
      count: placeCount,
    },
    {
      id: "map" as TabType,
      label: "Map & Routing",
      shortLabel: "Map",
      icon: NavIcon,
    },
    {
      id: "weather" as TabType,
      label: "Weather",
      shortLabel: "Weather",
      icon: CloudSun,
    },
    {
      id: "reports" as TabType,
      label: "Community Reports",
      shortLabel: "Reports",
      icon: AlertTriangle,
      count: reportCount,
      badgeHighlight: (reportCount ?? 0) > 0,
    },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-2.5 px-3.5 sm:px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-sky-600" : "text-slate-500"
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>

                {typeof tab.count === "number" && (
                  <span
                    className={cn(
                      "ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full",
                      isActive
                        ? "bg-sky-600 text-white"
                        : tab.badgeHighlight
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
