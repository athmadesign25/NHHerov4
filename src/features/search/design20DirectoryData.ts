/** Official NH directory snapshot captured 2026-10-28. See docs/design20-directory-provenance.md. */
export interface Design20VerifiedDoctor {
  id: string;
  name: string;
  designation: string;
  specialties: string[];
  qualifications: string;
  expertise: string[];
  hospitals: string[];
  imageUrl: string | null;
  imagePath?: string;
  experienceYears: number | null;
  experienceLabel: string | null;
  languages?: string[];
  sourceUrl: string;
  profileUrl?: string;
  profileVerified?: boolean;
  moreHospitals?: string;
  sampledForUnits: string[];
}

export interface Design20VerifiedUnit {
  id: string;
  name: string;
  sampledDoctorIds: string[];
  availableCount?: number;
  note?: string;
}

export const design20DirectorySource: { source: string; capturedAt: string; units: Design20VerifiedUnit[]; doctors: Design20VerifiedDoctor[] } = {
  "source": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
  "capturedAt": "2026-10-28",
  "units": [
    {
      "id": "38",
      "name": "Mazumdar Shaw Medical Centre, Bangalore",
      "sampledDoctorIds": [
        "dr-abhinandan-s-punit",
        "dr-abhishek-s",
        "dr-aditi-rao",
        "dr-akash-j",
        "dr-akhila-vasanth-hassan",
        "dr-akshay-nayak"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1537",
      "name": "Narayana Aarogyam, Prestige Tech Park",
      "sampledDoctorIds": [
        "dr-kommidi-kavitha-reddy",
        "dr-n-mahesh-kumar",
        "dr-nihal-rai-b",
        "dr-sai-thanmaya-sugali",
        "dr-sanjay-mehrotra",
        "dr-satish-k"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1518",
      "name": "Narayana Clinic, Chandapura",
      "sampledDoctorIds": [
        "dr-aarti-sunil-kamath",
        "dr-aishwarya-john",
        "dr-akash-j",
        "dr-arinana-joji-babu",
        "dr-aruna-bhat",
        "dr-ashwini-a-sagar"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1134",
      "name": "Narayana Clinic, Electronic City",
      "sampledDoctorIds": [
        "dr-aarti-sunil-kamath",
        "dr-abhilasha-somashekhar",
        "dr-abhinandan-s-punit",
        "dr-aditi-rao",
        "dr-aishwarya-john",
        "dr-akash-j"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1350",
      "name": "Narayana Clinic, Harlur Road",
      "sampledDoctorIds": [
        "dr-abbu-j",
        "dr-abhishek-g-p",
        "dr-amrita-himalayani",
        "dr-b-sri-sai-deepthi",
        "dr-dasarapu-lohith",
        "dr-hiremath-sagar"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1413",
      "name": "Narayana Clinic, HSR Layout",
      "sampledDoctorIds": [
        "dr-abhinandan-s-punit",
        "dr-abhishek-g-p",
        "dr-aditi-singhvi",
        "dr-akshay-nayak",
        "dr-amarnath-reddy",
        "dr-amrita-himalayani"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1139",
      "name": "Narayana Clinic, Jayanagar",
      "sampledDoctorIds": [
        "dr-aditya-h-kumar",
        "dr-angad-s-krishnan",
        "dr-darshan-b-n",
        "dr-deepthi-laldayal",
        "dr-deepu-k-hebbar",
        "dr-divya-s-k"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1729",
      "name": "Narayana Clinic, JP Nagar",
      "sampledDoctorIds": [
        "dr-abida-tabassum",
        "dr-akkamahadevi-dhotrad",
        "dr-amol-a-ashtekar",
        "dr-arunkumar-ullegaddi",
        "dr-bhavishya-shetty",
        "dr-darshan-b-n"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1810",
      "name": "Narayana Clinic, Kanakapura Road",
      "sampledDoctorIds": [
        "dr-abhinandan-s-punit",
        "dr-buddiga-lakshmi-swetha",
        "dr-impashree-c-m",
        "dr-kavya-j",
        "dr-komal-prasad",
        "dr-manidipa-majumdar"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1272",
      "name": "Narayana Clinic, Manipal County",
      "sampledDoctorIds": [
        "dr-abhishek-r",
        "dr-aishwarya-john",
        "dr-akshay-b-k",
        "dr-akshay-nayak",
        "dr-anirudh-j-shetty",
        "dr-arunkumar-ullegaddi"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1999",
      "name": "Narayana Clinic, Nagarabhavi",
      "sampledDoctorIds": [
        "dr-anurag-ranjan",
        "dr-ashitha-s-r",
        "dr-geethashree-h-c",
        "dr-kavya-j",
        "dr-manidipa-majumdar",
        "dr-manjunath-m"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1137",
      "name": "Narayana Clinic, Sarjapur",
      "sampledDoctorIds": [
        "dr-abhishek-r",
        "dr-akshay-nayak",
        "dr-anindita-bhattacharya",
        "dr-barendra-kumar-raut",
        "dr-g-mohan",
        "dr-himali-shah"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "55",
      "name": "Narayana Health City, International Wing",
      "sampledDoctorIds": [
        "dr-parimala-p-nath",
        "dr-rohit-raghunath-ranade",
        "dr-sanjay-rao",
        "dr-santosh-k-m",
        "dr-sapna-raina",
        "dr-sheethal-n-kumar"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "1974",
      "name": "Narayana Hospital - Banashankari, Bangalore",
      "sampledDoctorIds": [
        "dr-anusha-sharma-p-s",
        "dr-deepthi-laldayal",
        "dr-g-c-chidananda",
        "dr-harshavardhana-k-n",
        "dr-jayant-mulchandani",
        "dr-jayasree-b"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "121",
      "name": "Narayana Institute of Cardiac Sciences, Bangalore",
      "sampledDoctorIds": [
        "dr-aditi-singhvi",
        "dr-anirudh-j-shetty",
        "dr-anup-charles-s",
        "dr-arunkumar-ullegaddi",
        "dr-atul-surendra-prabhu",
        "dr-bagirath-raghuraman"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    },
    {
      "id": "32",
      "name": "Narayana Multispeciality Hospital, HSR Bangalore",
      "sampledDoctorIds": [
        "dr-abhinav-malhotra",
        "dr-adarsh-babu-k",
        "dr-adithya-shetty",
        "dr-akshay-shetty-t",
        "dr-akshita-singh",
        "dr-amarnath-reddy"
      ],
      "note": "First six individual doctor cards in this unit filter. Team entry excluded."
    }
  ],
  "doctors": [
    {
      "designation": "Senior Consultant & Clinical Lead",
      "experienceLabel": "17 years in practice",
      "experienceYears": 17,
      "expertise": [
        "Orthopaedic Surgery",
        "Robotic Orthopaedic Surgery",
        "Joint Replacement"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Kanakapura Road",
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/August2024/zifj4j8y5wf5qVzl53gl.webp",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Abhinandan S Punit",
      "qualifications": "MBBS, DNB (Orthopaedics), D-ortho (Exercise & Sport Sciences), MS (Orthopaedics), MCh (Orthopaedics), Fellowship (Robotic Joint Replacement and Sports Medicine), Fellowship (Orthopaedics), Fellowship (Orthopaedics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-abhinandan-s-punit",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, HSR Layout",
        "Narayana Clinic, Kanakapura Road"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/orthopaedics-and-joint-replacement/dr-abhinandan-s-punit",
      "imagePath": "/images/doctors/d20-real/dr-abhinandan-s-punit-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Critical Care Medicine",
        "Adult Critical Care"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/June2026/VJw7DbBntgRObkM9j3uC.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abhishek S",
      "qualifications": "MBBS, MD (Anaesthesiology), Fellowship (Critical Care Medicine), Fellowship (Critical Care Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Critical Care Medicine"
      ],
      "id": "dr-abhishek-s",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/critical-care-medicine/dr-abhishek-s",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-abhishek-s-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Medical Gastroenterology"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Electronic City"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/j4JOZOkV3nm2E8R1pNEJ.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Aditi Rao",
      "qualifications": "MBBS, MD (General Medicine), DM (Gastroenterology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Medical Gastroenterology"
      ],
      "id": "dr-aditi-rao",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Electronic City"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/medical-gastroenterology/dr-aditi-rao",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-aditi-rao-profile.webp"
    },
    {
      "designation": "Junior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Interventional Neurology"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Chandapura",
        "Narayana Clinic, Electronic City"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/veHQwH0s6IR2hweXeFWj.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Akash J",
      "qualifications": "MBBS, MD (General Medicine), DM (Neurology), Fellowship (Interventional Neurology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Interventional Neurology"
      ],
      "id": "dr-akash-j",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Chandapura",
        "Narayana Clinic, Electronic City"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/interventional-neurology-neurology/dr-akash-j",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-akash-j-profile.webp"
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": "12 years in practice",
      "experienceYears": 12,
      "expertise": [
        "Paediatric Nephrology",
        "Transplant Nephrology"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2024/GQ4Rf4fjbA3E64glZMts.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Akhila Vasanth Hassan",
      "qualifications": "MBBS, DCH (Paediatrics), MRCPCH (Paediatrics & Child Health)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Nephrology"
      ],
      "id": "dr-akhila-vasanth-hassan",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/paediatric-nephrology/dr-akhila-vasanth-hassan",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-akhila-vasanth-hassan-profile.webp"
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Sarjapur",
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/December2025/GyViPEKbqKcntrmy78Te.webp",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Akshay Nayak",
      "qualifications": "MBBS, DNB (Orthopaedics), MS (Orthopaedics), Fellowship (Robotic Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-akshay-nayak",
      "sampledForUnits": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, HSR Layout",
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, Sarjapur"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/orthopaedics-and-joint-replacement/dr-akshay-nayak",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-akshay-nayak-profile.webp"
    },
    {
      "designation": "Attending Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine"
      ],
      "hospitals": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Kommidi Kavitha Reddy",
      "qualifications": "MD (Physician)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-kommidi-kavitha-reddy",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/general-medicine/dr-kommidi-kavitha-reddy",
      "profileVerified": true,
      "imagePath": ""
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery",
        "Arthroscopy"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road",
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/KsymoA7kkPskkYQgm1bw.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. N Mahesh Kumar",
      "qualifications": "MBBS, DNB (Orthopaedic Surgery), Fellowship (Arthroscopy, Sports Medicine & Cartilage Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-n-mahesh-kumar",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/orthopaedic-surgery/dr-n-mahesh-kumar",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-n-mahesh-kumar-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Dermatology",
        "Dermatology & Cosmetology"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout",
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/SySOhUfc1tbbF9VSf776.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Nihal Rai B",
      "qualifications": "MBBS, MD (Dermatology Venereology & Leprosy)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Dermatology"
      ],
      "id": "dr-nihal-rai-b",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/dermatology/dr-nihal-rai-b",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-nihal-rai-b-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine"
      ],
      "hospitals": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/dWlwyxXwqWMTtUgIglua.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Sai Thanmaya Sugali",
      "qualifications": "MBBS, MD (General Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-sai-thanmaya-sugali",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/general-medicine/dr-sai-thanmaya-sugali",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-sai-thanmaya-sugali-profile.webp"
    },
    {
      "designation": "Senior Consultant, Director - Cath Lab Services",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Interventional Cardiology",
        "Structural Heart Intervention"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, HSR Layout",
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/February2024/TXK0LNt5jwhPG6QJOrhR.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Sanjay Mehrotra",
      "qualifications": "MBBS, MD (General Medicine), DM (Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-sanjay-mehrotra",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/cardiology-adult/dr-sanjay-mehrotra",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-sanjay-mehrotra-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine"
      ],
      "hospitals": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/PJ1gUuKMKFPDkmbHkp9K.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Satish K",
      "qualifications": "MBBS, DCH (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-satish-k",
      "sampledForUnits": [
        "Narayana Aarogyam, Prestige Tech Park"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/paediatric-medicine/dr-satish-k",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-satish-k-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine",
        "Diabetology"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, Chandapura"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/gZbql8h5fEOFAUhUO4PF.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Aarti Sunil Kamath",
      "qualifications": "MBBS, DNB (General Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-aarti-sunil-kamath",
      "sampledForUnits": [
        "Narayana Clinic, Chandapura",
        "Narayana Clinic, Electronic City"
      ],
      "imagePath": "/images/doctors/d20-real/dr-aarti-sunil-kamath.webp"
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Psychiatry"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, Chandapura"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/3o7bM6zZX2zAmGCTCPY3.jpg",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Aishwarya John",
      "qualifications": "MBBS, MD (Psychiatry)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Psychiatry"
      ],
      "id": "dr-aishwarya-john",
      "sampledForUnits": [
        "Narayana Clinic, Chandapura",
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, Manipal County"
      ],
      "imagePath": "/images/doctors/d20-real/dr-aishwarya-john.jpg"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, Chandapura"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/qvaX0zjceJOr5UZ2ku42.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Arinana Joji Babu",
      "qualifications": "MBBS, DCH (Child Health)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-arinana-joji-babu",
      "sampledForUnits": [
        "Narayana Clinic, Chandapura"
      ],
      "imagePath": "/images/doctors/d20-real/dr-arinana-joji-babu.webp"
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Clinical Immunology & Rheumatology"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Chandapura"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2024/Gvk9PdwXeTqC4cjomt0V.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Aruna Bhat",
      "qualifications": "MBBS, DCH (Paediatrics), MRCPCH (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Clinical Immunology & Rheumatology"
      ],
      "id": "dr-aruna-bhat",
      "sampledForUnits": [
        "Narayana Clinic, Chandapura"
      ],
      "imagePath": "/images/doctors/d20-real/dr-aruna-bhat.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine",
        "Diabetology"
      ],
      "hospitals": [
        "Narayana Clinic, Chandapura"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Ashwini A Sagar",
      "qualifications": "MBBS, MD (General Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-ashwini-a-sagar",
      "sampledForUnits": [
        "Narayana Clinic, Chandapura"
      ],
      "imagePath": ""
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "E.N.T"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abhilasha Somashekhar",
      "qualifications": "MBBS, MS (E.N.T), Fellowship (Paediatric E.N.T)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "E.N.T"
      ],
      "id": "dr-abhilasha-somashekhar",
      "sampledForUnits": [
        "Narayana Clinic, Electronic City"
      ],
      "imagePath": ""
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Radiology",
        "Ultrasonology"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/IkMI1BFJ9VqmF4LXa6q2.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abbu J",
      "qualifications": "MBBS, MD (Radiodiagnosis)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Radiology"
      ],
      "id": "dr-abbu-j",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road"
      ],
      "profileUrl": "https://www.narayanahealth.org/c/bangalore/radiology/dr-abbu-j",
      "profileVerified": true,
      "imagePath": "/images/doctors/d20-real/dr-abbu-j-profile.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Clinical Immunology & Rheumatology",
        "Adult Clinical Immunology & Rheumatology"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/JktnL2R6Ww9kcyZPLn5Q.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abhishek G P",
      "qualifications": "MBBS, MD (General Medicine), DNB (General Medicine), DM (Clinical Immunology & Rheumatology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Clinical Immunology & Rheumatology"
      ],
      "id": "dr-abhishek-g-p",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout"
      ],
      "imagePath": "/images/doctors/d20-real/dr-abhishek-g-p.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore",
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/lSlsZGRAr2ggdwLkwYHX.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Amrita Himalayani",
      "qualifications": "MBBS, MD (Obstetrics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-amrita-himalayani",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout"
      ],
      "imagePath": "/images/doctors/d20-real/dr-amrita-himalayani.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/XQTn0voh76OrSXCYOAGD.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. B Sri Sai Deepthi",
      "qualifications": "MBBS, MD (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-b-sri-sai-deepthi",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-b-sri-sai-deepthi.webp"
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Urology"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore",
        "Narayana Clinic, Harlur Road"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/August2026/ooa5cSLKT10s8eckC0Qt.jpg",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Dasarapu Lohith",
      "qualifications": "MBBS, MS (General Surgery), DrNB (Urology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Urology"
      ],
      "id": "dr-dasarapu-lohith",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-dasarapu-lohith.jpg"
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine",
        "Paediatric Critical Care"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Harlur Road"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/November2024/N1uUzJ7vXFjD5Zp3AJHp.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Hiremath Sagar",
      "qualifications": "MBBS, MD (Paediatrics), Fellowship (Paediatric Intensive Care)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-hiremath-sagar",
      "sampledForUnits": [
        "Narayana Clinic, Harlur Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-hiremath-sagar.webp"
    },
    {
      "designation": "Consultant, Clinical Lead - Adult Heart Failure and Transplant, Heart Failure & Transplantation Medicine",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Heart Failure & Transplantation Medicine",
        "Advanced Cardio-Pulmonary Therapeutics",
        "Heart Failure & Transplant Cardiology"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/February2026/4csY1RpOo8VlKuID1yli.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Aditi Singhvi",
      "qualifications": "MBBS, MD (General Medicine), Fellowship (Cardiology), Fellowship (Advanced Heart Failure Transplant Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Heart Failure & Transplantation Medicine"
      ],
      "id": "dr-aditi-singhvi",
      "sampledForUnits": [
        "Narayana Clinic, HSR Layout",
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-aditi-singhvi.webp"
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery",
        "Joint Replacement"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore",
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2024/MsqHUwt7UglcyIEWan2u.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Amarnath Reddy",
      "qualifications": "MBBS, MS (Orthopaedics), FNB (Spine Surgery), FRCS (Orthopaedics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-amarnath-reddy",
      "sampledForUnits": [
        "Narayana Clinic, HSR Layout",
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-amarnath-reddy.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery",
        "Trauma & Limb Reconstruction"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/NOP5uFjUYJPvEl4WJBf4.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Aditya H Kumar",
      "qualifications": "MBBS, MS (Orthopaedic Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-aditya-h-kumar",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-aditya-h-kumar.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Radiology",
        "Ultrasonology"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/10MMUWyZpslhPTg4ycqW.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Angad S Krishnan",
      "qualifications": "MBBS, MD (Radiodiagnosis)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Radiology"
      ],
      "id": "dr-angad-s-krishnan",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-angad-s-krishnan.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Interventional Cardiology"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar",
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, JP Nagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2024/8GiANoKifzzcn8uyKr0L.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Darshan B N",
      "qualifications": "MBBS, MD (General Medicine), DrNB (Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-darshan-b-n",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar",
        "Narayana Clinic, JP Nagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-darshan-b-n.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Pulmonology",
        "Respiratory Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar",
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/rq52DBVo1Qfgv9Z0ZAk0.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Deepthi Laldayal",
      "qualifications": "MBBS, MD (Pulmonary Medicine), DNB (Pulmonary Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Pulmonology"
      ],
      "id": "dr-deepthi-laldayal",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar",
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-deepthi-laldayal.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/6EnJC3E1lCEQ49VqdY54.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Deepu K Hebbar",
      "qualifications": "MBBS, MS (Obstetrics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-deepu-k-hebbar",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-deepu-k-hebbar.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Psychiatry"
      ],
      "hospitals": [
        "Narayana Clinic, Jayanagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/r9w90Pi2rpdQmFdjX1Eq.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Divya S K",
      "qualifications": "MBBS, DNB (Psychiatry), MD (Psychiatry)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Psychiatry"
      ],
      "id": "dr-divya-s-k",
      "sampledForUnits": [
        "Narayana Clinic, Jayanagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-divya-s-k.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Clinic, JP Nagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/fMFRRu2NVn3nfbt2ysVk.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abida Tabassum",
      "qualifications": "MBBS, DGO (Obstetrics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-abida-tabassum",
      "sampledForUnits": [
        "Narayana Clinic, JP Nagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-abida-tabassum.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Clinic, JP Nagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/WmDFQ8ZTkiC2E1dW2j5a.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Akkamahadevi Dhotrad",
      "qualifications": "MBBS, MS (Obstetrics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-akkamahadevi-dhotrad",
      "sampledForUnits": [
        "Narayana Clinic, JP Nagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-akkamahadevi-dhotrad.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Pulmonology",
        "Respiratory Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, JP Nagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/4O2qaIetWEHs5H3fP4I5.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Amol A Ashtekar",
      "qualifications": "MBBS, DNB (Pulmonary Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Pulmonology"
      ],
      "id": "dr-amol-a-ashtekar",
      "sampledForUnits": [
        "Narayana Clinic, JP Nagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-amol-a-ashtekar.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Interventional Cardiology"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, JP Nagar",
        "Narayana Clinic, Manipal County"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/March2025/F7eUQVWxQW0A3nMBUoAg.jpg",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Arunkumar Ullegaddi",
      "qualifications": "MBBS, MD (General Medicine), DM (Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-arunkumar-ullegaddi",
      "sampledForUnits": [
        "Narayana Clinic, JP Nagar",
        "Narayana Clinic, Manipal County",
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-arunkumar-ullegaddi.jpg"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Dermatology",
        "Dermatology & Cosmetology"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City",
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, JP Nagar"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/QZRa8XqhGGTes9HCAjTR.webp",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Bhavishya Shetty",
      "qualifications": "MBBS, MD (Dermatology), Fellowship (Dermatology Venereology & Leprosy)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Dermatology"
      ],
      "id": "dr-bhavishya-shetty",
      "sampledForUnits": [
        "Narayana Clinic, JP Nagar"
      ],
      "imagePath": "/images/doctors/d20-real/dr-bhavishya-shetty.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Family Medicine",
        "Diabetology"
      ],
      "hospitals": [
        "Narayana Clinic, Kanakapura Road"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/pwUI46YI15VIDDOIg50m.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Buddiga Lakshmi Swetha",
      "qualifications": "MBBS, DNB (Family Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Family Medicine"
      ],
      "id": "dr-buddiga-lakshmi-swetha",
      "sampledForUnits": [
        "Narayana Clinic, Kanakapura Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-buddiga-lakshmi-swetha.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Clinic, Kanakapura Road"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/hQyDfv6mxL2Ocey2dG2Y.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Impashree C M",
      "qualifications": "MBBS, MS (Obstetics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-impashree-c-m",
      "sampledForUnits": [
        "Narayana Clinic, Kanakapura Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-impashree-c-m.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Kanakapura Road",
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/SB8ejVm0405KOBpiv2Ae.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Kavya J",
      "qualifications": "MBBS, MD (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-kavya-j",
      "sampledForUnits": [
        "Narayana Clinic, Kanakapura Road",
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": "/images/doctors/d20-real/dr-kavya-j.webp"
    },
    {
      "designation": "Senior Consultant, Clinical Lead",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Neurosurgery",
        "Neuro Oncology"
      ],
      "hospitals": [
        "Narayana Clinic, Kanakapura Road",
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2024/KZiFaXXLN9xFyqh19N9n.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Komal Prasad",
      "qualifications": "MBBS, MS (General Surgery), MCh (Neurosurgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Neurosurgery"
      ],
      "id": "dr-komal-prasad",
      "sampledForUnits": [
        "Narayana Clinic, Kanakapura Road"
      ],
      "imagePath": "/images/doctors/d20-real/dr-komal-prasad.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Heart Failure",
        "Structural Heart Disease and Interventional Cardiology",
        "Interventional Cardiology",
        "Heart Failure & Transplant Cardiology",
        "Advanced Cardiac Sonography / Echocardiography"
      ],
      "hospitals": [
        "Narayana Clinic, Kanakapura Road",
        "Narayana Clinic, Jayanagar",
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/aGXTg3wGBkLGlzUAcXiw.webp",
      "languages": [],
      "moreHospitals": "+3",
      "name": "Dr. Manidipa Majumdar",
      "qualifications": "MBBS, MD(Internal Medicine), MRCP (Internal Medicine), DM Cardiology",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-manidipa-majumdar",
      "sampledForUnits": [
        "Narayana Clinic, Kanakapura Road",
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": "/images/doctors/d20-real/dr-manidipa-majumdar.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Psychiatry",
        "Geriatric Mental Health"
      ],
      "hospitals": [
        "Narayana Clinic, Sarjapur",
        "Narayana Clinic, Manipal County"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/9NM7rQJJcXKoJwOfkF5h.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abhishek R",
      "qualifications": "MBBS, MD (Psychiatry), PDF (Geriatric Psychiatry)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Psychiatry"
      ],
      "id": "dr-abhishek-r",
      "sampledForUnits": [
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, Sarjapur"
      ],
      "imagePath": "/images/doctors/d20-real/dr-abhishek-r.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "E.N.T"
      ],
      "hospitals": [
        "Narayana Clinic, Manipal County"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/qVNboSKbXdEECccYKWFT.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Akshay B K",
      "qualifications": "MBBS, MS (E.N.T)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "E.N.T"
      ],
      "id": "dr-akshay-b-k",
      "sampledForUnits": [
        "Narayana Clinic, Manipal County"
      ],
      "imagePath": "/images/doctors/d20-real/dr-akshay-b-k.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Endocrinology, Diabetes & Metabolic Medicine",
        "Endocrinology & Metabolism"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore",
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, Manipal County",
        "Narayana Clinic, HSR Layout"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/SaAn7Tu54rIlJBkjMyWu.webp",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Anirudh J Shetty",
      "qualifications": "MBBS, MD (General Medicine), DM (Endocrinology & Diabetology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Endocrinology",
        "Diabetes & Metabolic Medicine"
      ],
      "id": "dr-anirudh-j-shetty",
      "sampledForUnits": [
        "Narayana Clinic, Manipal County",
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-anirudh-j-shetty.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/fkcfnb4uPr9Aehd9Grpu.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Anurag Ranjan",
      "qualifications": "MBBS, Certificate (Diabetology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-anurag-ranjan",
      "sampledForUnits": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": "/images/doctors/d20-real/dr-anurag-ranjan.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Dermatology"
      ],
      "hospitals": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/OGruuPU4KDLgyjc125cc.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Ashitha S R",
      "qualifications": "MBBS, DVD (Dermatology  & Venereology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Dermatology"
      ],
      "id": "dr-ashitha-s-r",
      "sampledForUnits": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": "/images/doctors/d20-real/dr-ashitha-s-r.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Obstetrics & Gynaecology"
      ],
      "hospitals": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Geethashree H C",
      "qualifications": "MBBS, MS (Obstetics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-geethashree-h-c",
      "sampledForUnits": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": ""
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Plastic Surgery",
        "Microvascular Surgery"
      ],
      "hospitals": [
        "Narayana Clinic, Harlur Road",
        "Narayana Clinic, Nagarabhavi"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Manjunath M",
      "qualifications": "MBBS, MS (General Surgery), MCh (Plastic Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Plastic Surgery"
      ],
      "id": "dr-manjunath-m",
      "sampledForUnits": [
        "Narayana Clinic, Nagarabhavi"
      ],
      "imagePath": ""
    },
    {
      "designation": "Visiting Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Clinical Psychology"
      ],
      "hospitals": [
        "Narayana Clinic, Sarjapur"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/9PbuDbPL3QyVZTACGiyD.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Anindita Bhattacharya",
      "qualifications": "PHD (Psychology), MPHIL (Psychology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Clinical Psychology"
      ],
      "id": "dr-anindita-bhattacharya",
      "sampledForUnits": [
        "Narayana Clinic, Sarjapur"
      ],
      "imagePath": "/images/doctors/d20-real/dr-anindita-bhattacharya.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Interventional Cardiology"
      ],
      "hospitals": [
        "Narayana Clinic, Chandapura",
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Narayana Clinic, Sarjapur"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2024/Y5Eja6hcdA71M9dLaoAH.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Barendra Kumar Raut",
      "qualifications": "MBBS, MD (General Medicine), DM (Cardiology), Fellowship (Interventional Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-barendra-kumar-raut",
      "sampledForUnits": [
        "Narayana Clinic, Sarjapur"
      ],
      "imagePath": "/images/doctors/d20-real/dr-barendra-kumar-raut.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "E.N.T"
      ],
      "hospitals": [
        "Narayana Clinic, HSR Layout",
        "Narayana Multispeciality Hospital, HSR Bangalore",
        "Narayana Clinic, Sarjapur"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/ctdmpiSj12HcTSeApufn.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. G Mohan",
      "qualifications": "MBBS, MS (E.N.T)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "E.N.T"
      ],
      "id": "dr-g-mohan",
      "sampledForUnits": [
        "Narayana Clinic, Sarjapur"
      ],
      "imagePath": "/images/doctors/d20-real/dr-g-mohan.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine",
        "Diabetology"
      ],
      "hospitals": [
        "Narayana Clinic, Sarjapur"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/FkY94h0Y10rVQTioR1T6.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Himali Shah",
      "qualifications": "MBBS, MD (General Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-himali-shah",
      "sampledForUnits": [
        "Narayana Clinic, Sarjapur"
      ],
      "imagePath": "/images/doctors/d20-real/dr-himali-shah.webp"
    },
    {
      "designation": "Junior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Cardiology"
      ],
      "hospitals": [
        "Narayana Health City, International Wing"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Parimala P Nath",
      "qualifications": "MBBS, DCH (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Cardiology"
      ],
      "id": "dr-parimala-p-nath",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": ""
    },
    {
      "designation": "Senior Consultant, Clinical Lead",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Gynaecologic Oncology",
        "Gynaecology",
        "Robot-Assisted Reproductive Gynaecological Surgery",
        "Robotic Surgery",
        "HIPEC Surgery",
        "Cytoreductive Surgery",
        "Minimal Access Surgery"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Health City, International Wing"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/March2025/ZrLNdMGo3u518FJQN28J.jpg",
      "languages": [],
      "moreHospitals": "+2",
      "name": "Dr. Rohit Raghunath Ranade",
      "qualifications": "MBBS, MS (Obstetrics & Gynaecology), MCh (Gynaecological oncology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Gynaecologic Oncology",
        "Gynaecology"
      ],
      "id": "dr-rohit-raghunath-ranade",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": "/images/doctors/d20-real/dr-rohit-raghunath-ranade.jpg"
    },
    {
      "designation": "Senior Consultant, Clinical Lead - Paediatric Surgery",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Surgery",
        "Robotic Surgery",
        "Paediatric Urology & Kidney Transplant",
        "Paediatric Airway Surgery"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Health City, International Wing"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2024/9TyEncbO5Pog2MANRNtf.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Sanjay Rao",
      "qualifications": "MBBS, MS (General Surgery), DNB (Paediatric Surgery), MCh (Paediatric Surgery), FNB (General Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Surgery"
      ],
      "id": "dr-sanjay-rao",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": "/images/doctors/d20-real/dr-sanjay-rao.webp"
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Family Medicine"
      ],
      "hospitals": [
        "Narayana Clinic, Electronic City",
        "Narayana Health City, International Wing"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Santosh K M",
      "qualifications": "MBBS, MD (General Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Family Medicine"
      ],
      "id": "dr-santosh-k-m",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": ""
    },
    {
      "designation": "Senior Consultant, Clinical Lead",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Gynaecology",
        "Obstetrics & Gynaecology",
        "Minimal Access Surgery",
        "Robotic Surgery",
        "High Risk Obstetrics"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Clinic, Electronic City",
        "Narayana Health City, International Wing"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/November2024/3dcofIIlfkUFxAJI1kcZ.webp",
      "languages": [],
      "moreHospitals": "+1",
      "name": "Dr. Sapna Raina",
      "qualifications": "MBBS, MD (Obstetrics & Gynaecology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Gynaecology",
        "Obstetrics & Gynaecology"
      ],
      "id": "dr-sapna-raina",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": "/images/doctors/d20-real/dr-sapna-raina.webp"
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Executive Health Checkup",
        "Preventive Medicine & Health Check-up"
      ],
      "hospitals": [
        "Narayana Health City, International Wing"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Sheethal N Kumar",
      "qualifications": "MBBS, PGDGM (Geriatric Medicine), DNB (Family Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Executive Health Checkup"
      ],
      "id": "dr-sheethal-n-kumar",
      "sampledForUnits": [
        "Narayana Health City, International Wing"
      ],
      "imagePath": ""
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "General Medicine",
        "Adult Critical Care",
        "Diabetology",
        "Geriatric Medicine",
        "Infectious Diseases",
        "Circulatory Support & ECMO Specialist/Services"
      ],
      "hospitals": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/9Ww2Okhd61dqD4X5Tx6E.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Anusha Sharma P S",
      "qualifications": "MBBS, DNB General Medicine",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "General Medicine"
      ],
      "id": "dr-anusha-sharma-p-s",
      "sampledForUnits": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-anusha-sharma-p-s.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Advanced Cardiac Sonography / Echocardiography",
        "Heart Failure & Transplant Cardiology",
        "Interventional Cardiology",
        "Structural Heart Disease and Interventional Cardiology",
        "Heart Failure"
      ],
      "hospitals": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/September2026/oQtTKN5v1BUiZIUqivno.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. G C CHIDANANDA",
      "qualifications": "MBBS,MD(General Medicine), DM Cardiology",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-g-c-chidananda",
      "sampledForUnits": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-g-c-chidananda.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [],
      "hospitals": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/xqQTg00yuRRzism43PRs.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Harshavardhana K N",
      "qualifications": "MBBS, DNB (General Medicine/Internal Medicine)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [],
      "id": "dr-harshavardhana-k-n",
      "sampledForUnits": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-harshavardhana-k-n.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [],
      "hospitals": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/1wSTL9Ugrb1WlTBQy8lc.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Jayant Mulchandani",
      "qualifications": "MBBS, MS General Surgery, Fellowship in Surgical Gastroenterology, Fellowship in Hepatopancreatobiliary (HPB) and Colorectal Surgery, da Vinci Fellowship in Robotic General and Gastrointestinal Surgery",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [],
      "id": "dr-jayant-mulchandani",
      "sampledForUnits": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-jayant-mulchandani.webp"
    },
    {
      "designation": "Senior Registrar",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Critical Care Medicine",
        "Circulatory Support & ECMO Specialist/Services",
        "Pain Management & Palliative Care",
        "Transplant Critical Care"
      ],
      "hospitals": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/October2026/s3mLZ6GeuLDxdE47Uyw9.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Jayasree B",
      "qualifications": "MBBS, FCC, FCCMED, CPCDM",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Critical Care Medicine"
      ],
      "id": "dr-jayasree-b",
      "sampledForUnits": [
        "Narayana Hospital - Banashankari, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-jayasree-b.webp"
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric & Congenital Heart Surgery"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/November2024/rnLyLWObvirRAjdMT2xq.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Anup Charles S",
      "qualifications": "MBBS, MS (General Surgery), MCh (Cardio Thoracic & Vascular Surgery), Fellowship (Paediatric Cardiac Surgery)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric & Congenital Heart Surgery"
      ],
      "id": "dr-anup-charles-s",
      "sampledForUnits": [
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-anup-charles-s.webp"
    },
    {
      "designation": "Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Cardiology",
        "Paediatric Cardiac Electrophysiology",
        "Paediatric & Congenital Interventional Cardiology"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore",
        "Mazumdar Shaw Medical Centre, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/July2024/212hO79jJljvzGRxTORl.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Atul Surendra Prabhu",
      "qualifications": "MBBS, MD (Paediatrics), Fellowship (Electrophysiology), FNB (Paediatric Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Cardiology"
      ],
      "id": "dr-atul-surendra-prabhu",
      "sampledForUnits": [
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-atul-surendra-prabhu.webp"
    },
    {
      "designation": "Senior Consultant, Director - Heart Transplant Program",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Adult Cardiology",
        "Heart Failure & Transplant Cardiology",
        "Advanced Cardio-Pulmonary Therapeutics",
        "Structural Heart Intervention",
        "Interventional Cardiology"
      ],
      "hospitals": [
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/February2024/jYqKBboK1V1Lu6pZMwTf.jpg",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Bagirath Raghuraman",
      "qualifications": "MBBS, MD (General Medicine), DM (Cardiology), Fellowship (Interventional Cardiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Adult Cardiology"
      ],
      "id": "dr-bagirath-raghuraman",
      "sampledForUnits": [
        "Narayana Institute of Cardiac Sciences, Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-bagirath-raghuraman.jpg"
    },
    {
      "designation": "Visiting Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Paediatric Medicine"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/November2024/9w2mCTn5K8M32juJa3Ii.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Abhinav Malhotra",
      "qualifications": "MBBS, MD (Paediatrics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Paediatric Medicine"
      ],
      "id": "dr-abhinav-malhotra",
      "sampledForUnits": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-abhinav-malhotra.webp"
    },
    {
      "designation": "Visiting Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Adarsh Babu K",
      "qualifications": "MBBS, DNB (Orthopaedics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-adarsh-babu-k",
      "sampledForUnits": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": ""
    },
    {
      "designation": "Associate Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Interventional & Endovascular Radiology"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2026/zB31gXflndCcarHYyUy0.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Adithya Shetty",
      "qualifications": "MBBS, MD (Radiology), DrNB (Interventional & Endovascular Radiology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Interventional & Endovascular Radiology"
      ],
      "id": "dr-adithya-shetty",
      "sampledForUnits": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-adithya-shetty.webp"
    },
    {
      "designation": "Visiting Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Orthopaedic Surgery",
        "Joint Replacement"
      ],
      "hospitals": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imageUrl": null,
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Akshay Shetty T",
      "qualifications": "MBBS, MS (Orthopaedics), DNB (Orthopaedics)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Orthopaedic Surgery"
      ],
      "id": "dr-akshay-shetty-t",
      "sampledForUnits": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": ""
    },
    {
      "designation": "Senior Consultant",
      "experienceLabel": null,
      "experienceYears": null,
      "expertise": [
        "Breast Oncology & Oncoplastic Surgery"
      ],
      "hospitals": [
        "Mazumdar Shaw Medical Centre, Bangalore",
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imageUrl": "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/doctors/April2024/AaEk6oVUcvHCEzkaPFlt.webp",
      "languages": [],
      "moreHospitals": "",
      "name": "Dr. Akshita Singh",
      "qualifications": "MBBS, DNB (General Surgery), FEBS (Breast Surgery), Fellowship (Breast Oncology)",
      "sourceUrl": "https://www.narayanahealth.org/ocaapp/doctors/bangalore",
      "specialties": [
        "Breast Oncology & Oncoplastic Surgery"
      ],
      "id": "dr-akshita-singh",
      "sampledForUnits": [
        "Narayana Multispeciality Hospital, HSR Bangalore"
      ],
      "imagePath": "/images/doctors/d20-real/dr-akshita-singh.webp"
    }
  ]
};
