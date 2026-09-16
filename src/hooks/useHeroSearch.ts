import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchHealthcare, getCityId, type NormalizedResults } from "@/lib/searchService";
import { doctorsData } from "@/data/doctors";
import { specialitiesData } from "@/data/specialities";
import { treatmentsData } from "@/data/treatments";
import { articlesData } from "@/data/articles";

export function useHeroSearch(onSearchExecute?: () => void) {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownTab, setActiveDropdownTab] = useState<"doctors" | "specialties" | "treatments_tests" | "articles">("doctors");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isOpen, setIsOpen] = useState(false);
  const [lastSearch, setLastSearch] = useState<string | null>(null);

  // --- API integration state ---
  const [apiData, setApiData] = useState<NormalizedResults | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load last search from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nh_last_search");
      if (saved) {
        setLastSearch(saved);
      }
    }
  }, []);

  // Debounced API call — fires from first character, cancels stale requests
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setApiData(null);
      setIsApiLoading(false);
      return;
    }

    setIsApiLoading(true);
    const cityId = getCityId(selectedLocation);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        const results = await searchHealthcare(trimmedQuery, cityId, controller.signal);
        if (!controller.signal.aborted) {
          setApiData(results);
          setIsApiLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("[Search API]", err);
          setApiData(null);
          setIsApiLoading(false);
        }
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedLocation]);

  // Reset dropdown tab to Doctors when typing/query changes
  useEffect(() => {
    setActiveDropdownTab("doctors");
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nh_last_search", query);
        setLastSearch(query);
      }
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      onSearchExecute?.();
    }
  };

  const handleSelectSuggestion = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nh_last_search", name);
      setLastSearch(name);
    }
    router.push(`/search?q=${encodeURIComponent(name)}`);
    setIsOpen(false);
    onSearchExecute?.();
  };

  // Filter lists based on input (semantic keyword search & exact name match)
  const showDefaults = !searchQuery.trim();
  const isDoctorQuery = searchQuery.toLowerCase().includes("dr") || searchQuery.toLowerCase().includes("doctor");

  const filteredDoctors = (showDefaults 
    ? doctorsData.map(doc => ({ ...doc, score: 1 }))
    : doctorsData.map((doc) => {
        const nameMatch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = doc.speciality.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = doc.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...doc,
          nameMatch,
          specMatch,
          matchingKeyword,
          score: nameMatch ? 3 : specMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((doc) => doc.score > 0)
      .sort((a, b) => b.score - a.score)
  )
  .filter(doc => selectedLocation === "All Locations" || doc.location === selectedLocation)
  .slice(0, 6);

  const filteredSpecs = showDefaults 
    ? specialitiesData.slice(0, 6).map(spec => ({ ...spec, matchingKeyword: null }))
    : specialitiesData.map((spec) => {
        const nameMatch = spec.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = spec.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...spec,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((spec) => spec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const filteredTreatments = showDefaults 
    ? treatmentsData.map(t => ({ ...t, matchingKeyword: null }))
    : treatmentsData.map((t) => {
        const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = t.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...t,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score);

  const filteredOnlyTreatments = filteredTreatments.filter(t => t.type === "treatment").slice(0, 6);
  const filteredHealthCheckups = filteredTreatments.filter(t => t.type === "health_checkup").slice(0, 6);
  const filteredLabTests = filteredTreatments.filter(t => t.type === "lab_test").slice(0, 6);

  const filteredArticles = showDefaults 
    ? articlesData.slice(0, 6).map(a => ({ ...a, matchingKeyword: null }))
    : articlesData.map((a) => {
        const nameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = a.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...a,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const hasSuggestions = filteredDoctors.length > 0 || filteredSpecs.length > 0 || filteredTreatments.length > 0 || filteredArticles.length > 0;

  // --- Derive display data: prefer API results when available, fall back to static ---
  const useApiData = apiData !== null && searchQuery.trim() !== "";

  const displayDoctors = useApiData
    ? apiData!.doctors.slice(0, 6).map((d) => ({
        name: d.name,
        speciality: d.speciality,
        location: d.hospital,
        hospital: d.hospital,
        additionalHospitals: undefined as number | undefined,
        photo: d.photo,
        keywords: [] as string[],
        consultationModes: (
          d.vcEnabled && (d.apptEnabled || d.walkinEnabled) ? "both"
            : d.vcEnabled ? "video"
            : "hospital"
        ) as "both" | "video" | "hospital",
        availability: d.availability,
      }))
    : filteredDoctors;

  const displaySpecs = useApiData
    ? apiData!.specialities.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        image: s.image,
        keywords: [] as string[],
        matchingKeyword: null as string | null,
      }))
    : filteredSpecs;

  const displaySubSpecs = useApiData
    ? apiData!.subSpecialities.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        image: s.image,
        parentSpeciality: s.parentSpeciality,
      }))
    : [];

  const loading = isApiLoading && !apiData;
  const tabCounts = {
    doctors: loading ? -1 : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    specialties: loading ? -1 : useApiData
      ? apiData!.specialities.length + apiData!.subSpecialities.length
      : filteredSpecs.length,
    treatments: loading ? -1 : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    articles: loading ? -1 : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };

  const displayProcedureItems = useApiData
    ? apiData!.procedures.map((p) => ({
        name: p.name,
        type: "Procedures" as const,
        speciality: p.speciality,
        image: p.image,
      }))
    : filteredOnlyTreatments;

  const displayTreatmentItems = useApiData
    ? apiData!.treatments.map((t) => ({
        name: t.name,
        type: "Treatments" as const,
        speciality: t.speciality,
        image: t.image,
      }))
    : [];

  const displayArticlesFinal = useApiData
    ? apiData!.blogs.slice(0, 6).map((b) => ({
        name: b.name,
        keywords: [] as string[],
        image: b.image,
        description: b.speciality || "",
        matchingKeyword: null,
      }))
    : filteredArticles;

  return {
    searchQuery,
    setSearchQuery,
    activeDropdownTab,
    setActiveDropdownTab,
    selectedLocation,
    setSelectedLocation,
    isOpen,
    setIsOpen,
    lastSearch,
    
    isApiLoading,
    useApiData,
    loading,
    tabCounts,
    
    handleSearch,
    handleSelectSuggestion,
    
    showDefaults,
    isDoctorQuery,
    hasSuggestions,
    
    displayDoctors,
    displaySpecs,
    displaySubSpecs,
    filteredHealthCheckups,
    filteredLabTests,
    displayProcedureItems,
    displayTreatmentItems,
    displayArticles: displayArticlesFinal,
    
    // Original filtered lists needed by JSX
    filteredSpecs,
    filteredDoctors,
    filteredTreatments,
    filteredOnlyTreatments
  };
}
