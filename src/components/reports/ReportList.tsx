"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Clock3,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { CommunityReportItem, ReportCategory, ReportStatus } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

interface ReportListProps {
  reports: CommunityReportItem[];
  stats: { total: number; pending: number; verified: number; resolved: number };
  isLoading: boolean;
  onRefresh: () => void;
  onLocateOnMap: (report: CommunityReportItem) => void;
}

const STATUS_BADGES: Record<
  ReportStatus,
  { bg: string; text: string; icon: React.ElementType }
> = {
  "Pending verification": {
    bg: "bg-amber-100 text-amber-900 border-amber-300",
    text: "text-amber-800",
    icon: Clock3,
  },
  Verified: {
    bg: "bg-blue-100 text-blue-900 border-blue-300",
    text: "text-blue-800",
    icon: Eye,
  },
  Resolved: {
    bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    text: "text-emerald-800",
    icon: CheckCircle,
  },
};

export function ReportList({
  reports,
  stats,
  isLoading,
  onRefresh,
  onLocateOnMap,
}: ReportListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = reports.filter((r) => {
    if (selectedStatus !== "all" && r.status !== selectedStatus) return false;
    if (selectedCategory !== "all" && r.category !== selectedCategory)
      return false;
    return true;
  });

  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      "ID",
      "Category",
      "Title",
      "Description",
      "Address",
      "Latitude",
      "Longitude",
      "Status",
      "Observation Time",
      "Submitted At",
    ];

    const rows = filtered.map((r) => [
      `"${r.id}"`,
      `"${r.categoryLabel.replace(/"/g, '""')}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${r.locationAddress.replace(/"/g, '""')}"`,
      r.latitude ?? "",
      r.longitude ?? "",
      `"${r.status}"`,
      r.observationTime ? `"${new Date(r.observationTime).toLocaleString()}"` : '""',
      `"${new Date(r.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cityscope_civic_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">
            Total Submitted
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
          <p className="text-2xl font-bold text-amber-950 mt-1">
            {stats.pending}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-xs text-blue-700 font-medium flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Verified Issues</span>
          </span>
          <p className="text-2xl font-bold text-blue-950 mt-1">
            {stats.verified}
          </p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
          <p className="text-2xl font-bold text-emerald-950 mt-1">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          {["all", "Pending verification", "Verified", "Resolved"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedStatus === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "all" ? "All Statuses" : st}
              </button>
            )
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Categories</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Export filtered reports as CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* List of Reports */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No reports found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No community reports match your selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const statusConfig =
              STATUS_BADGES[item.status] || STATUS_BADGES["Pending verification"];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.categoryLabel}
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bg}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.locationAddress}</span>
                    </div>

                    {item.observationTime && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Observed: {formatDateTime(item.observationTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Submitted {formatRelativeTime(item.createdAt)}</span>
                  </span>

                  {item.latitude != null && item.longitude != null && (
                    <button
                      onClick={() => onLocateOnMap(item)}
                      className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-semibold text-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Locate on Map</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
