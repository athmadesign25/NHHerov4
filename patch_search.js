const fs = require('fs');
let content = fs.readFileSync('src/app/search/page.tsx', 'utf-8');

// 1. Imports
content = content.replace(
  `import React, { useState, useEffect, Suspense } from "react";`,
  `import React, { useState, useEffect, useRef, Suspense } from "react";`
);
content = content.replace(
  `import styles from "./search.module.css";`,
  `import styles from "./search.module.css";\nimport { searchHealthcare, getCityId, NH_CITIES, type NormalizedResults } from "@/lib/searchService";`
);

// 2. Tabs
content = content.replace(
  `{ id: "specialty", label: "Specialty", countKey: "specialty" },\n  { id: "treatments", label: "Procedures & Treatments", countKey: "treatments" },`,
  `{ id: "treatments", label: "Treatments & Procedures", countKey: "treatments" },`
);

// 3. State
content = content.replace(
  `const initialLocation = searchParams.get("location") || "Bangalore";`,
  `const initialLocation = searchParams.get("location") || "All";`
);

content = content.replace(
  `  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");`,
  `  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");\n\n  // --- API integration ---\n  const [apiData, setApiData] = useState<NormalizedResults | null>(null);\n  const abortControllerRef = useRef<AbortController | null>(null);\n  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);`
);

// 4. API Effect
const apiEffectStr = `
  // Debounced API call — triggers from 1 char, re-fetches on city change
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setApiData(null);
      return;
    }

    setIsFiltering(true);
    const cityId = getCityId(location);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        const results = await searchHealthcare(trimmedQuery, cityId, controller.signal);
        if (!controller.signal.aborted) {
          setApiData(results);
          setIsFiltering(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("[Search API]", err);
          setApiData(null);
          setIsFiltering(false);
        }
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location]);
`;

content = content.replace(
  `  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {`,
  `${apiEffectStr}\n\n  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {`
);

// 5. Derive Display Data
const countRegex = /const filteredSpecialty = ALL_SPECIALTIES\.filter\(\(s\) => s\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\)\);\n\n\s*const counts: Record<string, number> = \{\n\s*doctors: filteredDoctors\.length,\n\s*hospitals: filteredHospitals\.length,\n\s*treatments: filteredTreatments\.length,\n\s*packages_tests: filteredPackages\.length \+ filteredLabs\.length,\n\s*specialty: filteredSpecialty\.length,\n\s*articles: filteredArticles\.length,\n\s*\};/;

const derivedDataStr = `
  // --- Derive display data: API results override static when query is active ---
  const useApiData = apiData !== null && query.trim() !== "";

  // Doctors: map API fields to the shape the card already expects
  const displayDoctors = useApiData
    ? apiData!.doctors.map((d) => ({
        id: String(d.id),
        name: d.name,
        speciality: d.speciality,
        degrees: d.speciality,
        hospital: d.hospital,
        hospitalCount: "",
        city: location,
        experience: "",
        rating: 0,
        reviews: 0,
        available: d.apptEnabled || d.walkinEnabled ? "Available Today" : "Check Availability",
        availability: d.availability,
        img: d.photo,
        fee: "",
        isExecutive: false,
      }))
    : filteredDoctors;

  // Treatments & Procedures tab — treatments first
  const displayTreatments = useApiData
    ? [
        ...apiData!.treatments.map((t) => ({
          id: \`treat-api-\${t.id}\`,
          name: t.name,
          speciality: t.speciality,
          description: t.speciality ? \`Related to \${t.speciality}\` : "",
          duration: "",
          type: "Treatments" as string,
          image: t.image,
        })),
        ...apiData!.procedures.map((p) => ({
          id: \`proc-api-\${p.id}\`,
          name: p.name,
          speciality: p.speciality,
          description: p.speciality ? \`Related to \${p.speciality}\` : "",
          duration: "",
          type: "Procedures" as string,
          image: p.image,
        })),
      ]
    : filteredTreatments;

  // Articles & Blogs tab
  const displayArticles = useApiData
    ? apiData!.blogs.map((b) => ({
        id: \`blog-api-\${b.id}\`,
        title: b.name,
        author: "",
        readTime: "",
        category: b.speciality || "Health",
        date: "",
        summary: "",
        image: b.image,
      }))
    : filteredArticles;

  const counts: Record<string, number | string> = {
    doctors: isFiltering && !apiData ? "…" : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    hospitals: filteredHospitals.length,
    treatments: isFiltering && !apiData ? "…" : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    packages_tests: filteredPackages.length + filteredLabs.length,
    articles: isFiltering && !apiData ? "…" : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };
`;

content = content.replace(countRegex, derivedDataStr);

fs.writeFileSync('src/app/search/page.tsx', content);
