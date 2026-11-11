/** Official NH hospital/clinic images, verified 9 November 2026.
 * Missing units deliberately return undefined rather than show another hospital.
 */
export interface DoctorProfileHospitalImage {
  src: string;
  alt: string;
  sourceUrl: string;
}

const hospitalImages: Record<string, DoctorProfileHospitalImage> = {
  "mazumdar shaw medical centre, bangalore": {
    src: "/images/profile-locations/mazumdar-shaw-medical-centre-bommasandra.webp",
    alt: "Mazumdar Shaw Medical Centre, Bangalore",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/mazumdar-shaw-medical-centre-bommasandra",
  },
  "narayana institute of cardiac sciences, bangalore": {
    src: "/images/profile-locations/narayana-institute-cardiac-sciences-bommasandra.webp",
    alt: "Narayana Institute of Cardiac Sciences, Bangalore",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-institute-cardiac-sciences-bommasandra",
  },
  "narayana hospital - banashankari, bangalore": {
    src: "/images/profile-locations/narayana-hospital-banashankari-bangalore.webp",
    alt: "Narayana Hospital - Banashankari, Bangalore",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-hospital-banashankari-bangalore",
  },
  "narayana multispeciality hospital, hsr bangalore": {
    src: "/images/profile-locations/narayana-multispeciality-hospital-hsr-bangalore.webp",
    alt: "Narayana Multispeciality Hospital, HSR Bangalore",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-multispeciality-hospital-hsr-bangalore",
  },
  "narayana health city, international wing": {
    src: "/images/profile-locations/narayana-health-city-international-wing.webp",
    alt: "Narayana Health City, International Wing",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-health-city-international-wing",
  },
  "narayana aarogyam, prestige tech park": {
    src: "/images/profile-locations/narayana-wellness-hub-prestige-tech-park.webp",
    alt: "Narayana Aarogyam, Prestige Tech Park",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-wellness-hub-prestige-tech-park",
  },
  "narayana clinic, chandapura": {
    src: "/images/profile-locations/narayana-clinicchandapura.webp",
    alt: "Narayana Clinic, Chandapura",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinicchandapura",
  },
  "narayana clinic, electronic city": {
    src: "/images/profile-locations/narayana-multispeciality-clinic-electronic-city-niladri-road.webp",
    alt: "Narayana Clinic, Electronic City",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-multispeciality-clinic-electronic-city-niladri-road",
  },
  "narayana clinic, kanakapura road": {
    src: "/images/profile-locations/narayana-clinic-kanakapura.webp",
    alt: "Narayana Clinic, Kanakapura Road",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-kanakapura",
  },
  "narayana clinic, jp nagar": {
    src: "/images/profile-locations/narayana-clinic-jp-nagar.webp",
    alt: "Narayana Clinic, JP Nagar",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-jp-nagar",
  },
  "narayana clinic, harlur road": {
    src: "/images/profile-locations/narayana-clinic-harlur-road.webp",
    alt: "Narayana Clinic, Harlur Road",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-harlur-road",
  },
  "narayana clinic, nagarabhavi": {
    src: "/images/profile-locations/narayana-clinic-nagarabhavi.webp",
    alt: "Narayana Clinic, Nagarabhavi",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-nagarabhavi",
  },
  "narayana clinic, manipal county": {
    src: "/images/profile-locations/narayana-clinic-manipal-county.webp",
    alt: "Narayana Clinic, Manipal County",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-manipal-county",
  },
  "narayana clinic, hsr layout": {
    src: "/images/profile-locations/narayana-clinic-hsr-layout.webp",
    alt: "Narayana Clinic, HSR Layout",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-clinic-hsr-layout",
  },
  "narayana clinic, jayanagar": {
    src: "/images/profile-locations/narayana-multispeciality-clinic-jayanagar.webp",
    alt: "Narayana Clinic, Jayanagar",
    sourceUrl: "https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-multispeciality-clinic-jayanagar",
  },
};

export function getDoctorProfileHospitalImage(hospital: string): DoctorProfileHospitalImage | undefined {
  const key = hospital.trim().toLowerCase().replace(/\s+/g, " ").replace(/bengaluru/g, "bangalore");
  return hospitalImages[key];
}
