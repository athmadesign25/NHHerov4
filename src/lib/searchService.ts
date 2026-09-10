export interface DoctorSearchItem {
  id: string | number;
  name: string;
  speciality: string;
  hospital: string;
  location?: string;
  experience?: string;
  rating?: number;
  photo?: string;
  availability: {
    hospital?: string;
    video?: string;
  };
}

export interface SpecialitySearchItem {
  id: string;
  name: string;
  count?: number;
  icon?: string;
}

export interface TreatmentSearchItem {
  id: string;
  name: string;
  speciality: string;
}

export interface HealthcareSearchResults {
  doctors: DoctorSearchItem[];
  specialities: SpecialitySearchItem[];
  treatments: TreatmentSearchItem[];
}

const DOCTORS_DATA: DoctorSearchItem[] = [
  {
    id: "doc-1",
    name: "Dr. Ravi Prakash",
    speciality: "Cardiology",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    location: "Bengaluru",
    experience: "18+ Years",
    rating: 4.9,
    photo: "/assets/doctor_1.png",
    availability: { hospital: "Available Today", video: "Available Tomorrow" }
  },
  {
    id: "doc-2",
    name: "Dr. Ravi Kumar",
    speciality: "Cardiology",
    hospital: "Narayana Superspeciality Hospital, Guwahati",
    location: "Guwahati",
    experience: "14+ Years",
    rating: 4.8,
    photo: "/assets/doctor_2.png",
    availability: { hospital: "Available Today", video: "Not Available" }
  },
  {
    id: "doc-3",
    name: "Dr. Ravi Shankar",
    speciality: "Neurology",
    hospital: "NH Children's Hospital, Mumbai",
    location: "Mumbai",
    experience: "16+ Years",
    rating: 4.9,
    photo: "/assets/doctor_3.png",
    availability: { hospital: "Available Today", video: "Available Today" }
  },
  {
    id: "doc-4",
    name: "Dr. Prakash Sharma",
    speciality: "Cardiology",
    hospital: "Narayana Multispeciality Hospital, HSR Bangalore",
    location: "Bengaluru",
    experience: "20+ Years",
    rating: 4.9,
    photo: "/assets/doctor_1.png",
    availability: { hospital: "Available Today", video: "Available Tomorrow" }
  },
  {
    id: "doc-5",
    name: "Dr. Prakash Gupta",
    speciality: "Orthopaedics",
    hospital: "Narayana Superspeciality Hospital, Howrah, Kolkata",
    location: "Kolkata",
    experience: "12+ Years",
    rating: 4.7,
    photo: "/assets/doctor_2.png",
    availability: { hospital: "Available Today", video: "Not Available" }
  },
  {
    id: "doc-6",
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    hospital: "NH Children's Hospital, Mumbai",
    location: "Mumbai",
    experience: "15+ Years",
    rating: 4.8,
    photo: "/assets/doctor_1.png",
    availability: { hospital: "Available Today", video: "Available Today" }
  },
  {
    id: "doc-7",
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    hospital: "Narayana Multispeciality Hospital, Barasat, Kolkata",
    location: "Kolkata",
    experience: "17+ Years",
    rating: 4.9,
    photo: "/assets/doctor_2.png",
    availability: { hospital: "Available Today", video: "Available Today" }
  }
];

const SPECIALITIES_DATA: SpecialitySearchItem[] = [
  { id: "spec-cardio", name: "Cardiology", count: 48, icon: "Heart" },
  { id: "spec-neuro", name: "Neurology", count: 32, icon: "Brain" },
  { id: "spec-ortho", name: "Orthopaedics", count: 41, icon: "Activity" },
  { id: "spec-onco", name: "Oncology", count: 29, icon: "Sparkles" },
  { id: "spec-gastro", name: "Gastroenterology", count: 25, icon: "Stethoscope" },
  { id: "spec-paed", name: "Paediatrics", count: 37, icon: "Heart" }
];

const TREATMENTS_DATA: TreatmentSearchItem[] = [
  { id: "treat-1", name: "Coronary Angioplasty", speciality: "Cardiology" },
  { id: "treat-2", name: "Heart Bypass Surgery (CABG)", speciality: "Cardiology" },
  { id: "treat-3", name: "Knee Replacement Surgery", speciality: "Orthopaedics" },
  { id: "treat-4", name: "Brain Tumor Resection", speciality: "Neurology" },
  { id: "treat-5", name: "Chemotherapy & Immunotherapy", speciality: "Oncology" },
  { id: "treat-6", name: "Spine Fusion & Decompression", speciality: "Orthopaedics" }
];

export async function searchHealthcare(
  query: string,
  _filter?: any
): Promise<HealthcareSearchResults> {
  const normalized = (query || "").trim().toLowerCase();

  if (!normalized) {
    return {
      doctors: DOCTORS_DATA,
      specialities: SPECIALITIES_DATA,
      treatments: TREATMENTS_DATA
    };
  }

  const matchingDoctors = DOCTORS_DATA.filter(
    (d) =>
      d.name.toLowerCase().includes(normalized) ||
      d.speciality.toLowerCase().includes(normalized) ||
      d.hospital.toLowerCase().includes(normalized) ||
      (d.location && d.location.toLowerCase().includes(normalized))
  );

  const matchingSpecialities = SPECIALITIES_DATA.filter((s) =>
    s.name.toLowerCase().includes(normalized)
  );

  const matchingTreatments = TREATMENTS_DATA.filter(
    (t) =>
      t.name.toLowerCase().includes(normalized) ||
      t.speciality.toLowerCase().includes(normalized)
  );

  return {
    doctors: matchingDoctors,
    specialities: matchingSpecialities,
    treatments: matchingTreatments
  };
}
