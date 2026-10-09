import { NextRequest, NextResponse } from "next/server";
import { calculateRoute } from "@/lib/services/routingService";
import { RouteQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = RouteQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Origin and destination coordinates are required",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { originLat, originLon, destLat, destLon } = parsed.data;
    const route = await calculateRoute(
      originLat,
      originLon,
      destLat,
      destLon
    );

    return NextResponse.json({
      success: true,
      route,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to calculate route",
      },
      { status: 500 }
    );
  }
}
