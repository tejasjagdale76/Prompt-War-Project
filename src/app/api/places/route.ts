import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/services/placeService";
import { PlaceQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = PlaceQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await searchPlaces(parsed.data);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search places",
      },
      { status: 500 }
    );
  }
}
