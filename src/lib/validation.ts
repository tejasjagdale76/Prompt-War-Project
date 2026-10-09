import { z } from "zod";

export const ReportCategoryEnum = z.enum([
  "pothole",
  "waterlogging",
  "streetlight",
  "obstruction",
  "cleanliness",
  "other",
]);

export const CreateReportSchema = z.object({
  category: ReportCategoryEnum,
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  locationAddress: z
    .string()
    .trim()
    .min(3, "Location address is required (at least 3 characters)")
    .max(250, "Location address cannot exceed 250 characters"),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional()
    .nullable(),
  observationTime: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: "Invalid observation time date format" }
    ),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const PlaceQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  category: z
    .enum(["all", "tourist", "historical", "restaurant", "park", "hotel"])
    .optional()
    .default("all"),
  city: z.string().trim().optional().default("Pune"),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const RouteQuerySchema = z.object({
  originLat: z.coerce.number().min(-90).max(90),
  originLon: z.coerce.number().min(-180).max(180),
  destLat: z.coerce.number().min(-90).max(90),
  destLon: z.coerce.number().min(-180).max(180),
});

export const WeatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional().default(18.5204),
  lon: z.coerce.number().min(-180).max(180).optional().default(73.8567),
  city: z.string().trim().optional().default("Pune"),
});
