import { calculateHaversineKm, NH_HUB_COORDINATES } from "@/components/search/NHSearchExperience/searchData";
import { NH_CITIES } from "@/lib/searchService";
import type { DoctorPosition } from "./doctorPosition";

// Approximate city centres for selecting a supported search area only. These
// never supply hospital kilometres, travel distances, or Maps destinations.
// The existing shared hubs remain unchanged for other designs.
const cityCentres: Record<string, { lat: number; lon: number }> = {
  ...NH_HUB_COORDINATES,
  Delhi: NH_HUB_COORDINATES["Delhi NCR"],
  Dharwad: { lat: 15.4833, lon: 74.9833 },
  Kolar: { lat: 13.1367, lon: 78.1292 },
  Raipur: { lat: 21.2333, lon: 81.6333 },
  Davangere: { lat: 14.4666, lon: 75.9242 },
  Barasat: { lat: 22.7070, lon: 88.4830 },
  Jamshedpur: { lat: 22.7910, lon: 86.2039 },
  Gurugram: { lat: 28.4601, lon: 77.0264 },
  Howrah: { lat: 22.5833, lon: 88.3500 },
  Katra: { lat: 32.9800, lon: 74.9500 },
  Jammu: { lat: 32.7353, lon: 74.8617 },
  // Hosur intentionally has no appointments in the local directory. Its users
  // resolve to the nearest populated city (Bangalore) instead of an empty list.
};

/** Nearest supported D16 city, including places outside current service areas. */
export function getDesign16NearbyCity(position: DoctorPosition): string | null {
  const { latitude, longitude, accuracy } = position;
  if (![latitude, longitude, accuracy].every(Number.isFinite)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180
    || accuracy < 0 || accuracy > 10000) return null;

  let closest: string | null = null;
  let closestDistance = Infinity;
  for (const { value } of NH_CITIES) {
    const centre = cityCentres[value];
    if (!centre) continue;
    const distance = calculateHaversineKm(latitude, longitude, centre.lat, centre.lon);
    if (distance < closestDistance) {
      closest = value;
      closestDistance = distance;
    }
  }
  return closest;
}
