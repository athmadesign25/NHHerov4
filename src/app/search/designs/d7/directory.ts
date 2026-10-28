import { searchDoctorsData } from "../../mockDoctors";
import { design3CityDoctors } from "@/features/search/design3CityDoctors";
import { withDesign3DemoMetadata } from "@/features/search/design3DoctorMetadata";
import { bookingUrl, doctorHospitals, filterDoctors, fromDirectoryDoctor, sortDoctors, withSelectedDoctorHospital, type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorSort } from "@/features/search/doctorListing";
import { getCityId, NH_CITIES } from "@/lib/searchService";
import type { JourneyDesign } from "@/features/design-preview/journeyDesigns";

/** The existing preview directory; every entry has a matching booking contract. */
export const design7Doctors = [
  ...withDesign3DemoMetadata(searchDoctorsData.map(fromDirectoryDoctor)),
  ...design3CityDoctors,
];

export function matchesDoctorQuery(doctor: DoctorListingItem, query: string) {
  const searchable = [doctor.name, doctor.speciality, doctor.hospital, ...(doctor.hospitals ?? []), ...(doctor.expertise ?? [])]
    .join(" ").normalize("NFKD").toLowerCase();
  return query.trim().normalize("NFKD").toLowerCase().split(/\s+/).filter(Boolean).every((word) => searchable.includes(word));
}

/** Only an explicit, recognized city suffix overrides the source's home city. */
export function design7HospitalCity(hospital: string, fallbackCity: string) {
  const suffix = hospital.split(",").at(-1)?.trim() ?? "";
  const cityId = getCityId(suffix);
  return NH_CITIES.find((city) => city.id === cityId)?.value ?? fallbackCity;
}

export function searchDesign7Directory(query: string, location: string) {
  return design7Doctors.flatMap((doctor) => {
    const hospitals = doctorHospitals(doctor).filter((hospital) => location === "All" ||
      getCityId(design7HospitalCity(hospital, doctor.city)) === getCityId(location));
    if (!hospitals.length) return [];
    const hospital = hospitals.includes(doctor.hospital) ? doctor.hospital : hospitals[0];
    const scoped = { ...doctor, hospital, hospitals, city: design7HospitalCity(hospital, doctor.city) };
    return matchesDoctorQuery(scoped, query) ? [scoped] : [];
  });
}

export function refineDesign7Doctors(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, sort: DoctorSort, now = new Date()) {
  const ordered = sortDoctors(filterDoctors(doctors, filters, mode, now), sort, mode, now);
  return (sort === "relevance" ? [...ordered].sort((a, b) => Number(b.modes[mode] === true) - Number(a.modes[mode] === true)) : ordered)
    .map((doctor) => {
      const selected = withSelectedDoctorHospital(doctor, filters.hospitals);
      return { ...selected, city: design7HospitalCity(selected.hospital, selected.city) };
    });
}

export function design7BookingUrl(doctor: DoctorListingItem, mode: ConsultationMode, now = new Date(), variant: JourneyDesign = "d7") {
  const selected = mode === "hospital" ? { ...doctor, city: design7HospitalCity(doctor.hospital, doctor.city) } : doctor;
  return `${bookingUrl(selected, mode, true, now)}&design=${variant}`;
}
