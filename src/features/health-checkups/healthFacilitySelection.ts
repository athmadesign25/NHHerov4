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
