import { NextRequest, NextResponse } from "next/server";
import {
  createReport,
  getReports,
  getReportStats,
} from "@/lib/services/reportService";
import { CreateReportSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const [reports, stats] = await Promise.all([
      getReports({ category, status, limit }),
      getReportStats(),
    ]);

    return NextResponse.json({
      success: true,
      reports,
      stats,
      count: reports.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve community reports",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please check your inputs.",
          issues: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { report, isDuplicateWarning } = await createReport(parsed.data);

    return NextResponse.json(
      {
        success: true,
        report,
        isDuplicateWarning,
        message: isDuplicateWarning
          ? "Report submitted successfully! Note: A similar report was recently recorded near this location."
          : "Civic report submitted successfully. It has been queued for verification.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save community report",
      },
      { status: 500 }
    );
  }
}
