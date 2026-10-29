import { design3CityDoctors } from "./design3CityDoctors";

interface HospitalPreview {
  distanceKm: number;
  city?: string;
  directionsUrl?: string;
  directionsDestination?: string;
}

interface RealHospital {
  id: string;
  city: string;
  destination: string;
}

// POI names/localities from NH's official hospital pages and their Maps links.
// https://www.narayanahealth.org/hospitals-clinics/bangalore/mazumdar-shaw-medical-centre-bommasandra
// https://www.narayanahealth.org/hospitals-clinics/mumbai/srcc-childrens-hospital
// Additional exact unit names from the verified featured clinicians' profiles:
// https://www.narayanahealth.org/c/bangalore/cardiac-surgery-adult/dr-devi-prasad-shetty
// https://www.narayanahealth.org/c/bangalore/paediatric-surgery/dr-ashley-lucien-joseph-d-cruz
// Keep street numbers out: Maps may otherwise select the street address instead
// of the named hospital, even when the hospital name precedes that address.
// The kilometres are deliberately seeded stakeholder-preview data, not routes.
const healthCity: RealHospital = {
  id: "nh-health-city-bommasandra",
  city: "Bangalore",
  destination: "Narayana Health City, Bommasandra, Bengaluru",
};
const realHospitals = new Map<string, RealHospital>([
  ["Narayana Health City", healthCity],
  ["Narayana Health City, Bangalore", healthCity],
  ["Mazumdar Shaw Medical Centre, Bangalore", {
    id: "mazumdar-shaw-bommasandra",
    city: "Bangalore",
    destination: "Mazumdar Shaw Medical Center, Bommasandra, Bengaluru",
  }],
  ["Narayana Institute of Cardiac Sciences, Bangalore", {
    id: "narayana-institute-cardiac-sciences-bangalore",
    city: "Bangalore",
    destination: "Narayana Institute of Cardiac Sciences, Bangalore",
  }],
  ["Narayana Multispeciality Hospital, HSR Bangalore", {
    id: "narayana-multispeciality-hsr-bangalore",
    city: "Bangalore",
    destination: "Narayana Multispeciality Hospital, HSR Bangalore",
  }],
  ["SRCC Children's Hospital, Mumbai", {
    id: "srcc-childrens-haji-ali",
    city: "Mumbai",
    destination: "Narayana Health SRCC Children's Hospital, Haji Ali, Mumbai",
  }],
]);
const fictionalHospitals = new Map(design3CityDoctors.flatMap(doctor =>
  [doctor.hospital, ...(doctor.hospitals ?? [])].map(hospital => [hospital, doctor.city] as const),
));

function sampleDistance(unitId: string): number {
  let hash = 0;
  for (const letter of unitId) hash = (Math.imul(hash, 31) + letter.charCodeAt(0)) >>> 0;
  return (20 + hash % 190) / 10;
}

/** Stable sample kilometres per unit; fictional units demonstrate the Health City route. */
export function getDesign16HospitalPreview(hospital: string): HospitalPreview | null {
  const real = realHospitals.get(hospital);
  if (real) return {
    distanceKm: sampleDistance(real.id),
    city: real.city,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(real.destination)}`,
    directionsDestination: real.destination,
  };
  const city = fictionalHospitals.get(hospital);
  return city ? {
    distanceKm: sampleDistance(hospital),
    city,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(healthCity.destination)}`,
    directionsDestination: healthCity.destination,
  } : null;
}
