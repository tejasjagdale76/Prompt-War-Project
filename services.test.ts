import { describe, it, expect, vi, afterEach } from "vitest";
import { searchPlaces } from "../src/lib/services/placeService";
import { calculateRoute } from "../src/lib/services/routingService";
import { CURATED_PUNE_PLACES } from "../src/lib/constants";

describe("Service Layer Integration & Resilience", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("placeService", () => {
    it("returns curated places with source 'curated' when external API fails", async () => {
      // Mock fetch failure
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      const result = await searchPlaces({
        category: "historical",
        city: "Pune",
        query: "Shaniwar",
      });

      expect(result.source).toBe("curated");
      expect(result.places.length).toBeGreaterThan(0);
      expect(result.places[0].category).toBe("historical");
      expect(result.places[0].name).toContain("Shaniwar");
    });

    it("filters places accurately across categories in fallback mode", async () => {
      // Mock fetch failure to test category filtering deterministically
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Offline mode")
      );

      const historical = await searchPlaces({ category: "historical", city: "Pune" });
      expect(historical.places.every((p) => p.category === "historical")).toBe(true);

      const parks = await searchPlaces({ category: "park", city: "Pune" });
      expect(parks.places.every((p) => p.category === "park")).toBe(true);

      const restaurants = await searchPlaces({ category: "restaurant", city: "Pune" });
      expect(restaurants.places.every((p) => p.category === "restaurant")).toBe(true);
    });

    it("handles empty search matches with empty array", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Offline mode")
      );

      const result = await searchPlaces({
        category: "all",
        city: "Pune",
        query: "nonexistent_place_xyz_12345",
      });
      expect(result.places).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("routingService", () => {
    it("calculates direct fallback route if external OSRM service is unreachable", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("OSRM endpoint unreachable")
      );

      // Route between Shaniwar Wada and Aga Khan Palace
      const route = await calculateRoute(18.5196, 73.8553, 18.5524, 73.9015);

      expect(route).toBeDefined();
      expect(route.distanceKm).toBeGreaterThan(0);
      expect(route.durationMinutes).toBeGreaterThan(0);
      expect(route.provider).toBe("fallback-direct");
      expect(route.geometry.length).toBe(2);
    });

    it("parses valid OSRM response correctly when provider returns data", async () => {
      const mockOsrmResponse = {
        code: "Ok",
        routes: [
          {
            distance: 6500, // 6.5 km
            duration: 900,  // 15 mins
            geometry: {
              coordinates: [
                [73.8553, 18.5196],
                [73.9015, 18.5524],
              ],
            },
            legs: [
              {
                steps: [
                  {
                    maneuver: { type: "depart" },
                    name: "Bajirao Road",
                    distance: 1200,
                    duration: 180,
                  },
                ],
              },
            ],
          },
        ],
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockOsrmResponse,
      } as any);

      const route = await calculateRoute(18.5196, 73.8553, 18.5524, 73.9015);
      expect(route.provider).toBe("osrm");
      expect(route.distanceKm).toBe(6.5);
      expect(route.durationMinutes).toBe(15);
      expect(route.steps.length).toBe(1);
    });
  });
});
