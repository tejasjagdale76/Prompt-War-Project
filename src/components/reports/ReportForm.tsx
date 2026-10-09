"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Send,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { CityConfig, CommunityReportItem, ReportCategory } from "@/lib/types";

interface ReportFormProps {
  currentCity: CityConfig;
  pickedCoords: { lat: number; lon: number } | null;
  onClearPickedCoords: () => void;
  onReportCreated: (newReport: CommunityReportItem) => void;
  onSwitchToMapToPick?: () => void;
}

export function ReportForm({
  currentCity,
  pickedCoords,
  onClearPickedCoords,
  onReportCreated,
  onSwitchToMapToPick,
}: ReportFormProps) {
  const [category, setCategory] = useState<ReportCategory>("pothole");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [observationTime, setObservationTime] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  // Set default observation time to current local datetime
  useEffect(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setObservationTime(localIso);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerMessage(null);

    // Basic frontend checks
    const newErrors: Record<string, string> = {};
    if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    }
    if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }
    if (locationAddress.trim().length < 3) {
      newErrors.locationAddress = "Please provide a location or street address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        category,
        title: title.trim(),
        description: description.trim(),
        locationAddress: locationAddress.trim(),
        observationTime: observationTime ? new Date(observationTime).toISOString() : null,
      };

      if (pickedCoords) {
        payload.latitude = pickedCoords.lat;
        payload.longitude = pickedCoords.lon;
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.issues && Array.isArray(data.issues)) {
          const fieldErrors: Record<string, string> = {};
          data.issues.forEach((issue: any) => {
            fieldErrors[issue.field] = issue.message;
          });
          setErrors(fieldErrors);
        }
        throw new Error(data.error || "Failed to submit report");
      }

      // Success
      setServerMessage({
        type: data.isDuplicateWarning ? "warning" : "success",
        text: data.message || "Report registered successfully!",
      });

      // Clear fields
      setTitle("");
      setDescription("");
      setLocationAddress("");
      onClearPickedCoords();

      if (data.report) {
        onReportCreated(data.report);
      }
    } catch (err: any) {
      setServerMessage({
        type: "error",
        text: err.message || "Network error while submitting report.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Submit a Civic Report
          </h3>
          <p className="text-xs text-slate-500">
            Report road hazards, sanitation problems, or infrastructure defects in {currentCity.name}
          </p>
        </div>
      </div>

      {serverMessage && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
            serverMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : serverMessage.type === "warning"
              ? "bg-amber-50 text-amber-900 border border-amber-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          {serverMessage.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {serverMessage.type === "warning" && (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          {serverMessage.type === "error" && (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{serverMessage.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
        {/* Category selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Problem Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REPORT_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  category === cat.id
                    ? "border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <div className="font-semibold">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Report Title *
            </label>
            <span className="text-slate-400 text-[10px]">
              {title.length}/100
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g., Deep crater on left lane near Shivaji Nagar metro"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.title ? "border-rose-300 bg-rose-50" : "border-slate-200"
            }`}
          />
          {errors.title && (
            <span className="text-rose-600 text-[11px] mt-1 block">
              {errors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Description & Details *
            </label>
            <span className="text-slate-400 text-[10px]">
              {description.length}/1000
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="Provide context (size of pothole, obstruction extent, severity, danger to pedestrians or two-wheelers)..."
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.description
                ? "border-rose-300 bg-rose-50"
                : "border-slate-200"
            }`}
          />
          {errors.description && (
            <span className="text-rose-600 text-[11px] mt-1 block">
              {errors.description}
            </span>
          )}
        </div>

        {/* Location Address */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
            Street / Landmark Address *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`e.g., Near Alka Talkies Chowk, Sadashiv Peth, ${currentCity.name}`}
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.locationAddress
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200"
              }`}
            />
          </div>
          {errors.locationAddress && (
            <span className="text-rose-600 text-[11px] mt-1 block">
              {errors.locationAddress}
            </span>
          )}
        </div>

        {/* Map Coordinates & Observation Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Picked Coordinates on Map */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
              Map Coordinates (Optional)
            </label>
            {pickedCoords ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                <span className="font-mono text-[11px]">
                  {pickedCoords.lat.toFixed(5)}, {pickedCoords.lon.toFixed(5)}
                </span>
                <button
                  type="button"
                  onClick={onClearPickedCoords}
                  className="text-xs text-sky-700 hover:text-sky-900 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSwitchToMapToPick}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs transition-colors flex items-center justify-between"
              >
                <span>Click map to pin spot</span>
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
              </button>
            )}
          </div>

          {/* Observation Date-Time */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
              Observation Time (Optional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="datetime-local"
                value={observationTime}
                onChange={(e) => setObservationTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Validating & Persisting..."
                : "Submit Civic Report"}
            </span>
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Reports are verified by municipal authorities before being marked resolved.
          </p>
        </div>
      </form>
    </div>
  );
}
