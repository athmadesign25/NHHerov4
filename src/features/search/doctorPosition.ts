export interface DoctorPosition { latitude: number; longitude: number; accuracy: number }
type PositionResult = { position: DoctorPosition; error?: never } | { position?: never; error: string };

/** Explicit Near me request. Never stores coordinates or changes the chosen city. */
export async function requestDoctorPosition(isCurrent: () => boolean = () => true): Promise<PositionResult> {
  if (!window.isSecureContext || !navigator.geolocation) return { error: "Location isn’t available here. You can continue browsing doctors." };
  const denied = "Location is blocked. Allow it in your browser’s site settings, then try Near me again.";
  try {
    if ((await navigator.permissions?.query({ name: "geolocation" }))?.state === "denied") return { error: denied };
  } catch { /* Browsers without permission inspection can still request location. */ }
  if (!isCurrent()) return { error: "Location request cancelled." };
  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (!isCurrent()) { resolve({ error: "Location request cancelled." }); return; }
        const { latitude, longitude, accuracy } = coords;
        if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 10000) {
          resolve({ error: "Couldn’t get a precise location. Try Near me again." });
        } else resolve({ position: { latitude, longitude, accuracy } });
      }, (error) => resolve({ error: error.code === 1 ? denied : error.code === 3
        ? "Location took too long. Try Near me again."
        : "Couldn’t find your location. Try Near me again." }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    } catch { resolve({ error: "Couldn’t access your location. You can continue browsing doctors." }); }
  });
}
