import {
  CURATED_PUNE_PLACES,
  CURATED_CITY_PLACES,
  DEFAULT_CITY,
} from "../constants";
import { Place, PlaceCategory } from "../types";
import { calculateDistanceKm } from "../utils";

interface PlaceSearchOptions {
  query?: string;
  category?: PlaceCategory;
  city?: string;
  lat?: number;
  lon?: number;
  limit?: number;
}

export interface PlaceSearchResponse {
  places: Place[];
  source: "live" | "curated";
  count: number;
  city: string;
  warning?: string;
}

/**
 * Maps OSM tag keywords to our 5 supported categories
 */
function mapOsmCategory(
  type?: string,
  osmClass?: string
): "tourist" | "restaurant" | "historical" | "park" | "hotel" {
  const combined = `${type || ""} ${osmClass || ""}`.toLowerCase();

  if (
    combined.includes("historic") ||
    combined.includes("monument") ||
    combined.includes("memorial") ||
    combined.includes("castle") ||
    combined.includes("fort") ||
    combined.includes("palace") ||
    combined.includes("heritage")
  ) {
    return "historical";
  }

  if (
    combined.includes("park") ||
    combined.includes("garden") ||
    combined.includes("nature") ||
    combined.includes("forest") ||
    combined.includes("leisure")
  ) {
    return "park";
  }

  if (
    combined.includes("restaurant") ||
    combined.includes("cafe") ||
    combined.includes("food") ||
    combined.includes("bakery") ||
    combined.includes("bar")
  ) {
    return "restaurant";
  }

  if (
    combined.includes("hotel") ||
    combined.includes("hostel") ||
    combined.includes("motel") ||
    combined.includes("guest_house") ||
    combined.includes("lodging")
  ) {
    return "hotel";
  }

  return "tourist";
}

const CATEGORY_LABELS: Record<string, string> = {
  tourist: "Tourist Attraction",
  historical: "Historical Landmark",
  restaurant: "Restaurant & Cafe",
  park: "Park & Public Space",
  hotel: "Hotel & Stay",
};

/**
 * Searches places via Photon API (OpenStreetMap geocoding engine)
 * with robust timeout and curated fallback on error
 */
export async function searchPlaces(
  options: PlaceSearchOptions = {}
): Promise<PlaceSearchResponse> {
  const {
    query = "",
    category = "all",
    city = DEFAULT_CITY.name,
    lat = DEFAULT_CITY.lat,
    lon = DEFAULT_CITY.lon,
    limit = 20,
  } = options;

  const searchQuery = query.trim();

  // Try live OSM Photon API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second bounded timeout

    // Build Photon query combining user search and city
    const fullQuery = searchQuery ? `${searchQuery} ${city}` : `${city} attraction`;
    const photonUrl = new URL("https://photon.komoot.io/api/");
    photonUrl.searchParams.set("q", fullQuery);
    photonUrl.searchParams.set("lat", lat.toString());
    photonUrl.searchParams.set("lon", lon.toString());
    photonUrl.searchParams.set("limit", String(Math.min(limit * 2, 40)));

    const response = await fetch(photonUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "CityScope/1.0 (Smart City Explorer Project)",
      },
      next: { revalidate: 300 }, // Cache 5 mins in Next.js
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const livePlaces: Place[] = data.features
          .map((item: any) => {
            const props = item.properties || {};
            const coords = item.geometry?.coordinates || [0, 0];
            const pLon = coords[0];
            const pLat = coords[1];

            const name = props.name || props.street || props.city;
            if (!name) return null;

            const placeCat = mapOsmCategory(props.osm_value, props.osm_key);

            // Construct readable address
            const addressParts = [
              props.street,
              props.district,
              props.city,
              props.postcode,
            ].filter(Boolean);
            const address = addressParts.length > 0 ? addressParts.join(", ") : `${city}, Maharashtra`;

            return {
              id: `osm-${props.osm_id || Math.random().toString(36).substring(2, 9)}`,
              name,
              category: placeCat,
              categoryLabel: CATEGORY_LABELS[placeCat] || "Place",
              address,
              latitude: Number(pLat),
              longitude: Number(pLon),
              distanceKm: calculateDistanceKm(lat, lon, Number(pLat), Number(pLon)),
              source: "live" as const,
              rawType: props.osm_value || props.osm_key,
            };
          })
          .filter(Boolean) as Place[];

        // Apply category filter if specified
        let filtered = livePlaces;
        if (category !== "all") {
          filtered = filtered.filter((p) => p.category === category);
        }

        if (filtered.length > 0) {
          return {
            places: filtered.slice(0, limit),
            source: "live",
            count: filtered.length,
            city,
          };
        }
      }
    }
  } catch (err) {
    // Expected in offline, timeout, or rate-limited environments - fall through to curated demo dataset
  }

  // Curated demo dataset fallback (strictly labeled as 'curated')
  const basePlaces =
    CURATED_CITY_PLACES[city] ||
    CURATED_CITY_PLACES.Pune ||
    CURATED_PUNE_PLACES;

  let curated = basePlaces.map((p) => ({
    ...p,
    distanceKm: calculateDistanceKm(lat, lon, p.latitude, p.longitude),
  }));

  if (category !== "all") {
    curated = curated.filter((p) => p.category === category);
  }

  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    curated = curated.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.address.toLowerCase().includes(qLower) ||
        p.categoryLabel.toLowerCase().includes(qLower)
    );
  }

  // Sort by distance
  curated.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return {
    places: curated.slice(0, limit),
    source: "curated",
    count: curated.length,
    city,
    warning:
      "Live OSM discovery service was unreachable or returned 0 matching records; showing verified curated demonstration places.",
  };
}
