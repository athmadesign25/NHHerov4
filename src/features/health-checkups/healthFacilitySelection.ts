import type { HealthFacility } from "./catalog";

export function healthCityKey(city: string): string {
  return city.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function healthCityOptions(facilities: readonly HealthFacility[], catalogueCities: readonly { label: string }[] = []): { value: string; label: string }[] {
  const cities = new Map<string, string>();
  for (const city of catalogueCities) {
    const value = healthCityKey(city.label);
    if (value && !cities.has(value)) cities.set(value, city.label.trim().replace(/\s+/g, " "));
  }
  for (const facility of facilities) {
    for (const city of [facility.city, ...(facility.serviceCities ?? [])]) {
      const value = healthCityKey(city);
      if (value && !cities.has(value)) cities.set(value, city.trim().replace(/\s+/g, " "));
    }
  }
  return [...cities].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "en"));
}

export function healthFacilityServesCity(facility: HealthFacility, city: string): boolean {
  const key = healthCityKey(city);
  return Boolean(key) && [facility.city, ...(facility.serviceCities ?? [])].some(value => healthCityKey(value) === key);
}

export function resolveHealthFacility(facilities: readonly HealthFacility[], value: string | null | undefined): HealthFacility | undefined {
  if (!value?.trim()) return undefined;
  const key = value.trim();
  return facilities.find(facility => facility.id === key) ?? facilities.find(facility => facility.unitCode === key);
}

/** Explicit entry wins; a city never silently picks among multiple centres. */
export function resolveHealthEntryCentre(facilities: readonly HealthFacility[], context: {
  explicitFacility?: string | null;
  rememberedFacility?: string | null;
  city?: string | null;
}): HealthFacility | undefined {
  const explicit = resolveHealthFacility(facilities, context.explicitFacility);
  if (explicit) return explicit;
  const remembered = resolveHealthFacility(facilities, context.rememberedFacility);
  if (context.city) {
    const centres = facilities.filter(facility => healthFacilityServesCity(facility, context.city!));
    if (remembered && centres.includes(remembered)) return remembered;
    return centres.length === 1 ? centres[0] : undefined;
  }
  return remembered;
}

const CENTRE_PREFERENCE_KEY = "nh-health-centre";
// A centre preference is not a cart: never persist test, member or payment data here.
export function readHealthCentrePreference(): string | null {
  try { return window.localStorage.getItem(CENTRE_PREFERENCE_KEY); } catch { return null; }
}
export function rememberHealthCentrePreference(id: string): void {
  try { window.localStorage.setItem(CENTRE_PREFERENCE_KEY, id); } catch { /* Browsing works with storage disabled. */ }
}
