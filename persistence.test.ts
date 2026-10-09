import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/db";
import { createReport, getReports, getReportStats } from "../src/lib/services/reportService";

describe("Database Persistence & Community Reports", () => {
  const timestamp = Date.now();
  const uniqueTitle = `Unique Pothole Test ${timestamp}`;
  // Isolated test coordinate safely away from other points
  const uniqueLat = 18.3001;
  const uniqueLon = 73.6001;

  beforeAll(async () => {
    // Clean up any test records to ensure clean isolated test state
    await prisma.communityReport.deleteMany({
      where: {
        OR: [
          { title: { startsWith: "Unique Pothole Test" } },
          { title: { startsWith: "Test Pothole" } },
        ],
      },
    });
  });

  afterAll(async () => {
    // Clean up test records created during the test
    await prisma.communityReport.deleteMany({
      where: {
        OR: [
          { title: { startsWith: "Unique Pothole Test" } },
          { title: { startsWith: "Test Pothole" } },
        ],
      },
    });
  });

  it("persists a newly submitted civic report with default 'Pending verification' status", async () => {
    const { report, isDuplicateWarning } = await createReport({
      category: "pothole",
      title: uniqueTitle,
      description: "Severe asphalt depression observed near Kothrud stand.",
      locationAddress: `Unique Test Road ${timestamp}, Pune`,
      latitude: uniqueLat,
      longitude: uniqueLon,
      observationTime: new Date().toISOString(),
    });

    expect(report.id).toBeDefined();
    expect(report.title).toBe(uniqueTitle);
    expect(report.status).toBe("Pending verification");
    expect(report.category).toBe("pothole");
    expect(isDuplicateWarning).toBe(false);

    // Verify it exists in SQLite database
    const dbRecord = await prisma.communityReport.findUnique({
      where: { id: report.id },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.title).toBe(uniqueTitle);
  });

  it("detects and flags duplicate report submission within close proximity or matching title", async () => {
    // Attempt to submit identical report within minutes
    const duplicate = await createReport({
      category: "pothole",
      title: uniqueTitle,
      description: "Duplicate submission of the same issue.",
      locationAddress: `Unique Test Road ${timestamp}, Pune`,
      latitude: uniqueLat,
      longitude: uniqueLon,
      observationTime: new Date().toISOString(),
    });

    expect(duplicate.isDuplicateWarning).toBe(true);
  });

  it("retrieves reports and accurately calculates civic stats", async () => {
    const reports = await getReports({ category: "pothole", limit: 10 });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports.some((r) => r.title === uniqueTitle)).toBe(true);

    const stats = await getReportStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.pending).toBeGreaterThan(0);
  });
});
