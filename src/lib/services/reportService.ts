import { prisma } from "../db";
import { REPORT_CATEGORIES } from "../constants";
import { CommunityReportItem, ReportCategory, ReportStatus } from "../types";
import { calculateDistanceKm } from "../utils";
import { CreateReportInput } from "../validation";

const CATEGORY_MAP = new Map(
  REPORT_CATEGORIES.map((c) => [c.id, c.label])
);

export async function createReport(
  input: CreateReportInput
): Promise<{ report: CommunityReportItem; isDuplicateWarning?: boolean }> {
  // Check for duplicate reports submitted within the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const recentReports = await prisma.communityReport.findMany({
    where: {
      category: input.category,
      createdAt: { gte: twoHoursAgo },
    },
  });

  let duplicateWarning = false;

  for (const prev of recentReports) {
    // If coordinates are provided, check if within ~300 meters (0.3 km)
    if (
      input.latitude != null &&
      input.longitude != null &&
      prev.latitude != null &&
      prev.longitude != null
    ) {
      const dist = calculateDistanceKm(
        input.latitude,
        input.longitude,
        prev.latitude,
        prev.longitude
      );
      if (dist < 0.3) {
        duplicateWarning = true;
        break;
      }
    }

    // Or check if exact title or address match
    if (
      prev.title.toLowerCase().trim() === input.title.toLowerCase().trim() ||
      prev.locationAddress.toLowerCase().trim() ===
        input.locationAddress.toLowerCase().trim()
    ) {
      duplicateWarning = true;
      break;
    }
  }

  const record = await prisma.communityReport.create({
    data: {
      category: input.category,
      title: input.title,
      description: input.description,
      locationAddress: input.locationAddress,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      observationTime: input.observationTime
        ? new Date(input.observationTime)
        : null,
      status: "Pending verification", // Initial status strictly pending
    },
  });

  return {
    report: {
      id: record.id,
      category: record.category as ReportCategory,
      categoryLabel: CATEGORY_MAP.get(record.category as ReportCategory) || record.category,
      title: record.title,
      description: record.description,
      locationAddress: record.locationAddress,
      latitude: record.latitude,
      longitude: record.longitude,
      observationTime: record.observationTime
        ? record.observationTime.toISOString()
        : null,
      status: record.status as ReportStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    },
    isDuplicateWarning: duplicateWarning,
  };
}

export async function getReports(options: {
  category?: string;
  status?: string;
  limit?: number;
}): Promise<CommunityReportItem[]> {
  const where: any = {};

  if (options.category && options.category !== "all") {
    where.category = options.category;
  }

  if (options.status && options.status !== "all") {
    where.status = options.status;
  }

  const records = await prisma.communityReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 50,
  });

  return records.map((r) => ({
    id: r.id,
    category: r.category as ReportCategory,
    categoryLabel: CATEGORY_MAP.get(r.category as ReportCategory) || r.category,
    title: r.title,
    description: r.description,
    locationAddress: r.locationAddress,
    latitude: r.latitude,
    longitude: r.longitude,
    observationTime: r.observationTime ? r.observationTime.toISOString() : null,
    status: r.status as ReportStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getReportStats() {
  const [total, pending, verified, resolved] = await Promise.all([
    prisma.communityReport.count(),
    prisma.communityReport.count({
      where: { status: "Pending verification" },
    }),
    prisma.communityReport.count({
      where: { status: "Verified" },
    }),
    prisma.communityReport.count({
      where: { status: "Resolved" },
    }),
  ]);

  return { total, pending, verified, resolved };
}
