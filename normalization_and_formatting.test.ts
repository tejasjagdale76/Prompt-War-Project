import { describe, it, expect } from "vitest";
import {
  calculateDistanceKm,
  formatDistance,
  formatDuration,
  formatRelativeTime,
  formatDateTime,
} from "../src/lib/utils";

describe("Formatting and Normalization Utilities", () => {
  it("calculates accurate Haversine distance between coordinates", () => {
    // Distance between Shaniwar Wada (18.5196, 73.8553) and Aga Khan Palace (18.5524, 73.9015) in Pune
    const distance = calculateDistanceKm(18.5196, 73.8553, 18.5524, 73.9015);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(8); // Approximately 6.1 km
  });

  it("formats distances properly in meters and kilometers", () => {
    expect(formatDistance(0.35)).toBe("350 m");
    expect(formatDistance(2.45)).toBe("2.5 km");
    expect(formatDistance(12.0)).toBe("12.0 km");
  });

  it("formats durations properly in minutes and hours", () => {
    expect(formatDuration(15)).toBe("15 mins");
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(85)).toBe("1 hr 25 mins");
  });

  it("formats relative timestamps safely", () => {
    const now = new Date();
    const tenSecAgo = new Date(now.getTime() - 10 * 1000);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    expect(formatRelativeTime(tenSecAgo.toISOString())).toBe("Just now");
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe("5m ago");
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe("2h ago");
    expect(formatRelativeTime("invalid-date")).toBe("Unknown");
  });

  it("handles invalid dates without crashing", () => {
    expect(formatDateTime("not-a-date")).toBe("Invalid date");
  });
});
