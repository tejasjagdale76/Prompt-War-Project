import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/services/weatherService";
import { WeatherQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = WeatherQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid weather query parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { lat, lon, city } = parsed.data;
    const weather = await fetchWeatherData(lat, lon, city);

    return NextResponse.json({
      success: true,
      weather,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch weather data",
      },
      { status: 502 }
    );
  }
}
