import { RouteResult, RouteStep } from "../types";
import { calculateDistanceKm } from "../utils";

export async function calculateRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<RouteResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    // OSRM coordinates are {lon},{lat}
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "CityScope/1.0 (Routing Client)",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // OSRM GeoJSON geometry coordinates are [lon, lat], Leaflet polyline requires [lat, lon]
        const geometry: [number, number][] = route.geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );

        const steps: RouteStep[] = [];
        if (route.legs && route.legs[0]?.steps) {
          for (const step of route.legs[0].steps) {
            const maneuverType = step.maneuver?.type || "proceed";
            const maneuverModifier = step.maneuver?.modifier
              ? ` (${step.maneuver.modifier})`
              : "";
            const streetName = step.name ? ` onto ${step.name}` : "";
            steps.push({
              instruction: `${maneuverType}${maneuverModifier}${streetName}`,
              distanceMeters: Math.round(step.distance),
              durationSeconds: Math.round(step.duration),
            });
          }
        }

        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(route.duration / 60);

        return {
          distanceKm,
          durationMinutes: Math.max(1, durationMinutes),
          geometry,
          steps: steps.slice(0, 15),
          provider: "osrm",
          summary: `Driving route calculated via OSRM (${distanceKm} km, ~${durationMinutes} mins)`,
        };
      }
    }
  } catch (err) {
    // Falls through to fallback calculation
  } finally {
    clearTimeout(timeoutId);
  }

  // Graceful direct fallback if public OSRM is unreachable
  const dist = calculateDistanceKm(originLat, originLon, destLat, destLon);
  // Estimate city driving at average 28 km/h in Pune traffic
  const estimatedMins = Math.round((dist / 28) * 60);

  return {
    distanceKm: dist,
    durationMinutes: Math.max(1, estimatedMins),
    geometry: [
      [originLat, originLon],
      [destLat, destLon],
    ],
    steps: [
      {
        instruction: "Proceed directly toward destination",
        distanceMeters: Math.round(dist * 1000),
        durationSeconds: estimatedMins * 60,
      },
    ],
    provider: "fallback-direct",
    summary: `Direct distance estimation (${dist} km, ~${estimatedMins} mins). Public OSRM routing was unreachable.`,
  };
}
