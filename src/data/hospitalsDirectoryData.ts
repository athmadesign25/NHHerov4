import { doctorsData, DoctorData } from "./doctors";

export interface HospitalDirectoryItem {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
  beds: string;
  icuBeds: string;
  emergency: string;
  phone: string;
  emergencyPhone: string;
  image: string;
  images: string[];
  accreditations: string[];
  keySpecialities: string[];
  summary: string;
  overview: string;
  amenities: string[];
  isPopular?: boolean;
}

export const HOSPITALS_DIRECTORY_DATA: HospitalDirectoryItem[] = [
  {
    id: "mazumdar-shaw-medical-centre-bangalore",
    slug: "mazumdar-shaw-medical-centre-bangalore",
    name: "Mazumdar Shaw Medical Centre, Bangalore",
    type: "Quaternary Multispeciality Hospital & Comprehensive Cancer Center",
    city: "Bangalore",
    state: "Karnataka",
    address: "258/A, Bommasandra Industrial Area, Hosur Road, Anekal Taluk, Bangalore, Karnataka - 560099",
    beds: "1,400+ Beds",
    icuBeds: "250+ ICU Beds",
    emergency: "24×7 Trauma & Critical Care",
    phone: "080 6926 6140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/KztpC4GYDq70ncLAFLSv.webp",
    images: [
      "/speciality-media/KztpC4GYDq70ncLAFLSv.webp",
      "/assets/hospital_interior_3.jpg",
      "/assets/hospital_exterior_2.jpg",
    ],
    accreditations: ["NABH", "NABL", "JCI Accredited"],
    keySpecialities: ["Medical Oncology", "Surgical Oncology", "Bone Marrow Transplant", "Neurology", "Organ Transplants"],
    summary: "One of India's largest cancer centers and multi-organ transplant hubs with advanced robotics and bone marrow units.",
    overview: "Mazumdar Shaw Medical Centre (MSMC) is Narayana Health's flagship quaternary care facility in Bangalore. Housing one of the world's largest bone marrow transplant units, comprehensive robotic oncology suites, and state-of-the-art neurosurgical facilities, MSMC delivers world-class clinical care at accessible cost.",
    amenities: ["24×7 Emergency & Trauma", "Level 1 Blood Bank", "Modern Cath Labs", "Digital PET-CT & 3T MRI", "Dedicated Bone Marrow Unit", "Helipad & Ambulances", "Cafeteria & International Lounge"],
    isPopular: true,
  },
  {
    id: "narayana-institute-cardiac-sciences-bangalore",
    slug: "narayana-institute-cardiac-sciences-bangalore",
    name: "Narayana Institute of Cardiac Sciences, Bangalore",
    type: "Super-Speciality Heart Hospital",
    city: "Bangalore",
    state: "Karnataka",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Hosur Road, Bangalore, Karnataka - 560099",
    beds: "1,000+ Cardiac Beds",
    icuBeds: "200+ Cardiac ICU Beds",
    emergency: "24×7 Cardiac Emergency & STEMI Network",
    phone: "080 6926 6140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/gjdktEVS3ZedbGj9vxIt.webp",
    images: [
      "/speciality-media/gjdktEVS3ZedbGj9vxIt.webp",
      "/assets/hospital_interior_3.jpg",
      "/assets/hospital_2.png",
    ],
    accreditations: ["NABH", "JCI", "NABL"],
    keySpecialities: ["Adult Cardiac Surgery", "Paediatric Heart Surgery", "Interventional Cardiology", "Heart Transplant", "Electrophysiology"],
    summary: "World-renowned cardiac hospital performing the highest volume of paediatric and adult heart surgeries globally.",
    overview: "Founded by Dr. Devi Prasad Shetty, Narayana Institute of Cardiac Sciences (NICS) is globally recognized for groundbreaking cardiac surgeries, complex heart transplants, artificial hearts (LVADs), and affordable pediatric cardiac interventions.",
    amenities: ["24×7 STEMI Interventional Cath Labs", "16 Dedicated Cardiac Theatres", "Hybrid Cardiac Operating Suite", "Advanced ECMO Support", "Extensive Coronary ICU"],
    isPopular: true,
  },
  {
    id: "narayana-multispeciality-hospital-hsr-bangalore",
    slug: "narayana-multispeciality-hospital-hsr-bangalore",
    name: "Narayana Multispeciality Hospital, HSR Bangalore",
    type: "Multispeciality Tertiary Hospital",
    city: "Bangalore",
    state: "Karnataka",
    address: "Basant Health Centre Building, No-1, 18th Main (Opp. HSR Club), Sector 3, HSR Layout, Bangalore - 560102",
    beds: "120 Beds",
    icuBeds: "30 ICU Beds",
    emergency: "24×7 Emergency Services",
    phone: "080 6926 6140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/aRn89LPQ7p1zMCysRFNO.webp",
    images: [
      "/speciality-media/aRn89LPQ7p1zMCysRFNO.webp",
      "/assets/hospital_interior_1.jpg",
      "/assets/hospital_exterior_1.jpg",
    ],
    accreditations: ["NABH Accredited", "NABL Lab"],
    keySpecialities: ["General Surgery", "Orthopaedics", "Gastroenterology", "Obstetrics & Gynaecology", "Paediatrics"],
    summary: "Neighborhood tertiary multispeciality facility providing rapid acute care, laparoscopy, and family medicine.",
    overview: "Located in the heart of HSR Layout, this hospital caters to South Bangalore with comprehensive medical and surgical care, modern modular operation theatres, intensive care, and specialized outpatient clinics.",
    amenities: ["24×7 Pharmacy & Lab", "Modern Laparoscopic Theatres", "Digital X-Ray & Ultrasound", "Dialysis Center", "Day Care Surgeries"],
    isPopular: false,
  },
  {
    id: "narayana-multispeciality-hospital-whitefield",
    slug: "narayana-multispeciality-hospital-whitefield",
    name: "Narayana Multispeciality Hospital, Whitefield",
    type: "Multispeciality Tertiary Hospital",
    city: "Bangalore",
    state: "Karnataka",
    address: "Plot No. 3 & 4, EPIP Zone, Whitefield, Bangalore, Karnataka - 560066",
    beds: "100 Beds",
    icuBeds: "24 ICU Beds",
    emergency: "24×7 Emergency & Urgent Care",
    phone: "080 6926 6140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/0JYJkQyPXnbIfpfugzxE.webp",
    images: [
      "/speciality-media/0JYJkQyPXnbIfpfugzxE.webp",
      "/assets/hospital_interior_5.jpg",
      "/assets/hospital_exterior_3.jpg",
    ],
    accreditations: ["NABH Accredited"],
    keySpecialities: ["Cardiology", "Orthopaedics", "Neurology", "Gastroenterology", "Pulmonology"],
    summary: "Modern IT-corridor multispeciality hospital offering expert clinical care, diagnostics, and trauma response.",
    overview: "Serving the Whitefield tech hub and surrounding communities, this hospital features round-the-clock emergency support, minimally invasive surgeries, and comprehensive outpatient consulting suites.",
    amenities: ["24×7 Emergency", "Flat-Panel Cath Lab", "Multi-Slice CT Scanner", "Intensive Cardiac Care", "Health Checkup Lounge"],
    isPopular: false,
  },
  {
    id: "rabindranath-tagore-international-institute-kolkata",
    slug: "rabindranath-tagore-international-institute-kolkata",
    name: "Rabindranath Tagore International Institute of Cardiac Sciences (RTIICS)",
    type: "Quaternary Multispeciality Hospital",
    city: "Kolkata",
    state: "West Bengal",
    address: "124, Mukundapur, E.M Bypass, Kolkata, West Bengal - 700099",
    beds: "650+ Beds",
    icuBeds: "150+ ICU Beds",
    emergency: "24×7 Apex Emergency & Chest Pain Center",
    phone: "033 6696 6140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/IZDfHNBQPDDr8xXnifex.webp",
    images: [
      "/speciality-media/IZDfHNBQPDDr8xXnifex.webp",
      "/assets/hospital_interior_2.jpg",
      "/assets/hospital_1.png",
    ],
    accreditations: ["NABH", "NABL", "AACI International"],
    keySpecialities: ["Cardiac Sciences", "Renal Sciences & Transplants", "Neurology & Neurosurgery", "Medical Oncology", "Gastroenterology"],
    summary: "Eastern India's premier quaternary cardiac and organ transplant institute.",
    overview: "RTIICS is one of Eastern India's largest and most trusted hospitals, having performed tens of thousands of complex cardiac surgeries, kidney transplants, and neurosurgical procedures for patients across India, Bangladesh, and Southeast Asia.",
    amenities: ["Advanced Interventional Cath Labs", "Dedicated Transplant ICUs", "3T MRI & 128-Slice CT", "Comprehensive Dialysis Wing", "International Patient Care Desk"],
    isPopular: true,
  },
  {
    id: "srcc-childrens-hospital-mumbai",
    slug: "srcc-childrens-hospital-mumbai",
    name: "SRCC Children's Hospital, Managed by Narayana Health",
    type: "Premier Paediatric Quaternary Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    address: "1-1A, Keshavrao Khadye Marg, Haji Ali, Mahalakshmi, Mumbai, Maharashtra - 400034",
    beds: "207 Paediatric Beds",
    icuBeds: "87 NICU / PICU Beds",
    emergency: "24×7 Dedicated Paediatric Emergency",
    phone: "022 6696 6140",
    emergencyPhone: "1800 309 0309",
    image: "/images/procedures/pediatric_abdomen.jpg",
    images: [
      "/images/procedures/pediatric_abdomen.jpg",
      "/assets/hospital_interior_4.jpg",
      "/assets/hospital_3.png",
    ],
    accreditations: ["NABH Accredited", "NABL Accredited"],
    keySpecialities: ["Paediatric Cardiac Surgery", "Paediatric Neurology & Epilepsy", "Paediatric Oncology", "Neonatal Intensive Care", "Paediatric Orthopaedics"],
    summary: "Western India's landmark tertiary children's hospital with comprehensive pediatric super-specialities.",
    overview: "SRCC Children's Hospital is dedicated entirely to the medical and surgical care of infants, children, and adolescents. Combining warm, child-friendly design with cutting-edge NICU/PICU units and renowned pediatric surgeons.",
    amenities: ["Level 4 NICU & PICU", "Paediatric Cardiac Cath Lab", "Pediatric Bone Marrow Unit", "Child Rehabilitation & Play Zone", "Specialized Neonatal Transport Ambulance"],
    isPopular: true,
  },
  {
    id: "narayana-multispeciality-hospital-jaipur",
    slug: "narayana-multispeciality-hospital-jaipur",
    name: "Narayana Multispeciality Hospital, Jaipur",
    type: "Tertiary Multispeciality Hospital",
    city: "Jaipur",
    state: "Rajasthan",
    address: "Sector 28, Kumbha Marg, Pratap Nagar, Sanganer, Jaipur, Rajasthan - 302033",
    beds: "330 Beds",
    icuBeds: "80 ICU Beds",
    emergency: "24×7 Trauma & Stroke Center",
    phone: "0141 6696 140",
    emergencyPhone: "1800 309 0309",
    image: "/assets/hospital_exterior_1.jpg",
    images: [
      "/assets/hospital_exterior_1.jpg",
      "/assets/hospital_interior_1.jpg",
      "/assets/hospital_1.png",
    ],
    accreditations: ["NABH", "NABL"],
    keySpecialities: ["Cardiology & CTVS", "Nephrology & Urology", "Neurology & Neurosurgery", "Orthopaedics & Joint Replacement", "Critical Care"],
    summary: "Rajasthan's leading center for complex heart surgeries, renal transplants, and emergency trauma care.",
    overview: "Equipped with state-of-the-art medical technology, modular operation theatres, and round-the-clock emergency care, Narayana Jaipur serves patients across Rajasthan, Haryana, and Uttar Pradesh with exemplary clinical outcomes.",
    amenities: ["24×7 Emergency & Cardiac Cath Lab", "Advanced Dialysis Unit", "Neuro-Navigation Suite", "Digital Imaging & MRI", "Blood Bank & Pathology"],
    isPopular: true,
  },
  {
    id: "dharamshila-narayana-superspeciality-hospital-delhi",
    slug: "dharamshila-narayana-superspeciality-hospital-delhi",
    name: "Dharamshila Narayana Superspeciality Hospital, Delhi",
    type: "Superspeciality Hospital & Comprehensive Oncology Center",
    city: "Delhi-NCR",
    state: "New Delhi",
    address: "Vasundhara Enclave, Near New Ashok Nagar Metro Station, New Delhi - 110096",
    beds: "300+ Beds",
    icuBeds: "70 ICU Beds",
    emergency: "24×7 Emergency & Critical Care",
    phone: "011 4306 6140",
    emergencyPhone: "1800 309 0309",
    image: "/assets/hospital_exterior_2.jpg",
    images: [
      "/assets/hospital_exterior_2.jpg",
      "/assets/hospital_interior_2.jpg",
      "/assets/hospital_2.png",
    ],
    accreditations: ["NABH", "NABL"],
    keySpecialities: ["Comprehensive Oncology", "Bone Marrow Transplant", "Cardiac Sciences", "Neurology", "Orthopaedics"],
    summary: "North India's premier oncology and superspeciality hospital with advanced linear accelerators and robotics.",
    overview: "Dharamshila Narayana is a pioneer in cancer treatment in Northern India. Offering precision radiotherapy (Varian TrueBeam), medical oncology, surgical oncology, bone marrow transplants, and multiorgan superspecialities.",
    amenities: ["Varian TrueBeam Linear Accelerator", "Dedicated BMT Suites", "Digital PET-CT Scanner", "24×7 Emergency & Trauma", "State-of-the-art Robotic Surgery Suite"],
    isPopular: true,
  },
  {
    id: "narayana-superspeciality-hospital-gurugram",
    slug: "narayana-superspeciality-hospital-gurugram",
    name: "Narayana Superspeciality Hospital, Gurugram",
    type: "Quaternary Superspeciality Hospital",
    city: "Delhi-NCR",
    state: "Haryana",
    address: "Plot 3201, Block - V, DLF Phase - III, Nathupur, Sector 24, Gurugram, Haryana - 122002",
    beds: "215 Beds",
    icuBeds: "55 ICU Beds",
    emergency: "24×7 Emergency & Stroke Center",
    phone: "0124 6696 140",
    emergencyPhone: "1800 309 0309",
    image: "/assets/hospital_exterior_3.jpg",
    images: [
      "/assets/hospital_exterior_3.jpg",
      "/assets/hospital_interior_5.jpg",
      "/assets/hospital_3.png",
    ],
    accreditations: ["NABH Accredited", "NABL Certified"],
    keySpecialities: ["Cardiac Sciences", "Neurosciences", "Orthopaedics & Sports Medicine", "Renal Sciences", "Critical Care"],
    summary: "State-of-the-art quaternary care center serving Gurugram and the NCR with advanced surgical robotics.",
    overview: "Conveniently situated in DLF Phase 3, this hospital delivers international standards of patient care with advanced cardiac cath labs, 3D neuro-navigation, sports medicine, and intensive critical care.",
    amenities: ["Digital Cath Lab", "3.0 Tesla MRI & CT", "Endosuite Modular OTs", "24×7 Trauma Care", "International Patient Lounge"],
    isPopular: false,
  },
  {
    id: "narayana-multispeciality-hospital-mysore",
    slug: "narayana-multispeciality-hospital-mysore",
    name: "Narayana Multispeciality Hospital, Mysore",
    type: "Tertiary Multispeciality Hospital",
    city: "Mysore",
    state: "Karnataka",
    address: "CA-H/2, L&T South City, Ring Road, Dattagalli 3rd Stage, Mysore, Karnataka - 570022",
    beds: "250 Beds",
    icuBeds: "50 ICU Beds",
    emergency: "24×7 Emergency & Cardiac Unit",
    phone: "0821 6696 140",
    emergencyPhone: "1800 309 0309",
    image: "/speciality-media/X9LPjGaxsejoIT5Aracu.webp",
    images: [
      "/speciality-media/X9LPjGaxsejoIT5Aracu.webp",
      "/assets/hospital_interior_4.jpg",
      "/assets/hospital_3.png",
    ],
    accreditations: ["NABH Accredited"],
    keySpecialities: ["Cardiology & Heart Surgery", "Nephrology & Dialysis", "Neurology & Neurosurgery", "Orthopaedics", "Emergency Medicine"],
    summary: "Heritage city's premier tertiary center for cardiology, complex trauma, and kidney care.",
    overview: "Providing comprehensive high-quality healthcare across Southern Karnataka, Narayana Hospital Mysore brings senior medical specialists, cardiac interventions, and surgical expertise right to the city.",
    amenities: ["24×7 Emergency Trauma Care", "Cardiac Cath Lab", "Advanced Dialysis Center", "Digital Radiology & Ultrasound", "Fully Stocked 24×7 Pharmacy"],
    isPopular: false,
  },
];

export interface HospitalDetailData {
  slug: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
  beds: string;
  icuBeds: string;
  emergency: string;
  phone: string;
  emergencyPhone: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  leadParagraph: string;
  images: string[];
  accreditations: string[];
  metrics: {
    beds: string;
    icu: string;
    emergency: string;
    accreditation: string;
  };
  toc: { id: string; label: string }[];
  keySpecialities: string[];
  amenities: string[];
  doctors: { name: string; designation: string; experience: string; hospital: string; image: string; speciality: string }[];
  faqs: { q: string; a: string }[];
}

export function getHospitalDetailData(slug: string): HospitalDetailData {
  const match = HOSPITALS_DIRECTORY_DATA.find((h) => h.slug === slug) || HOSPITALS_DIRECTORY_DATA[0];

  const matchedDocs = doctorsData.filter((d: DoctorData) =>
    d.hospital.toLowerCase().includes(match.city.toLowerCase()) ||
    d.location.toLowerCase().includes(match.city.toLowerCase())
  ).slice(0, 3);

  const fallbackDocs = matchedDocs.length > 0 ? matchedDocs : doctorsData.slice(0, 3);

  const doctors = fallbackDocs.map((d: DoctorData) => ({
    name: d.name,
    designation: `Senior Consultant - ${d.speciality}`,
    experience: "15+ Years",
    hospital: match.name,
    image: d.photo,
    speciality: d.speciality,
  }));

  return {
    slug: match.slug,
    name: match.name,
    type: match.type,
    city: match.city,
    state: match.state,
    address: match.address,
    beds: match.beds,
    icuBeds: match.icuBeds,
    emergency: match.emergency,
    phone: match.phone,
    emergencyPhone: match.emergencyPhone,
    heroImage: match.image,
    heroTitle: match.name,
    heroSubtitle: `${match.type} in ${match.city}, ${match.state}`,
    leadParagraph: match.overview,
    images: match.images,
    accreditations: match.accreditations,
    metrics: {
      beds: match.beds,
      icu: match.icuBeds,
      emergency: "24×7 Available",
      accreditation: match.accreditations.join(" & "),
    },
    toc: [
      { id: "overview", label: "Hospital Overview" },
      { id: "specialities", label: "Centers of Excellence" },
      { id: "facilities", label: "Infrastructure & Amenities" },
      { id: "specialists", label: "Senior Doctors" },
      { id: "contact-location", label: "Address & Emergency Contact" },
      { id: "faqs", label: "Frequently Asked Questions" },
    ],
    keySpecialities: match.keySpecialities,
    amenities: match.amenities,
    doctors: doctors,
    faqs: [
      {
        q: `How do I book an OPD appointment at ${match.name}?`,
        a: `You can book an in-person or video consultation online via our website or by calling our central appointment desk at ${match.phone}. Walk-in registrations are also accommodated at our OPD front desk.`,
      },
      {
        q: `Are 24×7 emergency and ambulance services available?`,
        a: `Yes, ${match.name} operates a full-service 24×7 emergency department equipped with ACLS ambulances, trauma specialists, and on-call interventional teams. Call ${match.emergencyPhone} for emergency ambulance dispatch.`,
      },
      {
        q: `Does ${match.name} accept health insurance cashless claims?`,
        a: `Yes, we are empanelled with all major government and private insurance providers, TPAs, and corporate health policies. Our dedicated insurance helpdesk assists you with instant cashless pre-authorization.`,
      },
      {
        q: `What facilities are available for international patients?`,
        a: `We provide dedicated international patient coordinators who assist with medical visas, airport transfers, foreign language interpreters, cost estimates, and comfortable accommodation booking nearby.`,
      },
    ],
  };
}
