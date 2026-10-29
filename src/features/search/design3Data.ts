import { ALL_SPECIALITIES } from "@/data/specialities";
import { getCityId, NH_CITIES, type NormalizedResults } from "@/lib/searchService";
import type { SearchTabId } from "./searchTabs";

// Existing directory fixtures are supplied by the legacy view, unchanged.
export interface SearchCatalogs {
  hospitals: { id: string; name: string; city: string; address: string; type: string; specs: string[] }[];
  treatments: { id: string; name: string; speciality: string; description: string; type: string; image: string }[];
  packages: { id: string; name: string; price: string; tests: string; inclusions: string[]; gender: string; hospital: string; type: string; image: string }[];
  labs: { id: string; name: string; price: string; parameters: string; gender: string; hospital: string; type: string }[];
  articles: { id: string; title: string; category: string; summary: string; image: string; author: string; readTime: string; date: string }[];
}

export interface SearchResultItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  hospital?: string;
  city?: string;
  gender?: string;
  price?: string;
  inclusions?: string[];
  detail?: string;
  href?: string;
}

export interface CatalogFilters { letters: string[]; types: string[]; hospitals: string[]; genders: string[] }
export const emptyCatalogFilters = (): CatalogFilters => ({ letters: [], types: [], hospitals: [], genders: [] });
export const uniqueValues = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export function readSearchLocation(params: URLSearchParams) {
  const byId = NH_CITIES.find((city) => String(city.id) === params.get("cityId"));
  const value = byId?.value ?? params.get("location") ?? params.get("city") ?? "All";
  return NH_CITIES.find((city) => city.id === getCityId(value))?.value ?? "All";
}

export function readCatalogFilters(params: URLSearchParams, tab: SearchTabId): CatalogFilters {
  return Object.fromEntries(Object.keys(emptyCatalogFilters()).map((key) => [key, params.getAll(`${tab}.${key}`)])) as unknown as CatalogFilters;
}

export function filterCatalog(items: SearchResultItem[], filters: CatalogFilters) {
  return items.filter((item) =>
    (!filters.letters.length || filters.letters.includes(item.name[0]?.toUpperCase())) &&
    (!filters.types.length || filters.types.includes(item.category)) &&
    (!filters.hospitals.length || filters.hospitals.includes(item.hospital ?? "")) &&
    (!filters.genders.length || item.gender === "Anyone" || filters.genders.includes(item.gender ?? ""))
  );
}

export function catalogResults(catalogs: SearchCatalogs, query: string, location: string, api: NormalizedResults | null): Record<Exclude<SearchTabId, "doctors">, SearchResultItem[]> {
  const q = query.trim().toLocaleLowerCase();
  const matches = (...values: string[]) => !q || values.join(" ").toLocaleLowerCase().includes(q);
  const inCity = (city: string) => location === "All" || getCityId(city) === getCityId(location);
  // Package fixtures contain hospital display names, not geographic IDs.
  const packageInCity = (hospital: string) => location === "All" || hospital.toLowerCase().includes(location.toLowerCase());
  const specialties = q ? (api?.specialities ?? []).map((s) => ({ id: String(s.id), name: s.name, category: "Specialty", description: "", image: s.image }))
    : ALL_SPECIALITIES.map((s) => ({ id: s.slug, name: s.name, category: s.category, description: s.tagline, image: s.image }));
  return {
    hospitals: catalogs.hospitals.filter((h) => matches(h.name, h.city, ...h.specs) && inCity(h.city)).map((h) => ({
      id: h.id, name: h.name, category: h.type, description: h.address, city: h.city, inclusions: h.specs,
    })),
    specialties,
    treatments: q ? [...(api?.treatments ?? []), ...(api?.procedures ?? [])].map((t) => ({
      id: `${t.type}-${t.id}`, name: t.name, category: t.type, description: t.speciality, image: t.image,
    })) : catalogs.treatments.map((t) => ({ id: t.id, name: t.name, category: t.type, description: t.description, image: t.image })),
    packages_tests: [
      ...catalogs.packages.filter((p) => matches(p.name, ...p.inclusions) && packageInCity(p.hospital)).map((p) => ({
        id: p.id, name: p.name, category: p.type, description: p.tests, hospital: p.hospital, gender: p.gender,
        price: p.price, inclusions: p.inclusions, image: p.image,
      })),
      ...catalogs.labs.filter((p) => matches(p.name, p.parameters) && packageInCity(p.hospital)).map((p) => ({
        id: p.id, name: p.name, category: p.type, description: p.parameters, hospital: p.hospital, gender: p.gender, price: p.price,
      })),
    ],
    articles: q ? (api?.blogs ?? []).map((a) => ({ id: String(a.id), name: a.name, category: a.speciality || "Health", description: "", image: a.image }))
      : catalogs.articles.map((a) => ({ id: a.id, name: a.title, category: a.category, description: a.summary, image: a.image, detail: [a.author, a.readTime, a.date].filter(Boolean).join(" · ") })),
  };
}
