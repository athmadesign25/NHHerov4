"use client";
import { design20ListingReturnTo, design20RequestedSelection } from "@/features/booking/design20/model";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ComponentType, type MouseEvent } from "react";
import type Lenis from "lenis";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Filter, Info, PhoneCall, X } from "lucide-react";
import { searchDoctorsData } from "../../mockDoctors";
import { getCityId } from "@/lib/searchService";
import { getSearchTabById, getSearchTabFromPathname, getSearchTabPath, type SearchTabId } from "@/features/search/searchTabs";
import { activeFilterCount, bookingUrl, emptyDoctorFilters, filterDoctors, fromApiDoctor, fromDirectoryDoctor, readListingParams, sortDoctors, withSelectedDoctorHospital, type ConsultationMode, type DoctorFilters as DoctorFilterValues, type DoctorListingItem } from "@/features/search/doctorListing";
import { catalogResults, emptyCatalogFilters, filterCatalog, readCatalogFilters, readSearchLocation, type CatalogFilters as CatalogFilterValues, type SearchCatalogs, type SearchResultItem } from "@/features/search/design3Data";
import { useDesign3Search } from "@/features/search/useDesign3Search";
import { useDesign3BookedDoctors } from "@/features/search/useDesign3BookedDoctors";
import { withDesign3DemoMetadata } from "@/features/search/design3DoctorMetadata";
import { design3CityDoctors, getDesign3CityDoctor } from "@/features/search/design3CityDoctors";
import { DOCTOR_LANDING_CITIES, getDoctorLandingContext, getDoctorListingCopy } from "@/features/search/doctorLandingPages";
import { doctorListingParams, doctorListingUrl } from "@/features/search/doctorListingNavigation";
import { DESIGN16_BOOKING_DAYS, indiaDate } from "@/features/booking/appointmentTime";
import { design16DoctorsInLocation, readDesign16Date, refineDesign16Doctors, findDesign16NextAvailability, hasDesign16Availability } from "@/features/search/design16Refinements";
import Design16Refinements from "../d16/Design16Refinements";
import ExpertiseShortcuts from "../d16/ExpertiseShortcuts";
import LanguageShortcut from "../d16/LanguageShortcut";
import Design17DoctorDetails from "../d17/DoctorDetails";
import { design17ConsultationHistory } from "@/features/search/design17ConsultationHistory";
import { design17BookingUrl } from "@/features/search/design17Booking";
import { design17ListingReturnTo } from "@/features/search/design17Navigation";
import { searchDesign17Directory } from "@/features/search/design17DirectorySearch";
import { getDesign3BookingDoctor } from "@/features/booking/doctors";
import { design20Directory, design20SearchableIds, getDesign20BookingDoctor, getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { design17RequestedSelection } from "@/features/booking/design17/model";
import { design18ListingReturnTo } from "@/features/booking/design18/model";
import { design19ListingReturnTo } from "@/features/booking/design19/model";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import BookingWorkspace from "@/features/booking/design18/BookingWorkspace";
import workspaceStyles from "@/features/booking/design18/BookingWorkspace.module.css";
import DesignSwitcher from "@/features/design-preview/DesignSwitcher";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import DoctorFilters from "../../doctors/DoctorFilters";
import DoctorListingControls from "../../doctors/DoctorListingControls";
import SidebarDoctorFilters from "./SidebarDoctorFilters";
import SearchHeader from "./SearchHeader";
import DoctorSearchTop from "./DoctorSearchTop";
import DoctorListingFAQ from "./DoctorListingFAQ";
import FilterScrollArea from "./FilterScrollArea";
import CatalogFilters from "./CatalogFilters";
import SearchDialog from "./SearchDialog";
import DoctorCard from "./DoctorCard";
import ResultCard from "./ResultCard";
import SearchState, { ResultSkeletons } from "./SearchState";
import styles from "./Design3SearchResults.module.css";
import ui from "./DoctorSearchTheme.module.css";

const previewDirectory = [...withDesign3DemoMetadata(searchDoctorsData.map(fromDirectoryDoctor)), ...design3CityDoctors];
const titles: Record<SearchTabId, string> = {
  doctors: "Find the right doctor", hospitals: "Find a hospital or clinic", specialties: "Explore our specialities",
  treatments: "Explore treatments & procedures", packages_tests: "Health packages & tests", articles: "Health articles & insights",
};

interface Props {
  catalogs: SearchCatalogs;
  previewVariant?: "d3" | "d4" | "d5" | "d6" | "d16" | "d17" | "d17-lite" | "d18" | "d19" | "d20";
  cardComponent?: ComponentType<ComponentProps<typeof DoctorCard> & { priority?: boolean; bookingDate?: string; focusTerms?: string[]; cardDesign?: "d17" | "d17-lite" | "d18" | "d19" | "d20"; listingReturnTo?: string; active?: boolean; onClose?: () => void; initialSelection?: AppointmentSelection; resume?: boolean }>;
  gridClassName?: string;
}

export default function Design3SearchResults({ catalogs, previewVariant = "d3", cardComponent: Card = DoctorCard, gridClassName = "" }: Props) {
  const directory = previewVariant === "d20" ? design20Directory : previewDirectory;
  const scheduleContext = previewVariant === "d20" ? "d20" : undefined;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const landing = getDoctorLandingContext(pathname);
  const params = doctorListingParams(pathname, searchParams.toString());
  const legacyTab = pathname === "/search" ? getSearchTabById(params.get("tab")) : undefined;
  const tab = legacyTab ?? getSearchTabFromPathname(pathname);
  const query = params.get("q") ?? params.get("search") ?? params.get("query") ?? "";
  const location = readSearchLocation(params);
  const { filters: listingFilters, mode, sort } = readListingParams(params);
  const [availabilityNow, refreshAvailability] = useState(() => new Date());
  const isDesign18 = previewVariant === "d18";
  const isDesign19 = previewVariant === "d19" || previewVariant === "d20";
  const isDesign17 = previewVariant === "d17" || previewVariant === "d17-lite" || isDesign18 || isDesign19;
  const cardDesign = isDesign19 ? (previewVariant === "d20" ? "d20" : "d19") : isDesign18 ? "d18" : previewVariant === "d17-lite" ? "d17-lite" : "d17";
  const smartRefinements = previewVariant === "d16" || isDesign17;
  const listingReturnToForCard = previewVariant === "d20" ? design20ListingReturnTo : design19ListingReturnTo;
  const listingReturnTo = isDesign19 ? listingReturnToForCard(`${pathname}?${searchParams}`) : isDesign18 ? design18ListingReturnTo(`${pathname}?${searchParams}`) : isDesign17 ? design17ListingReturnTo(`${pathname}?${searchParams}`, cardDesign) : undefined;
  const bookingId = isDesign18 || isDesign19 ? searchParams.get("booking") : null;
  const bookingSource = bookingId ? (previewVariant === "d20" ? getDesign20BookingDoctor(bookingId) : getDesign3BookingDoctor(bookingId)) : null;
  const activeBooking = bookingSource ? { ...bookingSource, name: presentationDoctorName(bookingSource.name) } : null;
  const workspacePosition = useRef<{ scroll: number; doctorId: string } | null>(null);
  const previousBooking = useRef<string | null>(null);
  const openedHere = useRef(false);
  const visitedCards = useRef(new Set<string>());
  const [resumeCard, setResumeCard] = useState(false);
  const closeWorkspace = () => {
    if (openedHere.current) { openedHere.current = false; window.history.back(); }
    else window.history.replaceState(null, "", listingReturnTo ?? "/search/doctors?design=d18");
  };
  const closeBookingCard = () => {
    if (openedHere.current) { openedHere.current = false; window.history.back(); }
    else window.history.replaceState(null, "", listingReturnTo ?? "/search/doctors?design=d19");
  };
  const workspaceOpen = isDesign18 && Boolean(activeBooking);
  useEffect(() => {
    if (!isDesign18) return;
    if (bookingId && workspaceOpen) {
      requestAnimationFrame(() => {
        const element = document.querySelector<HTMLElement>("[data-booking-workspace]");
        if (!element) return;
        const top = window.scrollY + element.getBoundingClientRect().top - parseFloat(getComputedStyle(element).scrollMarginTop);
        const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
        if (lenis) lenis.scrollTo(Math.max(0, top), { immediate: true }); else window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      });
    } else if (previousBooking.current) {
      const position = workspacePosition.current;
      requestAnimationFrame(() => {
        if (position) {
          const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
          if (lenis) lenis.scrollTo(position.scroll, { immediate: true }); else window.scrollTo({ top: position.scroll, behavior: "instant" });
          document.querySelector<HTMLElement>(`[data-book-doctor="${CSS.escape(position.doctorId)}"]`)?.focus({ preventScroll: true });
        }
      });
    }
    previousBooking.current = bookingId;
  }, [bookingId, workspaceOpen, isDesign18]);
  useEffect(() => {
    if (!isDesign19) return;
    const previous = previousBooking.current;
    previousBooking.current = bookingId;
    if (bookingId) {
      visitedCards.current.add(bookingId);
      // Direct entry and Edit details return to the selected card. An ordinary
      // Book click keeps its exact current position and never scrolls the page.
      if (!openedHere.current) {
        const frame = requestAnimationFrame(() => {
          const card = document.querySelector<HTMLElement>(`[data-booking-card="${CSS.escape(bookingId)}"]`);
          if (!card) return;
          const top = Math.max(0, window.scrollY + card.getBoundingClientRect().top - parseFloat(getComputedStyle(card).scrollMarginTop));
          const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
          if (lenis) lenis.scrollTo(top, { immediate: true }); else window.scrollTo({ top, behavior: "instant" });
        });
        return () => cancelAnimationFrame(frame);
      }
    }
    if (!bookingId && previous) {
      const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-book-doctor="${CSS.escape(previous)}"]`)?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(frame);
    }
  }, [bookingId, isDesign19]);
  const cardSelectionParams = new URLSearchParams(searchParams.toString());
  if (isDesign19 && searchParams.get("bookingMode")) cardSelectionParams.set("mode", searchParams.get("bookingMode")!);
  const activeCardSelection = isDesign19 && activeBooking
    ? (previewVariant === "d20" ? design20RequestedSelection : design17RequestedSelection)(activeBooking, cardSelectionParams) : undefined;
  const customDate = smartRefinements ? readDesign16Date(params.get("appointmentDate") ?? "", availabilityNow) : "";
  const filters = customDate ? { ...listingFilters, availability: "any" as const } : listingFilters;
  const catalogFilters = readCatalogFilters(params, tab.id);
  const localDoctorSearch = isDesign17 && tab.id === "doctors";
  const live = Boolean(query.trim()) && !localDoctorSearch;
  const request = useDesign3Search(localDoctorSearch ? "" : query, location);
  const apiCategory = tab.id !== "hospitals" && tab.id !== "packages_tests";
  const loading = apiCategory && request.loading;
  const error = apiCategory && request.error;
  const doctorTab = tab.id === "doctors";
  const selectedSpeciality = filters.specialties.length === 1 ? filters.specialties[0] : undefined;
  const selectedCity = DOCTOR_LANDING_CITIES.find(item => item.value === location);
  const doctorCopy = getDoctorListingCopy({ specialties: filters.specialties, city: selectedCity });
  const { isUserLoggedIn } = useAuthState();
  const sessionBookedDoctors = useDesign3BookedDoctors(doctorTab && (smartRefinements || !live) && isUserLoggedIn);
  const bookedDoctors = useMemo(() => design17ConsultationHistory(sessionBookedDoctors, {
    variant: previewVariant, live, authenticated: doctorTab && isUserLoggedIn,
  }), [sessionBookedDoctors, previewVariant, live, doctorTab, isUserLoggedIn]);
  const historyLabel = isDesign17 ? "Previously consulted" : "Previously booked";
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const detailsBookingUrl = useRef<string | null>(null);
  const [historyLogin, setHistoryLogin] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState<DoctorListingItem | null>(null);
  const [itemDetails, setItemDetails] = useState<SearchResultItem | null>(null);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [draftDoctors, setDraftDoctors] = useState(emptyDoctorFilters);
  const [draftDate, setDraftDate] = useState("");
  const [draftHistory, setDraftHistory] = useState(false);
  const [draftCatalog, setDraftCatalog] = useState(emptyCatalogFilters);
  const [visible, setVisible] = useState(16);
  const [nearestUnits, setNearestUnits] = useState<Record<string, string>>({});
  const previouslyBooked = smartRefinements && isUserLoggedIn && params.get("previouslyBooked") === "true";
  // Keep badges, date filters, ordering and counts in sync as slots expire.
  useEffect(() => {
    if (!doctorTab || live) return;
    const refresh = () => refreshAvailability(new Date());
    const timer = window.setInterval(refresh, 60_000);
    const resume = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [doctorTab, live]);
  const moreRef = useRef<HTMLDivElement>(null);
  const returnToTopPending = useRef(false);
  const returnToResultsTop = useCallback(() => {
    if (!returnToTopPending.current) return;
    returnToTopPending.current = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    // Keep keyboard focus and the sidebar's own scroll position intact. Use the
    // site's scroll controller so its previous momentum cannot override this.
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(0, { duration: .4, immediate: reducedMotion });
    } else window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }, []);

  const doctors = localDoctorSearch ? searchDesign17Directory(design16DoctorsInLocation(directory, location), query, previewVariant === "d20" ? design20SearchableIds : undefined)
    : live ? (request.data?.doctors ?? []).map(fromApiDoctor)
    : smartRefinements ? design16DoctorsInLocation(directory, location)
    : directory.filter((doctor) => location === "All" || getCityId(doctor.city) === getCityId(location));
  const filteredResults = smartRefinements
    ? refineDesign16Doctors(doctors, filters, mode, sort, customDate, previouslyBooked, bookedDoctors, availabilityNow, nearestUnits, scheduleContext)
    : sortDoctors(filterDoctors(doctors, filters, mode), sort, mode).map((doctor) => withSelectedDoctorHospital(doctor, filters.hospitals));
  // A direct Book action has a specific doctor intent. Keep that card available
  // while booking, even when prior directory filters would otherwise hide it.
  const entryDoctor = previewVariant === "d20" && bookingId && !filteredResults.some(doctor => doctor.id === bookingId)
    ? getDesign20ProfileDoctor(bookingId, cardSelectionParams) : null;
  const results = entryDoctor ? [entryDoctor, ...filteredResults] : filteredResults;
  const hasDates = smartRefinements && hasDesign16Availability(doctors, mode, availabilityNow, scheduleContext);
  const recovery = smartRefinements && !loading && !error && !results.length && (customDate || filters.availability !== "any")
    ? findDesign16NextAvailability(doctors, filters, mode, customDate, previouslyBooked, bookedDoctors, availabilityNow, scheduleContext) : null;
  const catalog = catalogResults(catalogs, query, location, request.data);
  const items = doctorTab ? [] : filterCatalog(catalog[tab.id as Exclude<SearchTabId, "doctors">], catalogFilters);
  const currentItems = doctorTab ? [] : catalog[tab.id as Exclude<SearchTabId, "doctors">];
  const total = doctorTab ? results.length : items.length;
  const shownDoctors = isDesign19 && bookingId ? Math.max(visible, results.findIndex(doctor => doctor.id === bookingId) + 1) : visible;
  const filterCount = doctorTab ? activeFilterCount(filters) + Number(Boolean(customDate)) + Number(previouslyBooked) : Object.values(catalogFilters).flat().length;

  const chooseNearestUnit = (doctorId: string, hospital: string) => {
    const selected = { ...nearestUnits, [doctorId]: hospital };
    const reordered = refineDesign16Doctors(doctors, filters, mode, sort, customDate, previouslyBooked, bookedDoctors, availabilityNow, selected, scheduleContext);
    setNearestUnits(selected);
    // Keep a manually changed card mounted even if its new distance moves it
    // beyond the current batch, preserving its location-control focus.
    setVisible(count => Math.max(count, reordered.findIndex(doctor => doctor.id === doctorId) + 1));
  };

  const navigate = (url: string, replace = false) => {
    if (url.split("?")[0] !== pathname) {
      // Resolve a new server route so metadata and back/forward state stay correct.
      // Same-page refinements keep native history for instant, focus-preserving edits.
      router[replace ? "replace" : "push"](url);
    } else window.history[replace ? "replaceState" : "pushState"](null, "", url);
  };
  const update = (change: (next: URLSearchParams) => void, replace = false, returnToTop = false) => {
    const next = doctorListingParams(pathname, window.location.search);
    next.delete("tab"); next.delete("city"); next.delete("cityId"); next.delete("search"); next.delete("query");
    next.set("design", previewVariant);
    if (isDesign19) {
      for (const key of ["booking", "bookingMode", "bookingResume", "hospital", "date", "step", "ref"]) next.delete(key);
      openedHere.current = false;
      visitedCards.current.clear();
      setResumeCard(false);
    }
    if (query) next.set("q", query);
    if (location !== "All") next.set("location", location);
    change(next);
    if (doctorTab && returnToTop) returnToTopPending.current = true;
    navigate(doctorTab ? doctorListingUrl(pathname, next) : `${getSearchTabPath(tab.id)}?${next}`, replace);
  };
  const changeDoctorFilters = (nextFilters: DoctorFilterValues) => update((next) => {
    for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) { next.delete(key); nextFilters[key].forEach((value) => next.append(key, value)); }
    next.delete("availability");
    if (nextFilters.availability !== "any") next.set("availability", nextFilters.availability);
    if (smartRefinements && nextFilters.availability !== filters.availability) next.delete("appointmentDate");
  }, false, true);
  const changeCatalogFilters = (nextFilters: CatalogFilterValues) => update((next) => {
    for (const key of ["letters", "types", "hospitals", "genders"] as const) { next.delete(`${tab.id}.${key}`); nextFilters[key].forEach((value) => next.append(`${tab.id}.${key}`, value)); }
  });
  const clearFilters = () => doctorTab ? update((next) => {
    Object.keys(emptyDoctorFilters()).forEach((key) => next.delete(key));
    if (smartRefinements) { next.delete("appointmentDate"); next.delete("previouslyBooked"); }
  }, false, true) : changeCatalogFilters(emptyCatalogFilters());
  const changeDate = (date: string) => update(next => {
    next.delete("availability"); next.delete("appointmentDate");
    if (date) next.set("appointmentDate", date);
  }, false, true);
  const setHistory = (value: boolean) => update(next => { if (value) next.set("previouslyBooked", "true"); else next.delete("previouslyBooked"); }, false, true);
  const changeHistory = () => {
    if (isUserLoggedIn) setHistory(!previouslyBooked);
    else setHistoryLogin(true);
  };
  const dateLabel = (date: string) => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
  const clearDate = () => changeDate("");
  const clearDraftDate = () => setDraftDate("");
  const clearHistory = () => setHistory(false);
  const clearDraftHistory = () => setDraftHistory(false);
  const appliedExtraChips = [
    ...(customDate ? [{ key: "appointmentDate", label: dateLabel(customDate), remove: clearDate }] : []),
    ...(previouslyBooked ? [{ key: "previouslyBooked", label: historyLabel, remove: clearHistory }] : []),
  ];
  const draftExtraChips = [
    ...(draftDate ? [{ key: "appointmentDate", label: dateLabel(draftDate), remove: clearDraftDate }] : []),
    ...(draftHistory ? [{ key: "previouslyBooked", label: historyLabel, remove: clearDraftHistory }] : []),
  ];
  const openFilters = () => { setDraftDoctors(filters); setDraftDate(customDate); setDraftHistory(previouslyBooked); setDraftCatalog(catalogFilters); setFilterDrawer(true); };
  const continueBooking = (url: string) => {
    if (isUserLoggedIn) router.push(url); else setPendingUrl(url);
  };
  const book = (event: MouseEvent, doctor: DoctorListingItem, selectedMode: ConsultationMode, includeSlot: boolean) => {
    event.preventDefault();
    // The search endpoint has no verified appointment/profile detail contract.
    // Keep unknown IDs out of the legacy synthetic profile fallback.
    if (live) { setDoctorDetails(doctor); return; }
    if (isDesign19) {
      setResumeCard(visitedCards.current.has(doctor.id));
      visitedCards.current.add(doctor.id);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("bookingResume");
      next.set("design", previewVariant); next.set("booking", doctor.id); next.set("bookingMode", selectedMode); next.set("hospital", doctor.hospital);
      const cardDate = previewVariant === "d20" && event.currentTarget instanceof HTMLAnchorElement
        ? new URL(event.currentTarget.href).searchParams.get("date") : null;
      if (customDate || cardDate) next.set("date", customDate || cardDate!); else next.delete("date");
      if (bookingId) window.history.replaceState(null, "", `${pathname}?${next}`);
      else { openedHere.current = true; window.history.pushState(null, "", `${pathname}?${next}`); }
      return;
    }
    if (isDesign18) {
      workspacePosition.current = { scroll: window.scrollY, doctorId: doctor.id };
      openedHere.current = true;
      const next = new URLSearchParams(searchParams.toString());
      next.set("design", "d18"); next.set("booking", doctor.id); next.set("mode", selectedMode); next.set("hospital", doctor.hospital);
      if (customDate) next.set("date", customDate); else next.delete("date");
      window.history.pushState(null, "", `${pathname}?${next}`);
      return;
    }
    // A chosen day carries forward without selecting an appointment time.
    const url = isDesign17 ? design17BookingUrl(doctor, selectedMode, customDate, availabilityNow, previewVariant === "d17-lite" ? "d17-lite" : "d17", listingReturnTo)
      : `${bookingUrl(doctor, selectedMode, includeSlot)}&design=${previewVariant}`;
    if (isDesign17 && doctorDetails) {
      // Finish closing the native details dialog before opening the login modal.
      detailsBookingUrl.current = url;
      setDoctorDetails(null);
    } else continueBooking(url);
  };
  const stateKey = isDesign18 || isDesign19 ? listingReturnTo : `${pathname}?${searchParams}`;
  useEffect(() => { setVisible(16); setFilterDrawer(false); }, [stateKey, tab.id]);
  useEffect(() => {
    if (!doctorTab || filterDrawer || !returnToTopPending.current) return;
    const frame = requestAnimationFrame(() => {
      // A mobile drawer keeps Lenis stopped until its exit animation completes.
      // AnimatePresence's onExitComplete handles that case after cleanup.
      if (!document.querySelector("dialog[open]")) returnToResultsTop();
    });
    return () => cancelAnimationFrame(frame);
  }, [stateKey, doctorTab, filterDrawer, returnToResultsTop]);
  useEffect(() => {
    const element = moreRef.current;
    // Reveal the next batch shortly before the user reaches the current end.
    if (!element || loading || error || visible >= total) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible((value) => Math.min(value + 16, total)); }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [total, visible, loading, error]);

  const dateFilteredDoctors = (draft: boolean) => smartRefinements ? refineDesign16Doctors(doctors.map(doctor => withSelectedDoctorHospital(doctor, (draft ? draftDoctors : filters).hospitals)),
    { ...emptyDoctorFilters(), availability: (draft ? draftDoctors : filters).availability },
    mode, "relevance", draft ? draftDate : customDate, draft ? draftHistory : previouslyBooked, bookedDoctors, availabilityNow, {}, scheduleContext) : undefined;
  const renderFilters = (draft: boolean) => doctorTab
    ? <DoctorFilters doctors={doctors} matchingDoctors={dateFilteredDoctors(draft)} value={draft ? draftDoctors : filters} onChange={draft ? (value) => { setDraftDoctors(value); if (value.availability !== draftDoctors.availability) setDraftDate(""); } : changeDoctorFilters}
        showResultCounts={!isDesign17} availabilityEnabled={smartRefinements ? hasDates : doctors.some((doctor) => Boolean(doctor.availability[mode]))} mode={mode} />
    : <CatalogFilters tab={tab.id} items={currentItems} value={draft ? draftCatalog : catalogFilters} onChange={draft ? setDraftCatalog : changeCatalogFilters} />;
  const draftCount = doctorTab ? (smartRefinements ? refineDesign16Doctors(doctors, draftDoctors, mode, sort, draftDate, draftHistory, bookedDoctors, availabilityNow, {}, scheduleContext).length : filterDoctors(doctors, draftDoctors, mode).length) : filterCatalog(currentItems, draftCatalog).length;
  const sample = !live || !apiCategory;

  return <div className={`${styles.page} ${doctorTab ? `${styles.doctorPage} ${ui.theme}` : ""}`} data-design={previewVariant} data-nav-theme="light">
    {doctorTab && <p id="d3-refinement-help" className={styles.srOnly}>Changing the city, consultation type, appointment order or applied filters updates the results and returns to the top of the page.</p>}
    {!workspaceOpen && (doctorTab ? <DoctorSearchTop compactMobile={isDesign17} hideTotal={isDesign17} locationFirst={smartRefinements} query={query} location={location} total={total} mode={mode} heading={doctorCopy.heading} summary={doctorCopy.summary}
      loading={loading} error={error} filterCount={filterCount} onOpenFilters={openFilters}
      onQuery={(value) => update((next) => { if (value) next.set("q", value); else next.delete("q"); }, true)}
      onLocation={(value) => update((next) => { next.delete("location"); if (value !== "All") next.set("location", value); if (smartRefinements && next.get("sort") === "nearest") next.delete("sort"); }, false, true)}>
      {smartRefinements ? <Design16Refinements compactMobile={isDesign17} videoSmartFilter={previewVariant === "d20"} onOpenFilters={openFilters} filterCount={filterCount} location={location} mode={mode} sort={sort} filters={filters} date={customDate}
        minDate={indiaDate(availabilityNow)} maxDate={indiaDate(availabilityNow, DESIGN16_BOOKING_DAYS - 1)} hasDates={hasDates} loading={loading} error={error}
        historyRequiresLogin={!isUserLoggedIn} historySelected={previouslyBooked} historyLabel={historyLabel}
        onNearMe={city => { setNearestUnits({}); update(next => { next.set("location", city); next.set("sort", "nearest"); }, false, true); }}
        onModeChange={value => update(next => { next.set("mode", value); if (value === "video" && next.get("sort") === "nearest") next.delete("sort"); }, false, true)}
        onSortChange={value => { if (value === "nearest") setNearestUnits({}); update(next => { if (value === "relevance") next.delete("sort"); else next.set("sort", value); }, false, true); }}
        onFiltersChange={changeDoctorFilters} onDateChange={changeDate} onHistoryChange={changeHistory}>
        <LanguageShortcut doctors={doctors} matchingDoctors={dateFilteredDoctors(false)} filters={filters} mode={mode} location={location} now={availabilityNow} requireSuppliedLanguage={previewVariant === "d20"} onChange={changeDoctorFilters} />
        <ExpertiseShortcuts doctors={doctors} matchingDoctors={dateFilteredDoctors(false)} filters={filters} mode={mode} query={query} onChange={changeDoctorFilters} />
      </Design16Refinements> : <DoctorListingControls mode={mode} sort={sort} filters={filters}
        onModeChange={(value) => { if (value !== mode) update((next) => next.set("mode", value), false, true); }}
        onSortChange={(value) => { if (value !== sort) update((next) => { if (value === "relevance") next.delete("sort"); else next.set("sort", value); }, false, true); }}
        onFiltersChange={changeDoctorFilters} loading={loading} error={error} hasDoctors={doctors.length > 0}
        hasSlots={doctors.some((doctor) => Boolean(doctor.availability[mode]))} />}
    </DoctorSearchTop>
      : <SearchHeader query={query} location={location}
      onQuery={(value) => update((next) => { if (value) next.set("q", value); else next.delete("q"); }, true)}
      onLocation={(value) => update((next) => { next.delete("location"); if (value !== "All") next.set("location", value); })} />)}
    <div className={styles.container}>
      {!doctorTab && <header className={styles.heading}>
        <div><p className={styles.eyebrow}>Care that’s right for you</p><h1 id="d3-results-title" tabIndex={-1}>{titles[tab.id]}</h1>
          <p className={styles.context}>{query.trim() ? <>Results for <strong>“{query.trim()}”</strong> · </> : null}{location === "All" ? "Across Narayana Health" : location}</p>
        </div>
        <button type="button" className={styles.mobileFilter} onClick={openFilters} aria-haspopup="dialog"><Filter size={18} aria-hidden />Filters{filterCount > 0 && <span>{filterCount}</span>}</button>
      </header>}
      <div className={`${styles.layout} ${workspaceOpen ? `${workspaceStyles.workspaceLayout} ${workspaceStyles.listingWorkspace}` : ""}`}>
        <aside className={`${styles.sidebar} ${workspaceOpen ? workspaceStyles.hidden : ""}`} aria-label={`${tab.label} filters`} aria-describedby={doctorTab ? "d3-refinement-help" : undefined} data-lenis-prevent data-d3-ui>
          <div className={styles.filterHeading}><h2><Filter size={16} aria-hidden />Filters</h2>{!(doctorTab && smartRefinements) && <button type="button" disabled={filterCount === 0} aria-hidden={filterCount === 0}
            onClick={(event) => { clearFilters(); event.currentTarget.closest("aside")?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus({ preventScroll: true }); }}>Clear all</button>}</div>
          <FilterScrollArea key={tab.id}>{doctorTab && smartRefinements && <SidebarDoctorFilters value={filters} onChange={changeDoctorFilters} onClearAll={clearFilters} extraChips={appliedExtraChips} />}{renderFilters(false)}</FilterScrollArea>
        </aside>
        <section className={styles.results} aria-label={tab.label}>
          {workspaceOpen && activeBooking && <BookingWorkspace key={activeBooking.id} doctor={activeBooking} initialSelection={design17RequestedSelection(activeBooking, new URLSearchParams(searchParams.toString()))} returnTo={listingReturnTo!} onClose={closeWorkspace} />}
          <div hidden={workspaceOpen} inert={workspaceOpen} className={workspaceOpen ? workspaceStyles.hidden : undefined}>
          {!doctorTab && filterCount > 0 && <div className={styles.chips}>{(Object.keys(catalogFilters) as (keyof CatalogFilterValues)[]).flatMap((key) => catalogFilters[key].map((value) => <button type="button" key={`${key}-${value}`} aria-label={`Remove filter: ${value}`} onClick={() => changeCatalogFilters({ ...catalogFilters, [key]: catalogFilters[key].filter((item) => item !== value) })}>{value}<X size={14} aria-hidden /></button>))}</div>}
          {!doctorTab && <div className={styles.resultMeta}><p role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : <><strong>{total}</strong> {total === 1 ? "result" : "results"}</>}</p>
            {sample && <span className={styles.sample}><Info size={14} aria-hidden />Sample directory</span>}
          </div>}
          {!sample && doctorTab && !loading && !error && <p className={styles.dataNote}>Contact NH to confirm appointment times and consultation fees.</p>}
          <div className={`${styles.grid} ${doctorTab ? gridClassName || styles.doctorGrid : ""}`} aria-busy={loading}>
            {loading ? <ResultSkeletons doctors={doctorTab} /> : error || !total ? <SearchState recovery={recovery ? { message: `The next matching appointments are on ${dateLabel(recovery.date)}. Your other filters will stay selected.`, label: `View ${dateLabel(recovery.date)}`, onApply: () => changeDate(recovery.date) } : undefined}
              emptyState={previouslyBooked ? {
                title: bookedDoctors.size ? `No ${historyLabel.toLowerCase()} doctors match` : `No ${historyLabel.toLowerCase()} doctors yet`,
                message: bookedDoctors.size ? `Try another location or remove a filter to find a doctor you’ve ${isDesign17 ? "consulted" : "booked"} before.` : "Doctors you book will appear here, making your next visit easier.",
                action: "Browse doctors",
              } : undefined}
              error={error} filtered={filterCount > 0} onRetry={request.retry} onReset={previouslyBooked ? () => setHistory(false) : filterCount ? clearFilters : () => update((next) => { next.delete("q"); next.delete("location"); })} />
              : doctorTab ? results.slice(0, shownDoctors).map((doctor, index) => <Card key={smartRefinements ? `${doctor.id}:${sort === "nearest"}` : doctor.id} doctor={doctor} mode={mode} live={live} bookedEarlier={bookedDoctors.has(doctor.id)} demoBookedEarlier={!smartRefinements && !live && (doctor.id === doctors[1]?.id || doctor.id === doctors[3]?.id)} onBook={book} onDetails={setDoctorDetails} priority={isDesign17 && index < 3} bookingDate={isDesign17 ? customDate : undefined}
                listingReturnTo={listingReturnTo} cardDesign={cardDesign} focusTerms={isDesign17 ? [...filters.expertise, query] : undefined}
                active={isDesign19 && bookingId === doctor.id} onClose={isDesign19 ? closeBookingCard : undefined} initialSelection={isDesign19 && bookingId === doctor.id ? activeCardSelection : undefined} resume={isDesign19 && resumeCard}
                onHospitalChange={smartRefinements && sort === "nearest" ? hospital => chooseNearestUnit(doctor.id, hospital) : undefined} />)
                : items.slice(0, visible).map((item) => <ResultCard key={item.id} item={item} onDetails={() => setItemDetails(item)} />)}
          </div>
          {doctorTab && <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{!loading && !error && visible > 16 ? (isDesign17 ? "More doctors loaded" : `Showing ${Math.min(visible, total)} of ${total} doctors`) : ""}</p>}
          {!loading && !error && total > 0 && <div ref={moreRef} className={styles.more} data-d3-ui>{!(doctorTab && isDesign17) && <p>Showing {Math.min(visible, total)} of {total}</p>}{!doctorTab && visible < total && <button type="button" className={styles.secondaryButton} onClick={() => setVisible((value) => Math.min(value + 16, total))}>Show more results</button>}</div>}
          {doctorTab && <div hidden={loading || error || visible < total}>
            <DoctorListingFAQ speciality={selectedSpeciality} city={selectedCity?.label} />
          </div>}
          </div>
        </section>
      </div>
    </div>
    <AnimatePresence onExitComplete={() => { requestAnimationFrame(() => {
      returnToResultsTop();
      const url = detailsBookingUrl.current;
      if (url) { detailsBookingUrl.current = null; continueBooking(url); }
    }); }}>
    {filterDrawer && <SearchDialog key="filters" title={doctorTab && isDesign17 ? "Filters" : "Refine your search"} mobileOnly doctorPreview={doctorTab} onClose={() => setFilterDrawer(false)} footer={<>
      {doctorTab && <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : isDesign17 ? (draftCount ? "Matching doctors available" : "No matching doctors") : `${draftCount} ${draftCount === 1 ? "doctor matches" : "doctors match"} your filters`}</span>}
      {!(doctorTab && smartRefinements) && <button type="button" className={styles.secondaryButton} disabled={doctorTab ? (activeFilterCount(draftDoctors) === 0 && !draftDate && !draftHistory) : Object.values(draftCatalog).every((values) => values.length === 0)} onClick={() => { if (doctorTab) { setDraftDoctors(emptyDoctorFilters()); setDraftDate(""); setDraftHistory(false); } else setDraftCatalog(emptyCatalogFilters()); }}>Clear all</button>}
      <button type="button" className={styles.primaryButton} onClick={() => { if (doctorTab && smartRefinements) update(next => {
        for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) { next.delete(key); draftDoctors[key].forEach(value => next.append(key, value)); }
        next.delete("availability"); next.delete("appointmentDate"); next.delete("previouslyBooked");
        if (draftDate) next.set("appointmentDate", draftDate);
        else if (draftDoctors.availability !== "any") next.set("availability", draftDoctors.availability);
        if (draftHistory) next.set("previouslyBooked", "true");
      }, false, true); else if (doctorTab) changeDoctorFilters(draftDoctors); else changeCatalogFilters(draftCatalog); setFilterDrawer(false); }}>{doctorTab && isDesign17 ? "Show doctors" : <>Show {draftCount} {doctorTab && smartRefinements ? (draftCount === 1 ? "doctor" : "doctors") : (draftCount === 1 ? "result" : "results")}</>}</button>
    </>}>{doctorTab && smartRefinements && <SidebarDoctorFilters value={draftDoctors} onChange={setDraftDoctors} onClearAll={() => { setDraftDoctors(emptyDoctorFilters()); setDraftDate(""); setDraftHistory(false); }} extraChips={draftExtraChips} />}{renderFilters(true)}</SearchDialog>}
    {doctorDetails && <SearchDialog key="doctor-details" title={doctorDetails.name} doctorPreview={doctorTab} onClose={() => setDoctorDetails(null)} footer={isDesign17 && !live && doctorDetails.modes[mode] === true && directory.some(doctor => doctor.id === doctorDetails.id)
      ? <button type="button" className={styles.primaryButton} onClick={event => book(event, doctorDetails, mode, false)}>Book appointment <ArrowRight size={16} aria-hidden /></button>
      : <a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden />Contact NH</a>}>
      {isDesign17 ? <Design17DoctorDetails doctor={doctorDetails} mode={mode} /> : <>
      <p>{doctorDetails.speciality || "Speciality information unavailable"}</p>{doctorDetails.degrees && <p>{doctorDetails.degrees}</p>}
      {doctorDetails.hospital && <p>{doctorDetails.hospital}</p>}
      {getDesign3CityDoctor(doctorDetails.id) ? previewVariant !== "d16" && <p>This fictional doctor, hospital, fee and availability are for the Design {previewVariant.slice(1)} booking preview only.</p>
        : live ? <p>Appointment times, fees and full profile details are currently unavailable here. Contact Narayana Health to confirm before booking.</p>
        : <p><Link className={styles.textLink} href={`/doctors/${encodeURIComponent(doctorDetails.id)}?design=${previewVariant}`}>View doctor profile <ArrowRight size={16} aria-hidden /></Link></p>}
      </>}
    </SearchDialog>}
    {itemDetails && <SearchDialog key="item-details" title={itemDetails.name} onClose={() => setItemDetails(null)} footer={<a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden />Contact NH</a>}>
      <p>{itemDetails.description || "Further details are currently unavailable."}</p>{itemDetails.hospital && <p>{itemDetails.hospital}</p>}
      {itemDetails.inclusions && <ul className={styles.detailList}>{itemDetails.inclusions.map((value) => <li key={value}>{value}</li>)}</ul>}
      {itemDetails.price && <p>Listed price: {itemDetails.price}. Please confirm with NH before booking.</p>}
      <p>{tab.id === "packages_tests" ? "Online booking for this package or test is currently unavailable here." : "Contact Narayana Health for further information."}</p>
    </SearchDialog>}
    </AnimatePresence>
    {pendingUrl && <LoginModal previewOtp={previewVariant === "d20"} isOpen manageFocus onClose={() => setPendingUrl(null)} onLoginSuccess={() => { const url = pendingUrl; setPendingUrl(null); router.push(url); }} />}
    {historyLogin && <LoginModal previewOtp={previewVariant === "d20"} isOpen manageFocus purpose="history" onClose={() => setHistoryLogin(false)} onLoginSuccess={() => { setHistoryLogin(false); setHistory(true); }} />}
    {!workspaceOpen && !(isDesign19 && bookingId) && <DesignSwitcher scope="search-top" currentVariant={previewVariant} onVariantChange={(variant) => {
      const next = new URLSearchParams(params);
      next.set("design", variant);
      router.replace(`${getSearchTabPath(landing ? "doctors" : tab.id)}?${next}`, { scroll: false });
    }} />}
  </div>;
}
