"use client";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { DESIGN16_BOOKING_DAYS,indiaDate } from "@/features/booking/appointmentTime";
import { design20ListingReturnTo,design20RequestedSelection } from "@/features/booking/design20/model";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { getDesign16LanguageShortcut } from "@/features/search/design16Language";
import { design16DoctorsInLocation,hasDesign16Availability,readDesign16Date } from "@/features/search/design16Refinements";
import { design17BookingUrl } from "@/features/search/design17Booking";
import { design17ConsultationHistory } from "@/features/search/design17ConsultationHistory";
import { searchDesign17Directory } from "@/features/search/design17DirectorySearch";
import { design20Directory,design20SearchableIds,getDesign20BookingDoctor,getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design21CardMode,design21FilterRecovery,findDesign21NextAvailability,incompatibleHospitalFilters,refineDesign21Doctors } from "@/features/search/design21Filters";
import { catalogResults,emptyCatalogFilters,filterCatalog,readCatalogFilters,readSearchLocation,type CatalogFilters as CatalogFilterValues,type SearchCatalogs,type SearchResultItem } from "@/features/search/design3Data";
import { DOCTOR_LANDING_CITIES,getDoctorLandingContext,getDoctorListingCopy } from "@/features/search/doctorLandingPages";
import { activeFilterCount,emptyDoctorFilters,fromApiDoctor,readListingParams,withSelectedDoctorHospital,type ConsultationMode,type DoctorFilters as DoctorFilterValues,type DoctorListingItem } from "@/features/search/doctorListing";
import { doctorListingParams,doctorListingUrl } from "@/features/search/doctorListingNavigation";
import { getSearchTabById,getSearchTabFromPathname,getSearchTabPath,type SearchTabId } from "@/features/search/searchTabs";
import { useDesign3BookedDoctors } from "@/features/search/useDesign3BookedDoctors";
import { useDesign3Search } from "@/features/search/useDesign3Search";
import { AnimatePresence } from "framer-motion";
import type Lenis from "lenis";
import { ArrowRight,Filter,Info,PhoneCall,X } from "lucide-react";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import { useCallback,useEffect,useMemo,useRef,useState,type ComponentProps,type ComponentType,type MouseEvent } from "react";
import DoctorFilters from "../../doctors/DoctorFilters";
import LanguageShortcut from "../d16/LanguageShortcut";
import Design17DoctorDetails from "../d17/DoctorDetails";
import DoctorCard from "../d20/DoctorCard";
import AppliedFilterSummary from "../d21/AppliedFilterSummary";
import d21 from "../d21/Design21Filters.module.css";
import Design21Refinements from "../d21/Design21Refinements";
import FilterSearch from "../d21/FilterSearch";
import ListingBackdropPreview from "../d21/ListingBackdropPreview";
import CatalogFilters from "./CatalogFilters";
import styles from "./Design3SearchResults.module.css";
import DoctorListingFAQ from "./DoctorListingFAQ";
import ui from "@/components/ui/search-location/SearchTheme.module.css";
import DoctorSearchTop from "./DoctorSearchTop";
import FilterScrollArea from "./FilterScrollArea";
import ResultCard from "./ResultCard";
import SearchDialog from "./SearchDialog";
import SearchHeader from "./SearchHeader";
import SearchState,{ ResultSkeletons } from "./SearchState";
import SidebarDoctorFilters from "./SidebarDoctorFilters";
const titles: Record<SearchTabId, string> = {
    doctors: "Find the right doctor", hospitals: "Find a hospital or clinic", specialties: "Explore our specialities",
    treatments: "Explore treatments & procedures", packages_tests: "Health packages & tests", articles: "Health articles & insights",
};
interface Props {
    catalogs: SearchCatalogs;
    previewVariant?: "d20" | "d21";
    cardComponent?: ComponentType<ComponentProps<typeof DoctorCard> & {
        priority?: boolean;
        bookingDate?: string;
        focusTerms?: string[];
        cardDesign?: "d17" | "d17-lite" | "d18" | "d19" | "d20";
        listingReturnTo?: string;
        active?: boolean;
        onClose?: () => void;
        initialSelection?: AppointmentSelection;
        resume?: boolean;
    }>;
    gridClassName?: string;
}
export default function Design3SearchResults({ catalogs, cardComponent: Card = DoctorCard, gridClassName = "" }: Props) {
    const Refinements = Design21Refinements;
    const refineDoctors = refineDesign21Doctors;
    const directory = design20Directory;
    const scheduleContext = "d20";
    const searchParams = useSearchParams();
    const listingPreview = searchParams.get("listingPreview") === "1" ? "1" : "2";
    const pathname = usePathname();
    const router = useRouter();
    const landing = getDoctorLandingContext(pathname);
    const params = doctorListingParams(pathname, searchParams.toString());
    const legacyTab = pathname === "/search" ? getSearchTabById(params.get("tab")) : undefined;
    const tab = legacyTab ?? getSearchTabFromPathname(pathname);
    if (tab.id === "doctors") params.set("design", "d21");
    const query = params.get("q") ?? params.get("search") ?? params.get("query") ?? "";
    const location = readSearchLocation(params);
    const { filters: listingFilters, mode, sort } = readListingParams(params);
    const [availabilityNow, refreshAvailability] = useState(() => new Date());
    const listingReturnToForCard = design20ListingReturnTo;
    const listingReturnTo = listingReturnToForCard(`${pathname}?${searchParams}`);
    const bookingId = searchParams.get("booking");
    const bookingSource = bookingId ? (getDesign20BookingDoctor(bookingId)) : null;
    const activeBooking = bookingSource ? { ...bookingSource, name: presentationDoctorName(bookingSource.name) } : null;
    const previousBooking = useRef<string | null>(null);
    const openedHere = useRef(false);
    const closingPreview = useRef<"1" | "2" | null>(null);
    const visitedCards = useRef(new Set<string>());
    const [resumeCard, setResumeCard] = useState(false);
    useEffect(() => {
        const preservePreviewOnClose = () => {
            const preview = closingPreview.current;
            closingPreview.current = null;
            if (!preview || window.location.pathname !== pathname) return;
            const url = new URL(window.location.href);
            if ((url.searchParams.get("listingPreview") === "1" ? "1" : "2") === preview) return;
            url.searchParams.set("listingPreview", preview);
            window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
        };
        window.addEventListener("popstate", preservePreviewOnClose);
        return () => {
            window.removeEventListener("popstate", preservePreviewOnClose);
            closingPreview.current = null;
        };
    }, [pathname]);
    const closeBookingCard = () => {
        if (openedHere.current) {
            openedHere.current = false;
            // Collapse the booking history entry without reverting a presentation
            // choice made while its slot picker was open.
            closingPreview.current = listingPreview;
            window.history.back();
        }
        else
            window.history.replaceState(null, "", listingReturnTo ?? "/search/doctors?design=d21");
    };
    useEffect(() => {
        const previous = previousBooking.current;
        previousBooking.current = bookingId;
        if (bookingId) {
            visitedCards.current.add(bookingId);
            // Direct entry and Edit details return to the selected card. An ordinary
            // Book click keeps its exact current position and never scrolls the page.
            if (!openedHere.current) {
                const frame = requestAnimationFrame(() => {
                    const card = document.querySelector<HTMLElement>(`[data-booking-card="${CSS.escape(bookingId)}"]`);
                    if (!card)
                        return;
                    const top = Math.max(0, window.scrollY + card.getBoundingClientRect().top - parseFloat(getComputedStyle(card).scrollMarginTop));
                    const lenis = (window as Window & {
                        __lenis?: Lenis;
                    }).__lenis;
                    if (lenis)
                        lenis.scrollTo(top, { immediate: true });
                    else
                        window.scrollTo({ top, behavior: "instant" });
                });
                return () => cancelAnimationFrame(frame);
            }
        }
        if (!bookingId && previous) {
            const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-book-doctor="${CSS.escape(previous)}"]`)?.focus({ preventScroll: true }));
            return () => cancelAnimationFrame(frame);
        }
    }, [bookingId]);
    const cardSelectionParams = new URLSearchParams(searchParams.toString());
    if (searchParams.get("bookingMode"))
        cardSelectionParams.set("mode", searchParams.get("bookingMode")!);
    const activeCardSelection = activeBooking
        ? (design20RequestedSelection)(activeBooking, cardSelectionParams) : undefined;
    const customDate = readDesign16Date(params.get("appointmentDate") ?? "", availabilityNow);
    const filters = customDate ? { ...listingFilters, availability: "any" as const } : listingFilters;
    const catalogFilters = readCatalogFilters(params, tab.id);
    const localDoctorSearch = tab.id === "doctors";
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
    const sessionBookedDoctors = useDesign3BookedDoctors(doctorTab && true && isUserLoggedIn);
    const bookedDoctors = useMemo(() => design17ConsultationHistory(sessionBookedDoctors, {
        variant: "d21", live, authenticated: doctorTab && isUserLoggedIn,
    }), [sessionBookedDoctors, live, doctorTab, isUserLoggedIn]);
    const historyLabel = "Previously booked";
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const detailsBookingUrl = useRef<string | null>(null);
    const [historyLogin, setHistoryLogin] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState<DoctorListingItem | null>(null);
    const [itemDetails, setItemDetails] = useState<SearchResultItem | null>(null);
    const [filterDrawer, setFilterDrawer] = useState(false);
    const [filterQuery, setFilterQuery] = useState("");
    const [draftFilterQuery, setDraftFilterQuery] = useState("");
    const [draftDoctors, setDraftDoctors] = useState(emptyDoctorFilters);
    const [draftVideo, setDraftVideo] = useState(false);
    const filterMode = mode !== "video" ? "all" as const : mode;
    const [draftDate, setDraftDate] = useState("");
    const [draftHistory, setDraftHistory] = useState(false);
    const [draftCatalog, setDraftCatalog] = useState(emptyCatalogFilters);
    const [visible, setVisible] = useState(16);
    const [nearestUnits, setNearestUnits] = useState<Record<string, string>>({});
    const previouslyBooked = isUserLoggedIn && params.get("previouslyBooked") === "true";
    // Keep badges, date filters, ordering and counts in sync as slots expire.
    useEffect(() => {
        if (!doctorTab || live)
            return;
        const refresh = () => refreshAvailability(new Date());
        const timer = window.setInterval(refresh, 60000);
        const resume = () => { if (document.visibilityState === "visible")
            refresh(); };
        document.addEventListener("visibilitychange", resume);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", resume);
        };
    }, [doctorTab, live]);
    const moreRef = useRef<HTMLDivElement>(null);
    const returnToTopPending = useRef(false);
    const returnToResultsTop = useCallback(() => {
        if (!returnToTopPending.current)
            return;
        returnToTopPending.current = false;
        {
            const results = document.getElementById("d21-result-count");
            if (results && results.getBoundingClientRect().top < 0)
                results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
            return;
        }
    }, []);
    const doctors = localDoctorSearch ? searchDesign17Directory(design16DoctorsInLocation(directory, location), query, design20SearchableIds)
        : live ? (request.data?.doctors ?? []).map(fromApiDoctor)
            : design16DoctorsInLocation(directory, location);
    const filteredResults = refineDoctors(doctors, filters, mode, sort, customDate, previouslyBooked, bookedDoctors, availabilityNow, nearestUnits, scheduleContext);
    // A direct Book action has a specific doctor intent. Keep that card available
    // while booking, even when prior directory filters would otherwise hide it.
    const entryDoctor = bookingId && !filteredResults.some(doctor => doctor.id === bookingId)
        ? getDesign20ProfileDoctor(bookingId, cardSelectionParams) : null;
    const results = entryDoctor ? [entryDoctor, ...filteredResults] : filteredResults;
    const hasDates = (hasDesign16Availability(doctors, mode, availabilityNow, scheduleContext) || (mode !== "video" && hasDesign16Availability(doctors, "video", availabilityNow, scheduleContext)));
    const incompatibleHospitals = incompatibleHospitalFilters(doctors, filters);
    const recovery = !loading && !error && !results.length && (customDate || filters.availability !== "any")
        ? (findDesign21NextAvailability(doctors, filters, mode, "relevance", customDate, previouslyBooked, bookedDoctors, availabilityNow)) : null;
    const filterRecovery = !results.length && !recovery ? design21FilterRecovery(doctors, filters, mode, sort, customDate, previouslyBooked, bookedDoctors, availabilityNow) : null;
    const catalog = catalogResults(catalogs, query, location, request.data);
    const items = doctorTab ? [] : filterCatalog(catalog[tab.id as Exclude<SearchTabId, "doctors">], catalogFilters);
    const currentItems = doctorTab ? [] : catalog[tab.id as Exclude<SearchTabId, "doctors">];
    const total = doctorTab ? results.length : items.length;
    const shownDoctors = bookingId ? Math.max(visible, results.findIndex(doctor => doctor.id === bookingId) + 1) : visible;
    const filterCount = doctorTab ? activeFilterCount(filters) + Number(Boolean(customDate)) + Number(previouslyBooked) + Number(mode === "video") : Object.values(catalogFilters).flat().length;
    const chooseNearestUnit = (doctorId: string, hospital: string) => {
        const selected = { ...nearestUnits, [doctorId]: hospital };
        const reordered = refineDoctors(doctors, filters, mode, sort, customDate, previouslyBooked, bookedDoctors, availabilityNow, selected, scheduleContext);
        setNearestUnits(selected);
        // Keep a manually changed card mounted even if its new distance moves it
        // beyond the current batch, preserving its location-control focus.
        setVisible(count => Math.max(count, reordered.findIndex(doctor => doctor.id === doctorId) + 1));
    };
    const navigate = (url: string, replace = false) => {
        if (url.split("?")[0] !== pathname) {
            // Resolve a new server route so metadata and back/forward state stay correct.
            // Same-page refinements keep native history for instant, focus-preserving edits.
            router[replace ? "replace" : "push"](url, { scroll: false });
        }
        else
            window.history[replace ? "replaceState" : "pushState"](null, "", url);
    };
    const update = (change: (next: URLSearchParams) => void, replace = false, returnToTop = false) => {
        const next = doctorListingParams(pathname, window.location.search);
        next.delete("tab");
        next.delete("city");
        next.delete("cityId");
        next.delete("search");
        next.delete("query");
        next.set("design", "d21");
        {
            for (const key of ["booking", "bookingMode", "bookingResume", "hospital", "date", "step", "ref"])
                next.delete(key);
            openedHere.current = false;
            visitedCards.current.clear();
            setResumeCard(false);
        }
        if (query)
            next.set("q", query);
        if (location !== "All")
            next.set("location", location);
        change(next);
        if (doctorTab && returnToTop && (filterDrawer))
            returnToTopPending.current = true;
        navigate(doctorTab ? doctorListingUrl(pathname, next) : `${getSearchTabPath(tab.id)}?${next}`, replace);
    };
    const changeDoctorFilters = (nextFilters: DoctorFilterValues) => update((next) => {
        for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
            next.delete(key);
            nextFilters[key].forEach((value) => next.append(key, value));
        }
        next.delete("availability");
        if (nextFilters.availability !== "any")
            next.set("availability", nextFilters.availability);
        if (nextFilters.availability !== filters.availability)
            next.delete("appointmentDate");
    }, false, true);
    const changeCatalogFilters = (nextFilters: CatalogFilterValues) => update((next) => {
        for (const key of ["letters", "types", "hospitals", "genders"] as const) {
            next.delete(`${tab.id}.${key}`);
            nextFilters[key].forEach((value) => next.append(`${tab.id}.${key}`, value));
        }
    });
    const clearFilters = () => doctorTab ? update((next) => {
        Object.keys(emptyDoctorFilters()).forEach((key) => next.delete(key));
        {
            next.delete("appointmentDate");
            next.delete("previouslyBooked");
        }
        next.delete("mode");
    }, false, true) : changeCatalogFilters(emptyCatalogFilters());
    const changeDate = (date: string) => update(next => {
        next.delete("availability");
        next.delete("appointmentDate");
        if (date)
            next.set("appointmentDate", date);
    }, false, true);
    const setHistory = (value: boolean) => update(next => { if (value)
        next.set("previouslyBooked", "true");
    else
        next.delete("previouslyBooked"); }, false, true);
    const changeHistory = () => {
        if (isUserLoggedIn)
            setHistory(!previouslyBooked);
        else
            setHistoryLogin(true);
    };
    const dateLabel = (date: string) => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
    const clearDate = () => changeDate("");
    const clearDraftDate = () => setDraftDate("");
    const clearHistory = () => setHistory(false);
    const clearDraftHistory = () => setDraftHistory(false);
    const clearVideo = () => update(next => next.delete("mode"));
    const appliedExtraChips = [
        ...(mode === "video" ? [{ key: "mode", label: "Video consultation", remove: clearVideo }] : []),
        ...(customDate ? [{ key: "appointmentDate", label: dateLabel(customDate), remove: clearDate }] : []),
        ...(previouslyBooked ? [{ key: "previouslyBooked", label: historyLabel, remove: clearHistory }] : []),
    ];
    const draftExtraChips = [
        ...(draftVideo ? [{ key: "mode", label: "Video consultation", remove: () => setDraftVideo(false) }] : []),
        ...(draftDate ? [{ key: "appointmentDate", label: dateLabel(draftDate), remove: clearDraftDate }] : []),
        ...(draftHistory ? [{ key: "previouslyBooked", label: historyLabel, remove: clearDraftHistory }] : []),
    ];
    const openFilters = () => { setDraftFilterQuery(""); setDraftVideo(mode === "video"); setDraftDoctors(filters); setDraftDate(customDate); setDraftHistory(previouslyBooked); setDraftCatalog(catalogFilters); setFilterDrawer(true); };
    const continueBooking = (url: string) => {
        if (isUserLoggedIn)
            router.push(url);
        else
            setPendingUrl(url);
    };
    const book = (event: MouseEvent, doctor: DoctorListingItem, selectedMode: ConsultationMode, includeSlot: boolean) => {
        event.preventDefault();
        // The search endpoint has no verified appointment/profile detail contract.
        // Keep unknown IDs out of the legacy synthetic profile fallback.
        if (live) {
            setDoctorDetails(doctor);
            return;
        }
        {
            setResumeCard(visitedCards.current.has(doctor.id));
            visitedCards.current.add(doctor.id);
            const next = new URLSearchParams(searchParams.toString());
            next.delete("bookingResume");
            next.set("design", "d21");
            next.set("booking", doctor.id);
            next.set("bookingMode", selectedMode);
            next.set("hospital", doctor.hospital);
            const cardDate = event.currentTarget instanceof HTMLAnchorElement
                ? new URL(event.currentTarget.href).searchParams.get("date") : null;
            if (customDate || cardDate)
                next.set("date", customDate || cardDate!);
            else
                next.delete("date");
            if (bookingId)
                window.history.replaceState(null, "", `${pathname}?${next}`);
            else {
                openedHere.current = true;
                window.history.pushState(null, "", `${pathname}?${next}`);
            }
            return;
        }
        // A chosen day carries forward without selecting an appointment time.
        const url = design17BookingUrl(doctor, selectedMode, customDate, availabilityNow, "d17", listingReturnTo);
        if (doctorDetails) {
            // Finish closing the native details dialog before opening the login modal.
            detailsBookingUrl.current = url;
            setDoctorDetails(null);
        }
        else
            continueBooking(url);
    };
    const stateKey = listingReturnTo;
    useEffect(() => { setVisible(16); setFilterDrawer(false); }, [stateKey, tab.id]);
    useEffect(() => {
        if (!doctorTab || filterDrawer || !returnToTopPending.current)
            return;
        const frame = requestAnimationFrame(() => {
            // A mobile drawer keeps Lenis stopped until its exit animation completes.
            // AnimatePresence's onExitComplete handles that case after cleanup.
            if (!document.querySelector("dialog[open]"))
                returnToResultsTop();
        });
        return () => cancelAnimationFrame(frame);
    }, [stateKey, doctorTab, filterDrawer, returnToResultsTop]);
    useEffect(() => {
        const element = moreRef.current;
        // Reveal the next batch shortly before the user reaches the current end.
        if (!element || loading || error || visible >= total)
            return;
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting)
            setVisible((value) => Math.min(value + 16, total)); }, { rootMargin: "240px" });
        observer.observe(element);
        return () => observer.disconnect();
    }, [total, visible, loading, error]);
    const dateFilteredDoctors = (draft: boolean) => refineDoctors(doctors.map(doctor => withSelectedDoctorHospital(doctor, (draft ? draftDoctors : filters).hospitals)), { ...emptyDoctorFilters(), availability: (draft ? draftDoctors : filters).availability }, draft ? (draftVideo ? "video" : "hospital") : mode, "relevance", draft ? draftDate : customDate, draft ? draftHistory : previouslyBooked, bookedDoctors, availabilityNow, {}, scheduleContext);
    const smartLanguage = getDesign16LanguageShortcut(doctors, filters, filterMode, location, availabilityNow, dateFilteredDoctors(false), true)?.value;
    const doctorFilterProps = (draft: boolean): Omit<ComponentProps<typeof DoctorFilters>, "onChange" | "onClearCustomDate"> => ({
        doctors, matchingDoctors: dateFilteredDoctors(draft), value: draft ? draftDoctors : filters,
        // Search matches live in their own popover; browsing keeps its accordion state.
        filterQuery: "",
        customDateLabel: (draft ? draftDate : customDate) ? dateLabel(draft ? draftDate : customDate) : undefined,
        smartSearch: true, showResultCounts: false,
        availabilityEnabled: draft ? (hasDesign16Availability(doctors, draftVideo ? "video" : "hospital", availabilityNow, scheduleContext) || (!draftVideo && hasDesign16Availability(doctors, "video", availabilityNow, scheduleContext))) : hasDates,
        mode: (draft ? (draftVideo ? "video" : "all") : filterMode),
    });
    const changeDraftDoctorFilters = (value: DoctorFilterValues) => { setDraftDoctors(value); if (value.availability !== draftDoctors.availability)
        setDraftDate(""); };
    const renderFilterSearch = (draft: boolean) => <FilterSearch value={draft ? draftFilterQuery : filterQuery} onChange={draft ? setDraftFilterQuery : setFilterQuery} filters={doctorFilterProps(draft)} onFiltersChange={draft ? changeDraftDoctorFilters : changeDoctorFilters} onClearCustomDate={draft ? clearDraftDate : clearDate}/>;
    const renderFilters = (draft: boolean) => doctorTab
        ? <DoctorFilters {...doctorFilterProps(draft)} onChange={draft ? changeDraftDoctorFilters : changeDoctorFilters} onClearCustomDate={(draft ? clearDraftDate : clearDate)}/>
        : <CatalogFilters tab={tab.id} items={currentItems} value={draft ? draftCatalog : catalogFilters} onChange={draft ? setDraftCatalog : changeCatalogFilters}/>;
    const draftCount = doctorTab ? (refineDoctors(doctors, draftDoctors, (draftVideo ? "video" : "hospital"), sort, draftDate, draftHistory, bookedDoctors, availabilityNow, {}, scheduleContext).length) : filterCatalog(currentItems, draftCatalog).length;
    const sample = !live || !apiCategory;
    const draftHasFilters = activeFilterCount(draftDoctors) > 0 || Boolean(draftDate) || draftHistory || draftVideo;
    const clearDraftFilters = () => { setDraftDoctors(emptyDoctorFilters()); setDraftVideo(false); setDraftDate(""); setDraftHistory(false); setDraftFilterQuery(""); };
    const filterHeading = <div className={styles.filterHeading}><h2><Filter size={16} aria-hidden/>Filters</h2>{(filterCount > 0) && <button type="button" disabled={filterCount === 0} aria-hidden={filterCount === 0} aria-label="Clear all filters" onClick={event => { const panel = event.currentTarget.closest("aside"); clearFilters(); setFilterQuery(""); panel?.querySelector<HTMLElement>("[data-filter-search] input")?.focus({ preventScroll: true }); }}>Clear all</button>}</div>;
    return <div className={`${styles.page} ${doctorTab ? `${styles.doctorPage} ${ui.theme}` : ""}`} data-design={"d21"} data-nav-theme="light">
    {doctorTab && <p id="d3-refinement-help" className={styles.srOnly}>{"Filters update matching doctors. Sort changes their order. Video consultation limits results to doctors offering video."}</p>}
    {(doctorTab ? <DoctorSearchTop compactMobile={true} hideTotal={true} allConsultationTypes={mode !== "video"} locationFirst={true} query={query} location={location} total={total} mode={mode} heading={doctorCopy.heading} summary={doctorCopy.summary} loading={loading} error={error} filterCount={filterCount} onOpenFilters={openFilters} onQuery={(value) => update((next) => { if (value)
            next.set("q", value);
        else
            next.delete("q"); }, true)} onLocation={(value) => update((next) => { next.delete("location"); next.delete("nearby"); if (value !== "All")
            next.set("location", value); if (next.get("sort") === "nearest")
            next.delete("sort"); }, false, true)}>
      {<Refinements compactMobile={true} videoSmartFilter={true} onOpenFilters={openFilters} filterCount={filterCount} location={location} mode={mode} sort={sort} filters={filters} date={customDate} minDate={indiaDate(availabilityNow)} maxDate={indiaDate(availabilityNow, DESIGN16_BOOKING_DAYS - 1)} hasDates={hasDates} loading={loading} error={error} historyRequiresLogin={!isUserLoggedIn} historySelected={previouslyBooked} historyLabel={historyLabel} onNearMe={city => { setNearestUnits({}); update(next => { {
                next.delete("location");
                next.delete("nearby");
                if (city) {
                    next.set("location", city);
                    next.set("nearby", city);
                }
            } }, false, true); }} onModeChange={value => update(next => { if (value !== "video")
                next.delete("mode");
            else
                next.set("mode", value); if (value === "video" && next.get("sort") === "nearest")
                next.delete("sort"); }, false, true)} onSortChange={value => { if (value === "nearest")
                setNearestUnits({}); update(next => { if (value === "relevance")
                next.delete("sort");
            else
                next.set("sort", value); }, false, true); }} onFiltersChange={changeDoctorFilters} onDateChange={changeDate} onHistoryChange={changeHistory}>
        <LanguageShortcut showSelectionClear={false} doctors={doctors} matchingDoctors={dateFilteredDoctors(false)} filters={filters} mode={filterMode} location={location} now={availabilityNow} requireSuppliedLanguage={true} onChange={changeDoctorFilters}/>
        {false}
      </Refinements>}
      {<AppliedFilterSummary value={filters} smartLanguage={smartLanguage} extraChips={appliedExtraChips} onChange={changeDoctorFilters}/>}
    </DoctorSearchTop>
            : <SearchHeader query={query} location={location} onQuery={(value) => update((next) => { if (value)
                next.set("q", value);
            else
                next.delete("q"); }, true)} onLocation={(value) => update((next) => { next.delete("location"); if (value !== "All")
                next.set("location", value); })}/>)}
    <div className={styles.container}>
      {!doctorTab && <header className={styles.heading}>
        <div><p className={styles.eyebrow}>Care that’s right for you</p><h1 id="d3-results-title" tabIndex={-1}>{titles[tab.id]}</h1>
          <p className={styles.context}>{query.trim() ? <>Results for <strong>“{query.trim()}”</strong> · </> : null}{location === "All" ? "Across Narayana Health" : location}</p>
        </div>
        <button type="button" className={styles.mobileFilter} onClick={openFilters} aria-haspopup="dialog"><Filter size={18} aria-hidden/>Filters{filterCount > 0 && <span>{filterCount}</span>}</button>
      </header>}
      <div className={`${styles.layout} ${""}`}>
        <aside className={`${styles.sidebar} ${""}`} aria-label={`${tab.label} filters`} aria-describedby={doctorTab ? "d3-refinement-help" : undefined} data-lenis-prevent data-d3-ui>
          {<div className={d21.filterTools} data-filter-tools>{filterHeading}</div>}
          <FilterScrollArea key={tab.id}>{<div className={d21.scrollSearch}>{renderFilterSearch(false)}</div>}{doctorTab && true && false && <SidebarDoctorFilters value={filters} onChange={changeDoctorFilters} onClearAll={clearFilters} extraChips={appliedExtraChips}/>}{renderFilters(false)}</FilterScrollArea>
        </aside>
        <section className={styles.results} aria-label={tab.label}>
          {false}
          <div hidden={false} inert={false} className={undefined}>
          {doctorTab && true && <>
            <p id="d21-result-count" tabIndex={-1} className={d21.srOnly} role="status" aria-live="polite" aria-atomic="true">{loading ? "Finding doctors…" : error ? "Results unavailable" : "Doctor results updated"}</p>
            {incompatibleHospitals.length > 0 && <p className={d21.recovery}>A selected hospital is not in these search results.
              <button type="button" onClick={() => changeDoctorFilters({ ...filters, hospitals: filters.hospitals.filter(name => !incompatibleHospitals.includes(name)) })}>Clear unavailable hospital filters</button>
            </p>}
          </>}
          {!doctorTab && filterCount > 0 && <div className={styles.chips}>{(Object.keys(catalogFilters) as (keyof CatalogFilterValues)[]).flatMap((key) => catalogFilters[key].map((value) => <button type="button" key={`${key}-${value}`} aria-label={`Remove filter: ${value}`} onClick={() => changeCatalogFilters({ ...catalogFilters, [key]: catalogFilters[key].filter((item) => item !== value) })}>{value}<X size={14} aria-hidden/></button>))}</div>}
          {!doctorTab && <div className={styles.resultMeta}><p role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : <><strong>{total}</strong> {total === 1 ? "result" : "results"}</>}</p>
            {sample && <span className={styles.sample}><Info size={14} aria-hidden/>Sample directory</span>}
          </div>}
          {!sample && doctorTab && !loading && !error && <p className={styles.dataNote}>Contact NH to confirm appointment times and consultation fees.</p>}
          <div className={`${styles.grid} ${doctorTab ? gridClassName || styles.doctorGrid : ""}`} aria-busy={loading}>
            {loading ? <ResultSkeletons doctors={doctorTab}/> : error || !total ? <SearchState recovery={recovery ? { message: `The next matching appointments are on ${dateLabel(recovery.date)}. Your other filters will stay selected.`, label: `View ${dateLabel(recovery.date)}`, onApply: () => changeDate(recovery.date) } : filterRecovery ? { message: `${filterRecovery.count} doctors are available without the ${filterRecovery.label} filter. Your other preferences will stay selected.`, label: `Clear ${filterRecovery.label} filter`, onApply: () => changeDoctorFilters(filterRecovery.filters) } : undefined} emptyState={previouslyBooked ? {
                title: bookedDoctors.size ? `No ${historyLabel.toLowerCase()} doctors match` : `No ${historyLabel.toLowerCase()} doctors yet`,
                message: bookedDoctors.size ? `Try another location or remove a filter to find a doctor you’ve ${"booked"} before.` : "Doctors you book will appear here, making your next visit easier.",
                action: "Browse doctors",
            } : undefined} error={error} filtered={filterCount > 0} onRetry={request.retry} onReset={previouslyBooked ? () => setHistory(false) : filterCount ? clearFilters : () => update((next) => { next.delete("q"); next.delete("location"); })}/>
            : doctorTab ? results.slice(0, shownDoctors).map((doctor, index) => <Card key={`${doctor.id}:${sort === "nearest"}`} browsingPreview={listingPreview === "2"} doctor={doctor} mode={design21CardMode(doctor, mode, availabilityNow)} live={live} bookedEarlier={bookedDoctors.has(doctor.id)} onBook={book} onDetails={setDoctorDetails} priority={index < 3} bookingDate={customDate} listingReturnTo={listingReturnTo} cardDesign={"d20"} focusTerms={[...filters.expertise, query]} active={bookingId === doctor.id} onClose={closeBookingCard} initialSelection={bookingId === doctor.id ? activeCardSelection : undefined} resume={resumeCard} onHospitalChange={sort === "nearest" ? hospital => chooseNearestUnit(doctor.id, hospital) : undefined}/>)
                : items.slice(0, visible).map((item) => <ResultCard key={item.id} item={item} onDetails={() => setItemDetails(item)}/>)}
          </div>
          {doctorTab && <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{!loading && !error && visible > 16 ? "More doctors loaded" : ""}</p>}
          {!loading && !error && total > 0 && <div ref={moreRef} className={styles.more} data-d3-ui>{!(doctorTab && true) && <p>Showing {Math.min(visible, total)} of {total}</p>}{!doctorTab && visible < total && <button type="button" className={styles.secondaryButton} onClick={() => setVisible((value) => Math.min(value + 16, total))}>Show more results</button>}</div>}
          {doctorTab && <div hidden={loading || error || visible < total}>
            <DoctorListingFAQ speciality={selectedSpeciality} city={selectedCity?.label}/>
          </div>}
          </div>
        </section>
      </div>
    </div>
    <AnimatePresence onExitComplete={() => {
            requestAnimationFrame(() => {
                returnToResultsTop();
                const url = detailsBookingUrl.current;
                if (url) {
                    detailsBookingUrl.current = null;
                    continueBooking(url);
                }
            });
        }}>
    {filterDrawer && <SearchDialog key="filters" title={doctorTab && true ? "Filters" : "Refine your search"} mobileOnly doctorPreview={doctorTab} onClose={() => setFilterDrawer(false)} headerAction={draftHasFilters ? <button type="button" className={d21.drawerClear} aria-label="Clear all filters" onClick={event => { const dialog = event.currentTarget.closest("dialog"); clearDraftFilters(); dialog?.querySelector<HTMLInputElement>("[data-filter-search] input")?.focus(); }}>Clear all</button> : undefined} footer={<>
      {doctorTab && <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : `${draftCount} ${draftCount === 1 ? "doctor matches" : "doctors match"} your filters`}</span>}
      {false}
      <button type="button" disabled={draftCount === 0} className={styles.primaryButton} onClick={() => {
                    if (doctorTab && true)
                        update(next => {
                            {
                                next.delete("mode");
                                if (draftVideo)
                                    next.set("mode", "video");
                            }
                            for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
                                next.delete(key);
                                draftDoctors[key].forEach(value => next.append(key, value));
                            }
                            next.delete("availability");
                            next.delete("appointmentDate");
                            next.delete("previouslyBooked");
                            if (draftDate)
                                next.set("appointmentDate", draftDate);
                            else if (draftDoctors.availability !== "any")
                                next.set("availability", draftDoctors.availability);
                            if (draftHistory)
                                next.set("previouslyBooked", "true");
                        }, false, true);
                    else if (doctorTab)
                        changeDoctorFilters(draftDoctors);
                    else
                        changeCatalogFilters(draftCatalog);
                    setFilterDrawer(false);
                }}>{doctorTab && true && false ? "Show doctors" : <>Show {draftCount} {doctorTab && true ? (draftCount === 1 ? "doctor" : "doctors") : (draftCount === 1 ? "result" : "results")}</>}</button>
    </>}>{<div className={d21.scrollSearch}>{renderFilterSearch(true)}</div>}{draftCount === 0 && <p className={d21.feedback} role="status">No doctors match. Remove a filter to see more options.</p>}{<button type="button" className={d21.videoOption} aria-pressed={draftVideo} onClick={() => setDraftVideo(!draftVideo)}>Video consultation{draftVideo && <X size={14} aria-hidden/>}</button>}{previouslyBooked && <button type="button" className={d21.videoOption} aria-pressed={draftHistory} onClick={() => setDraftHistory(!draftHistory)}>Previously booked{draftHistory && <X size={14} aria-hidden/>}</button>}{doctorTab && true && false && <SidebarDoctorFilters value={draftDoctors} onChange={setDraftDoctors} onClearAll={() => { setDraftDoctors(emptyDoctorFilters()); setDraftVideo(false); setDraftDate(""); setDraftHistory(false); }} extraChips={draftExtraChips}/>}{renderFilters(true)}</SearchDialog>}
    {doctorDetails && <SearchDialog key="doctor-details" title={doctorDetails.name} doctorPreview={doctorTab} onClose={() => setDoctorDetails(null)} footer={!live && doctorDetails.modes[mode] === true && directory.some(doctor => doctor.id === doctorDetails.id)
                ? <button type="button" className={styles.primaryButton} onClick={event => book(event, doctorDetails, mode, false)}>Book appointment <ArrowRight size={16} aria-hidden/></button>
                : <a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden/>Contact NH</a>}>
      {<Design17DoctorDetails doctor={doctorDetails} mode={mode}/>}
    </SearchDialog>}
    {itemDetails && <SearchDialog key="item-details" title={itemDetails.name} onClose={() => setItemDetails(null)} footer={<a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden/>Contact NH</a>}>
      <p>{itemDetails.description || "Further details are currently unavailable."}</p>{itemDetails.hospital && <p>{itemDetails.hospital}</p>}
      {itemDetails.inclusions && <ul className={styles.detailList}>{itemDetails.inclusions.map((value) => <li key={value}>{value}</li>)}</ul>}
      {itemDetails.price && <p>Listed price: {itemDetails.price}. Please confirm with NH before booking.</p>}
      <p>{tab.id === "packages_tests" ? "Online booking for this package or test is currently unavailable here." : "Contact Narayana Health for further information."}</p>
    </SearchDialog>}
    </AnimatePresence>
    {pendingUrl && <LoginModal previewOtp={true} isOpen manageFocus onClose={() => setPendingUrl(null)} onLoginSuccess={() => { const url = pendingUrl; setPendingUrl(null); router.push(url); }}/>}
    {historyLogin && <LoginModal previewOtp={true} isOpen manageFocus purpose="history" onClose={() => setHistoryLogin(false)} onLoginSuccess={() => { setHistoryLogin(false); setHistory(true); }}/>}
    {doctorTab && <ListingBackdropPreview active={listingPreview} />}
  </div>;
}
