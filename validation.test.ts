import { describe, it, expect } from "vitest";
import {
  CreateReportSchema,
  PlaceQuerySchema,
  RouteQuerySchema,
  WeatherQuerySchema,
} from "../src/lib/validation";

describe("Zod Validation Schemas", () => {
  describe("CreateReportSchema", () => {
    it("accepts valid civic report inputs", () => {
      const valid = {
        category: "pothole",
        title: "Pothole on FC Road",
        description: "Dangerous pothole in the left lane requiring asphalt repair.",
        locationAddress: "FC Road, Shivajinagar, Pune",
        latitude: 18.52,
        longitude: 73.84,
        observationTime: new Date().toISOString(),
      };

      const result = CreateReportSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects reports with title shorter than 3 characters", () => {
      const invalid = {
        category: "pothole",
        title: "ab",
        description: "Valid description here about road issues.",
        locationAddress: "FC Road, Pune",
      };

      const result = CreateReportSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("rejects reports with description shorter than 10 characters", () => {
      const invalid = {
        category: "waterlogging",
        title: "Flooding on bridge",
        description: "too short",
        locationAddress: "Pune Bridge",
      };

      const result = CreateReportSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 10 characters");
      }
    });

    it("rejects invalid categories", () => {
      const invalid = {
        category: "alien_invasion",
        title: "Unknown issue",
        description: "Valid long description of an issue.",
        locationAddress: "Pune",
      };

      const result = CreateReportSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects out-of-bounds coordinates", () => {
      const invalid = {
        category: "pothole",
        title: "Pothole",
        description: "Large pothole in the road surface.",
        locationAddress: "Main Road",
        latitude: 195.0, // Invalid latitude > 90
        longitude: 73.85,
      };

      const result = CreateReportSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("RouteQuerySchema", () => {
    it("validates origin and destination coordinates", () => {
      const valid = {
        originLat: "18.5204",
        originLon: "73.8567",
        destLat: "18.5524",
        destLon: "73.9015",
      };

      const result = RouteQuerySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originLat).toBe(18.5204);
        expect(result.data.destLon).toBe(73.9015);
      }
    });

    it("rejects missing origin or destination", () => {
      const missing = {
        originLat: "18.5204",
        originLon: "73.8567",
      };

      const result = RouteQuerySchema.safeParse(missing);
      expect(result.success).toBe(false);
    });
  });

  describe("PlaceQuerySchema", () => {
    it("provides sensible defaults when empty", () => {
      const result = PlaceQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("all");
        expect(result.data.city).toBe("Pune");
        expect(result.data.limit).toBe(20);
      }
    });
  });
});
