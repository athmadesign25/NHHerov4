export interface HospitalItem {
  id: string;
  name: string;
  address: string;
  image: string;
  images?: string[];
  href: string;
  appointmentHref: string;
  phone: string;
}

export const HOSPITALS_DATA: HospitalItem[] = [
  {
    id: "hosp-1",
    name: "Mazumdar Shaw Medical Centre, Bangalore",
    address: "258/A, Bommasandra Industrial Area, Hosur Road, Anekal Taluk Bangalore, Karnataka - 560099",
    image: "/speciality-media/KztpC4GYDq70ncLAFLSv.webp",
    images: [
      "/speciality-media/KztpC4GYDq70ncLAFLSv.webp",
      "/assets/hospital_interior_3.jpg",
      "/assets/hospital_exterior_2.jpg",
    ],
    href: "/hospitals-clinics/bangalore/mazumdar-shaw-medical-centre-bommasandra",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=38",
    phone: "08069266140",
  },
  {
    id: "hosp-2",
    name: "Narayana Multispeciality Hospital, HSR Bangalore",
    address: "Basant Health Centre Building, No-1, 18th main (Opp.HSR Club), Sector 3, HSR Layout Bangalore, Karnataka - 560102",
    image: "/speciality-media/aRn89LPQ7p1zMCysRFNO.webp",
    images: [
      "/speciality-media/aRn89LPQ7p1zMCysRFNO.webp",
      "/assets/hospital_interior_1.jpg",
      "/assets/hospital_exterior_1.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-multispeciality-hospital-hsr-bangalore",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=32",
    phone: "08069266140",
  },
  {
    id: "hosp-3",
    name: "Narayana Clinic, Chandapura",
    address: "1st Floor, 425/426, Chandapura- Anekal Rd, near Surya City, above Pizza hut, Iggalur, Suryanagar Phase I, Chandapura, Bengaluru, Andapura, Karnataka 560081",
    image: "/speciality-media/X9LPjGaxsejoIT5Aracu.webp",
    images: [
      "/speciality-media/X9LPjGaxsejoIT5Aracu.webp",
      "/assets/hospital_interior_4.jpg",
      "/assets/hospital_3.png",
    ],
    href: "/hospitals-clinics/bangalore/narayana-clinicchandapura",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1518",
    phone: "08069266140",
  },
  {
    id: "hosp-4",
    name: "Narayana Clinic, Kanakapura Road",
    address: "P.N.Towers, Site No.04, Narayana Nagar, Kanakapura Main Rd, Doddakallasandra, Uttarahalli Hobli, Bengaluru, Karnataka 560062",
    image: "/speciality-media/0JYJkQyPXnbIfpfugzxE.webp",
    images: [
      "/speciality-media/0JYJkQyPXnbIfpfugzxE.webp",
      "/assets/hospital_interior_5.jpg",
      "/assets/hospital_exterior_3.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-clinic-kanakapura",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1810",
    phone: "08069266140",
  },
  {
    id: "hosp-5",
    name: "Narayana Health City, International Wing",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Hosur Road Bangalore, Karnataka - 560099",
    image: "/speciality-media/IZDfHNBQPDDr8xXnifex.webp",
    images: [
      "/speciality-media/IZDfHNBQPDDr8xXnifex.webp",
      "/assets/hospital_interior_2.jpg",
      "/assets/hospital_1.png",
    ],
    href: "/hospitals-clinics/bangalore/narayana-health-city-international-wing",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=55",
    phone: "08069266140",
  },
  {
    id: "hosp-6",
    name: "Narayana Institute of Cardiac Sciences, Bangalore",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Hosur Road Bangalore, Karnataka - 560099",
    image: "/speciality-media/gjdktEVS3ZedbGj9vxIt.webp",
    images: [
      "/speciality-media/gjdktEVS3ZedbGj9vxIt.webp",
      "/assets/hospital_interior_3.jpg",
      "/assets/hospital_2.png",
    ],
    href: "/hospitals-clinics/bangalore/narayana-institute-cardiac-sciences-bommasandra",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=121",
    phone: "08069266140",
  },
  {
    id: "hosp-7",
    name: "Narayana Clinic, HSR Layout",
    address: "459, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
    image: "/speciality-media/7VLUoOV5XveF032qbL1b.webp",
    images: [
      "/speciality-media/7VLUoOV5XveF032qbL1b.webp",
      "/assets/hospital_interior_4.jpg",
      "/assets/hospital_exterior_3.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-clinic-hsr-layout",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1413",
    phone: "08069266140",
  },
  {
    id: "hosp-8",
    name: "Narayana Clinic, Electronic City",
    address: "E-City 1 (Velankani): Shop No. 5,6,7 SJR Equinox Retail, Opp. Gate No. 3 Velankani Information Systems Pvt. Ltd Electronic City Phase – 1, Karnataka - 560100",
    image: "/speciality-media/IpzMkJGpvFtxTOr7yPAD.webp",
    images: [
      "/speciality-media/IpzMkJGpvFtxTOr7yPAD.webp",
      "/assets/hospital_interior_1.jpg",
      "/assets/hospital_exterior_2.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-multispeciality-clinic-electronic-city-niladri-road",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1134",
    phone: "08069266140",
  },
  {
    id: "hosp-9",
    name: "Narayana Clinic, Sarjapur",
    address: "Above HDFC Bank, 83/3 Doddakannelli, Sarjapura Main Road Bangalore, Karnataka - 560035",
    image: "/speciality-media/lKw02W7fec1ULE3NFBcN.webp",
    images: [
      "/speciality-media/lKw02W7fec1ULE3NFBcN.webp",
      "/assets/hospital_interior_5.jpg",
      "/assets/hospital_3.png",
    ],
    href: "/hospitals-clinics/bangalore/narayana-multispeciality-clinic-sarjapura",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1137",
    phone: "08069266140",
  },
  {
    id: "hosp-10",
    name: "Narayana Clinic, JP Nagar",
    address: "734, 5th Main Rd, Sarakki Industrial Layout, 3rd Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
    image: "/speciality-media/JK9SNJbsNOCWIFrsyV6T.webp",
    images: [
      "/speciality-media/JK9SNJbsNOCWIFrsyV6T.webp",
      "/assets/hospital_interior_2.jpg",
      "/assets/hospital_exterior_1.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-clinic-jp-nagar",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1729",
    phone: "08069266140",
  },
  {
    id: "hosp-11",
    name: "Narayana Clinic, Harlur Road",
    address: "1st Floor, Haralur Main Rd, below Cult Fit, HSR Extension, Reliable Residency Layout Phase 3, Reliable Tranquil Layout, HSR Layout, Bengaluru, Karnataka 560102",
    image: "/speciality-media/mx1SGnI99gMCzaw2P2HM.webp",
    images: [
      "/speciality-media/mx1SGnI99gMCzaw2P2HM.webp",
      "/assets/hospital_interior_4.jpg",
      "/assets/hospital_1.png",
    ],
    href: "/hospitals-clinics/bangalore/narayana-clinic-harlur-road",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1350",
    phone: "08069266140",
  },
  {
    id: "hosp-12",
    name: "Narayana Clinic, Jayanagar",
    address: "1st Floor, Uday House, Opposite Jain temple 4th Block, Jayanagar Bangalore, Karnataka - 560011",
    image: "/speciality-media/QiHPO9fJ1zysLG0voLsT.webp",
    images: [
      "/speciality-media/QiHPO9fJ1zysLG0voLsT.webp",
      "/assets/hospital_interior_1.jpg",
      "/assets/hospital_exterior_2.jpg",
    ],
    href: "/hospitals-clinics/bangalore/narayana-multispeciality-clinic-jayanagar",
    appointmentHref: "/ocaapp/doctors/bangalore?hospital=1139",
    phone: "08069266140",
  },
];
