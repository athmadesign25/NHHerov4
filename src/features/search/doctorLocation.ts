import { findClosestNHHub } from "@/components/search/NHSearchExperience/searchData";
import { getCityId, NH_CITIES } from "@/lib/searchService";

interface Coordinates { latitude: number; longitude: number; accuracy: number }

/** Suggest a nearby mapped city, never claim coordinates establish a city boundary.
 * Unmapped or imprecise locations require a manual choice. No reverse-geocoding
 * service receives the patient's coordinates.
 */
export function suggestDoctorCity({ latitude, longitude, accuracy }: Coordinates): string | null {
  if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 10000) return null;
  const closest = findClosestNHHub(latitude, longitude);
  if (closest.distanceKm + accuracy / 1000 > 35) return null;
  return NH_CITIES.find((city) => city.id === getCityId(closest.hub))?.value ?? null;
}

type LocationResult = { city: string; error?: never } | { city?: never; error: string };

/** Browser permission is the only confirmation needed for location detection. */
export async function requestDoctorCity(isCurrent: () => boolean = () => true): Promise<LocationResult> {
  if (!window.isSecureContext || !navigator.geolocation) return { error: "Location isn’t available here. Choose a city from the location menu." };
  const denied = "Location is blocked. Allow it in your browser’s site settings, or choose a city.";
  try {
    if ((await navigator.permissions?.query({ name: "geolocation" }))?.state === "denied") return { error: denied };
  } catch { /* Request directly if permission querying is unsupported. */ }
  if (!isCurrent()) return { error: "Location request cancelled." };
  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const city = suggestDoctorCity(position.coords);
        resolve(city ? { city } : { error: "No nearby city could be matched. Choose a city from the location menu." });
      }, (error) => resolve({ error: error.code === 1 ? denied : error.code === 3
        ? "Location took too long. Try again or choose a city."
        : "Couldn’t find your location. Try again or choose a city." }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    } catch { resolve({ error: "Couldn’t access your location. Choose a city from the location menu." }); }
  });
}
