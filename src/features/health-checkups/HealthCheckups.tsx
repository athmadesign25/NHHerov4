"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Check, ChevronDown, MapPin, Minus, Search, ShoppingCart, X, HeartPulse, FlaskConical } from "lucide-react";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import NewPatient from "@/features/booking/shared/NewPatient";
import RazorpayDemo from "@/features/booking/shared/RazorpayDemo";
import { chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, rememberBookingMembers, subscribeBookingMembers, protectConfirmedBookingMember } from "@/features/booking/shared/memberSelection";
import type { SavedPatient, AuthIdentity } from "@/features/booking/shared/types";
import { FACILITIES, ITEMS, addCartItem, getCartItems, cartTotal, cartRequiresSlot, getHealthSlots, healthDates, healthEligibilityMessage, money, type FacilityId, type HealthItem } from "./catalog";
import JourneyHeading from "@/components/ui/JourneyHeading";
import chip from "@/components/ui/search-location/ControlChip.module.css";
import SearchLocationUnit from "@/components/ui/search-location/SearchLocationUnit";
import searchStyles from "@/components/ui/search-location/SearchToolbar.module.css";
import searchTheme from "@/components/ui/search-location/SearchTheme.module.css";
import { getHealthBookingHistory, getServerHealthBookingHistory, subscribeHealthBookingHistory, rememberHealthBooking, clearHealthBookingHistory } from "./healthBookingHistory";
import HealthItemCard from "./HealthItemCard";
import HealthListing1 from "./design1/HealthListing1";
import HealthListing3 from "./design3/HealthListing3";
import { resolveHealthDesign } from "./healthDesigns";
import HealthDesignPreview, { type HealthDesign } from "./HealthDesignPreview";
import HealthSelectionFeedback, { type SelectionNotice } from "./HealthSelectionFeedback";
import { healthListingHeading, matchesHealthQuery } from "./healthDiscovery";
import HealthDialog from "./HealthDialog";
import HealthCheckout from "./HealthCheckout";
import HealthConfirmation from "./HealthConfirmation";
import { healthItemDetailHref } from "./healthDetailTypes";
import { planHealthDetailAddition } from "./healthDetailSelection";
import { healthCityKey, healthCityOptions, healthFacilityServesCity, resolveHealthFacility } from "./healthFacilitySelection";
import catalogueCities from "@/data/health-checkups/cities.json";
import styles from "./HealthCheckups.module.css";

const ACCOUNT: AuthIdentity = { method: "email", value: "signed-in@nh.example" };
const CITIES = healthCityOptions(FACILITIES, catalogueCities);
const DEFAULT_FACILITY = FACILITIES.find(facility => ITEMS.some(item => item.facilityId === facility.id)) ?? FACILITIES[0];
function resolveItem(id: string | null) { return ITEMS.find(item => item.id === id); }
function firstDate() { return healthDates().find(date => getHealthSlots(date).length > 0) ?? healthDates()[0]; }

// Keep a catalogue selection while visiting its detail route. This is an
// in-memory handoff only; no member or health information is persisted.
let detailSelection: { facilityId: FacilityId; ids: string[] } | null = null;
function rememberDetailSelection(selection: typeof detailSelection) { detailSelection = selection; }

export default function HealthCheckups() {
  const params = useSearchParams();
  const router = useRouter();
  const design = resolveHealthDesign(params.getAll("design").length > 1 ? params.getAll("design") : params.get("design"));
  const legacy = design === "1";
  const reduceMotion = useReducedMotion();
  const { isUserLoggedIn, setIsUserLoggedIn } = useAuthState();
  const preference = useSyncExternalStore(subscribeBookingMembers, getBookingMemberSelection, getServerBookingMemberSelection);
  const members: SavedPatient[] = useMemo(() => preference.members.map(({ id, ...patient }) => ({ id, patient: { ...patient, phone: "", email: ACCOUNT.value } })), [preference.members]);
  const bookingHistory = useSyncExternalStore(subscribeHealthBookingHistory, getHealthBookingHistory, getServerHealthBookingHistory);
  const memberId = preference.selectedId ?? members[0]?.id ?? null;
  const [facilityId, setFacilityId] = useState<FacilityId>(() => resolveHealthFacility(FACILITIES, detailSelection?.facilityId)?.id ?? resolveItem(params.get("item"))?.facilityId ?? resolveHealthFacility(FACILITIES, params.get("hospital"))?.id ?? DEFAULT_FACILITY.id);
  const [centreChosen, setCentreChosen] = useState(() => Boolean(detailSelection || resolveItem(params.get("item")) || resolveHealthFacility(FACILITIES, params.get("hospital"))));
  const [pendingPackage, setPendingPackage] = useState<HealthItem | null>(null);
  const [tab, setTab] = useState<"package" | "test">(params.get("tab") === "tests" ? "test" : "package");
  const [query, setQuery] = useState(params.get("q")?.slice(0, 120) ?? "");
  const [category, setCategory] = useState("All");
  const [ids, setIds] = useState<string[]>(() => detailSelection?.ids ?? []);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [pickerCity, setPickerCity] = useState<string | null>(null);
  const [pendingFacility, setPendingFacility] = useState<FacilityId | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [newMember, setNewMember] = useState(false);
  const [date, setDate] = useState(firstDate);
  const [time, setTime] = useState(() => getHealthSlots(firstDate())[0] ?? "");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [notice, setNotice] = useState<SelectionNotice | null>(null);
  const noticeSequence = useRef(0);
  function showNotice(text: string, success = false) {
    noticeSequence.current += 1;
    setNotice({ id: noticeSequence.current, text, tone: success ? "success" : "info" });
  }
  const [receipt, setReceipt] = useState<{ items: HealthItem[]; facilityId: FacilityId; member: SavedPatient; date: string; time: string } | null>(null);
  const paymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const cityPicker = useRef<HTMLSelectElement>(null);
  const facility = resolveHealthFacility(FACILITIES, facilityId) ?? DEFAULT_FACILITY;
  const cityKey = healthCityKey(facility.city);
  const centreVisible = legacy || centreChosen;
  const centreOptions = FACILITIES.filter(entry => healthFacilityServesCity(entry, pickerCity ?? cityKey));
  const cart = getCartItems(ids, facilityId);
  const total = cartTotal(cart);
  const selectedPackage = cart.find(item => item.kind === "package");
  const stage = receipt ? "confirmed" : params.get("step") === "review" && cart.length ? "review" : "browse";
  const facilityCatalog = ITEMS.filter(item => item.facilityId === facilityId);
  const catalog = facilityCatalog.filter(item => item.kind === tab);
  const categories = ["All", ...new Set(catalog.map(item => item.category).filter(Boolean))];
  const searching = Boolean(query.trim());
  const listingHeading = healthListingHeading(centreChosen ? facility.city : undefined, searching ? undefined : tab);
  const visible = searching
    ? facilityCatalog.filter(item => matchesHealthQuery(item, query))
    : catalog.filter(item => category === "All" || item.category === category);
  const packages = visible.filter(item => item.kind === "package");
  const tests = visible.filter(item => item.kind === "test");


  useEffect(() => () => { if (paymentTimer.current) clearTimeout(paymentTimer.current); }, []);
  useEffect(() => receipt ? protectConfirmedBookingMember() : undefined, [receipt]);
  useEffect(() => { rememberDetailSelection(null); }, []);
  useEffect(() => {
    if (isUserLoggedIn) return;
    clearHealthBookingHistory();
    if (paymentTimer.current) clearTimeout(paymentTimer.current);
    setPaymentOpen(false); setBusy(false);
  }, [isUserLoggedIn]);

  // Next preserves this client across same-route links. Honour fresh entry context.
  const contextKey = JSON.stringify(["hospital", "item", "add", "tab", "q"].map(key => params.getAll(key)));
  const previousContext = useRef<string | null>(null);
  const incomingDetail = useRef<HealthItem | null>(null);
  const incomingAdd = useRef(false);
  useEffect(() => {
    if (previousContext.current === contextKey || receipt) return;
    previousContext.current = contextKey;
    const itemValues = params.getAll("item");
    const addValues = params.getAll("add");
    const item = resolveItem(itemValues.length === 1 ? itemValues[0] : null);
    const shouldAdd = addValues.length === 1 && addValues[0] === "1";
    if (item || resolveHealthFacility(FACILITIES, params.get("hospital"))) setCentreChosen(true);
    if (item && !shouldAdd) {
      rememberDetailSelection({ facilityId, ids });
      router.replace(healthItemDetailHref(item, design));
      return;
    }
    const hospitalValues = params.getAll("hospital");
    const requestedFacility = item?.facilityId ?? resolveHealthFacility(FACILITIES, hospitalValues.length === 1 ? hospitalValues[0] : null)?.id ?? facilityId;
    setTab(item?.kind ?? (params.get("tab") === "tests" ? "test" : "package"));
    setQuery(params.get("q")?.slice(0, 120) ?? ""); setCategory("All");
    const addition = item && shouldAdd ? planHealthDetailAddition(ids, facilityId, item) : null;
    if (addition?.status === "blocked") {
      showNotice(addition.message);
      const search = new URLSearchParams(params.toString()); search.set("hospital", facilityId); search.delete("item"); search.delete("add");
      window.history.replaceState(null, "", `/health-checkups?${search}`);
      return;
    }
    if (addition?.status === "confirm-facility" || (requestedFacility !== facilityId && cart.length)) {
      incomingDetail.current = item ?? null; incomingAdd.current = shouldAdd; setPendingFacility(requestedFacility);
    } else {
      setFacilityId(requestedFacility);
      if (addition?.status === "ready") {
        setIds(addition.ids);
        showNotice(addition.message, addition.ids.includes(item!.id));
        const search = new URLSearchParams(params.toString());
        search.set("hospital", requestedFacility); search.delete("item"); search.delete("add"); search.delete("step");
        window.history.replaceState(null, "", `/health-checkups?${search}`);
      } else if (shouldAdd && !item) {
        showNotice("This package or test isn’t listed here. Please choose another option.");
        const search = new URLSearchParams(params.toString()); search.delete("item"); search.delete("add");
        window.history.replaceState(null, "", `/health-checkups?${search}`);
      } else if (itemValues.length && !item) {
        // Old promotional links may reference retired preview IDs. Keep browsing.
        const search = new URLSearchParams(params.toString()); search.delete("item"); search.delete("add");
        window.history.replaceState(null, "", `/health-checkups?${search}`);
      }
    }
  }, [contextKey, params, receipt, facilityId, ids, cart.length, router, design]);

  function go(step: "browse" | "review" | "confirmed") {
    const search = new URLSearchParams(params.toString());
    search.delete("item"); search.delete("add");
    if (step === "browse") search.delete("step"); else search.set("step", step);
    window.history.pushState(null, "", `/health-checkups${search.size ? `?${search}` : ""}`);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function add(item: HealthItem) {
    if (ids.includes(item.id)) { remove(item.id); return; }
    if (!legacy && item.kind === "package" && selectedPackage && selectedPackage.id !== item.id) {
      setPendingPackage(item); return;
    }
    const next = addCartItem(ids, item, facilityId);
    setIds(next.ids);
    showNotice(next.message ?? `${item.name} added to your cart.`, next.ids.includes(item.id));
  }
  function changeDesign(next: HealthDesign) {
    if (next === design) return;
    if (legacy) setCentreChosen(true);
    closeFacilityPicker();
    const search = new URLSearchParams(params.toString());
    search.set("design", next);
    window.history.replaceState(null, "", `/health-checkups?${search}`);
  }
  function replacePackage() {
    if (!pendingPackage) return;
    const next = addCartItem(ids.filter(id => id !== selectedPackage?.id), pendingPackage, facilityId);
    setIds(next.ids); showNotice(next.message ?? `${pendingPackage.name} selected.`, next.ids.includes(pendingPackage.id)); setPendingPackage(null);
  }
  function renderItem(item: HealthItem, index: number) {
    return <HealthItemCard key={item.id} item={item} eager={index === 0} selected={ids.includes(item.id)} included={Boolean(selectedPackage?.includedTestIds.includes(item.id))} onAdd={() => add(item)} onDetails={() => openDetails(item)} />;
  }
  function remove(id: string) { setIds(current => current.filter(value => value !== id)); setPaymentError(""); }
  function openDetails(item: HealthItem) {
    rememberDetailSelection({ facilityId, ids });
    router.push(healthItemDetailHref(item, design));
  }
  function openFacilityPicker(nextCity = cityKey) { setPickerCity(nextCity); setFacilityOpen(true); }
  function closeFacilityPicker() { setFacilityOpen(false); setPickerCity(null); }
  function changeFacility(next: FacilityId) {
    if (!resolveHealthFacility(FACILITIES, next)) return;
    if (next === facilityId && centreVisible) { closeFacilityPicker(); return; }
    if (cart.length) { closeFacilityPicker(); setPendingFacility(next); return; }
    applyFacility(next);
  }
  function applyFacility(next: FacilityId) {
    const item = incomingDetail.current;
    const selection = item && incomingAdd.current ? addCartItem([], item, next) : { ids: [] };
    setCentreChosen(true);
    setFacilityId(next); setIds(selection.ids); incomingDetail.current = null; incomingAdd.current = false; setCategory("All"); closeFacilityPicker(); setPendingFacility(null); setPaymentError("");
    if (item && selection.ids.includes(item.id)) showNotice(`${item.name} added to your cart.`, true);
    const search = new URLSearchParams(params.toString()); search.set("hospital", next); search.delete("step");
    if ((item?.kind ?? tab) === "test") search.set("tab", "tests"); else search.delete("tab");
    if (query.trim()) search.set("q", query); else search.delete("q");
    search.delete("item"); search.delete("add");
    window.history.replaceState(null, "", `/health-checkups?${search}`);
  }
  function keepFacility() {
    setPendingFacility(null); setPickerCity(null); incomingDetail.current = null; incomingAdd.current = false;
    const search = new URLSearchParams(params.toString()); search.set("hospital", facilityId); search.delete("item"); search.delete("add");
    window.history.replaceState(null, "", `/health-checkups?${search}`);
  }
  function review() {
    setCartOpen(false);
    if (!isUserLoggedIn) { setLoginOpen(true); return; }
    if (memberId) chooseBookingMember(memberId);
    go("review");
  }
  function changeDate(next: string) { setDate(next); setTime(getHealthSlots(next)[0] ?? ""); setPaymentError(""); }
  function canPay() {
    if (receipt) return false;
    if (!isUserLoggedIn) { setLoginOpen(true); return false; }
    if (!members.some(member => member.id === memberId) || !cart.length) { setPaymentError("Choose a member and at least one package or test."); return false; }
    const eligibility = healthEligibilityMessage(cart, members.find(member => member.id === memberId)?.patient);
    if (eligibility) { setPaymentError(eligibility); return false; }
    if (cartRequiresSlot(cart) && !getHealthSlots(date).includes(time)) { setPaymentError("Please choose an available date and time before paying."); return false; }
    return true;
  }
  function finishPayment() {
    if (busy) return;
    if (!canPay()) { setPaymentOpen(false); return; }
    const member = members.find(entry => entry.id === memberId)!;
    setBusy(true);
    paymentTimer.current = setTimeout(() => {
      rememberHealthBooking(member.id, cart.map(item => item.id));
      setReceipt({ items: cart, facilityId, member, date: cartRequiresSlot(cart) ? date : "", time: cartRequiresSlot(cart) ? time : "" });
      setBusy(false); setPaymentOpen(false); setPaymentError(""); go("confirmed");
    }, 600);
  }

  return <div className={styles.page} data-health-design={design}>
    <div className={styles.container}>
      {stage === "browse" && <>
        <header className={styles.intro}><div>{legacy ? <h1 ref={heading} tabIndex={-1}>Health checkups &amp; tests</h1> : <JourneyHeading ref={heading} tabIndex={-1}>{listingHeading}</JourneyHeading>}<p>Find the right checkup, at a centre near you.</p></div></header>
        {design === "3" ? <HealthListing3 bookedIds={isUserLoggedIn && memberId ? bookingHistory[memberId] ?? [] : []} cities={CITIES} facilities={FACILITIES} facility={centreChosen ? facility : undefined}
          facilityOpen={facilityOpen} onOpenFacility={() => openFacilityPicker()} onCloseFacility={closeFacilityPicker} onFacility={changeFacility}
          catalog={facilityCatalog} query={query} onQuery={setQuery} tab={tab} onTab={setTab} category={category} onCategory={setCategory}
          ids={ids} includedIds={selectedPackage?.includedTestIds ?? []} onAdd={add} onDetails={openDetails} /> : <>
        <section className={`${styles.controls} ${searchTheme.theme}`} aria-label="Find health packages and tests">
          <div className={`${searchStyles.searchRow} ${searchStyles.locationFirst} ${searchStyles.compactMobile}`}>
            <SearchLocationUnit id="health-checkup-search" query={query} onQuery={value => { setQuery(value); setCategory("All"); }} maxLength={120}
              searchLabel="Find health packages and tests" inputLabel="Search packages and lab tests" placeholder="Search a package or test"
              onSubmit={event => { event.preventDefault(); heading.current?.focus({ preventScroll: true }); }}
              locationControl={<label className={`${searchStyles.location} ${searchStyles.leadingLocation}`} data-active>
                <MapPin size={16} aria-hidden /><span className={searchStyles.srOnly}>Search location</span>
                <select aria-label="Search location" value={centreVisible ? cityKey : ""} onChange={event => openFacilityPicker(event.target.value)}>{!centreVisible && <option value="" disabled>Choose city</option>}{CITIES.map(city => <option key={city.value} value={city.value}>{city.label}</option>)}</select>
              </label>} />
          </div>
          <button type="button" className={styles.facilityTrigger} onClick={() => openFacilityPicker()} aria-haspopup="dialog"><Building2 size={16} aria-hidden /><span>{centreVisible ? facility.name : "Choose a hospital or clinic"}</span><ChevronDown size={16} aria-hidden /></button>
        </section>
        {legacy ? <HealthListing1 catalog={facilityCatalog} tab={tab} query={query} category={category} ids={ids} includedIds={selectedPackage?.includedTestIds ?? []}
          onTab={value => { setTab(value); setCategory("All"); }} onCategory={setCategory} onClear={() => { setQuery(""); setCategory("All"); }} onCentre={() => openFacilityPicker()} onAdd={add} onDetails={openDetails} /> : centreChosen ? <>
          <div className={styles.toolbar}>
            {searching ? <div className={styles.searchSummary}><h2>Search results</h2><button type="button" className={styles.textButton} onClick={() => setQuery("")}>Clear search<X size={14} aria-hidden /></button></div> : <div className={styles.typeFilters} role="group" aria-label="Browse by type">{(["package", "test"] as const).map(value => <button type="button" className={chip.chip} key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setCategory("All"); }}>{value === "package" ? <HeartPulse size={16} aria-hidden /> : <FlaskConical size={16} aria-hidden />}{value === "package" ? "Health packages" : "Lab tests"}</button>)}</div>}
          </div>
          {!searching && categories.length > 2 && <div className={`${styles.categories} ${styles.typeFilters}`} role="group" aria-label="Filter by focus">{categories.map(value => <button type="button" className={chip.chip} key={value} aria-pressed={category === value} onClick={() => setCategory(category === value ? "All" : value)}>{value}{value !== "All" && category === value && <X size={14} aria-hidden />}</button>)}</div>}
          <div className={styles.results} aria-live="polite" aria-atomic="false">
            {visible.length ? <>
              {packages.length > 0 && <section aria-label="Health packages"><h2 className={searching ? styles.groupHeading : styles.srOnly}>Health packages</h2><div className={styles.grid}>{packages.map(renderItem)}</div></section>}
              {tests.length > 0 && <section aria-label="Lab tests"><h2 className={searching ? styles.groupHeading : styles.srOnly}>Lab tests</h2><div className={styles.testList}>{tests.map(renderItem)}</div></section>}
            </> : <div className={styles.empty}><Search size={28} aria-hidden /><h2>{searching ? "No matching packages or tests" : `No ${tab === "package" ? "packages" : "lab tests"} listed at this centre`}</h2><p>{searching ? "Try a different name or clear your search." : "Explore the other services or choose another centre."}</p>{searching && <button type="button" className={styles.textButton} onClick={() => { setQuery(""); setCategory("All"); }}>Clear search</button>}<button type="button" className={styles.textButton} onClick={() => openFacilityPicker()}>Choose another centre</button></div>}
          </div>
          <p className={styles.catalogNote}>Packages and tests vary by centre. View details for inclusions and preparation.</p>
        </> : <section className={styles.chooseCentre}><span className={styles.centreIcon}><Building2 size={28} aria-hidden /></span><h2>Where would you like to visit?</h2><p>Choose a centre to see its packages, tests and prices.</p><button type="button" className={styles.primary} onClick={() => openFacilityPicker()}>Choose centre<ArrowRight size={18} aria-hidden /></button></section>}
        </>}

      </>}
      {stage === "review" && (isUserLoggedIn ? <HealthCheckout items={cart} facility={facility} members={members} memberId={memberId} onMemberChange={chooseBookingMember} onAddMember={() => setNewMember(true)} date={date} time={time} onDateChange={changeDate} onTimeChange={value => { setTime(value); setPaymentError(""); }} onBack={() => go("browse")} onRemove={remove} onPay={() => { if (canPay()) { setPaymentError(""); if (total === 0) finishPayment(); else setPaymentOpen(true); } }} paymentError={paymentError} /> : <section className={styles.empty}><h1>Continue your booking</h1><p>Your selection is ready. Sign in to choose a member.</p><button type="button" className={styles.primary} onClick={() => setLoginOpen(true)}>Sign in to continue</button><button type="button" className={styles.textButton} onClick={() => go("browse")}>Back to packages</button></section>)}
      {stage === "confirmed" && receipt && (isUserLoggedIn ? <HealthConfirmation items={receipt.items} facility={FACILITIES.find(entry => entry.id === receipt.facilityId)!} member={receipt.member} date={receipt.date} time={receipt.time} onRestart={() => { setReceipt(null); setIds([]); go("browse"); }} /> : <section className={styles.empty}><h1>Sign in to view your booking</h1><button type="button" className={styles.primary} onClick={() => setLoginOpen(true)}>Sign in</button></section>)}
    </div>
    {stage === "browse" && <HealthDesignPreview design={design} hasSelection={cart.length > 0} onChange={changeDesign} />}
    <HealthSelectionFeedback notice={notice} onDismiss={() => setNotice(null)} />
    {stage === "browse" && cart.length > 0 && <div className={styles.cartDock} data-health-selection-dock><div className={styles.dockInner}><button type="button" className={styles.selection} onClick={() => setCartOpen(true)}><span className={styles.bag}><ShoppingCart size={21} aria-hidden /></span><span><strong>{cart.length} {cart.length === 1 ? "item" : "items"} selected</strong><small>View cart</small></span><ChevronDown size={16} aria-hidden /></button><div className={styles.dockAction}><span><small>Total</small><strong>{money(total)}</strong></span><button type="button" className={styles.primary} onClick={legacy ? () => setCartOpen(true) : review}>{legacy ? "Review selection" : "Continue"}<ArrowRight size={18} aria-hidden /></button></div></div></div>}
    {facilityOpen && design !== "3" && <HealthDialog title="Choose a hospital or clinic" onClose={closeFacilityPicker}><label className={styles.cityPicker}>City<select ref={cityPicker} value={pickerCity ?? cityKey} onChange={event => setPickerCity(event.target.value)}>{CITIES.map(city => <option key={city.value} value={city.value}>{city.label}</option>)}</select></label>{centreOptions.length ? <div className={styles.facilities}>{centreOptions.map(entry => <button type="button" key={entry.id} aria-pressed={centreVisible && entry.id === facilityId} onClick={() => changeFacility(entry.id)}><MapPin size={20} aria-hidden /><span><strong>{entry.name}</strong><small>{entry.address}</small></span><span className={styles.radio}>{centreVisible && entry.id === facilityId && <Check size={12} strokeWidth={3} />}</span></button>)}</div> : <div className={styles.empty}><Building2 size={28} aria-hidden /><h3>No health checkup centres available</h3><p>Try another city to explore health packages and tests.</p><button type="button" className={styles.textButton} onClick={() => cityPicker.current?.focus()}>Choose another city</button></div>}</HealthDialog>}
    {pendingPackage && <HealthDialog title="Replace your package?" onClose={() => setPendingPackage(null)}><p className={styles.dialogSub}>Replace {selectedPackage?.name} with {pendingPackage.name}? Your additional tests stay selected unless they’re already included in the new package.</p><div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={() => setPendingPackage(null)}>Keep current package</button><button type="button" className={styles.primary} onClick={replacePackage}>Replace package</button></div></HealthDialog>}
    {pendingFacility && <HealthDialog title="Change your centre?" onClose={keepFacility}><p className={styles.dialogSub}>Packages and prices vary by centre. Your current selection will be cleared.</p><div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={keepFacility}>Keep selection</button><button type="button" className={styles.primary} onClick={() => applyFacility(pendingFacility)}>Change centre</button></div></HealthDialog>}
    {cartOpen && <HealthDialog title="Your cart" onClose={() => setCartOpen(false)}><p className={styles.dialogSub}>{facility.name}</p>{cart.length ? <><div className={styles.cartList}>{cart.map(item => <div key={item.id}><span><strong>{item.name}</strong><small>{item.kind === "package" ? "Health package" : "Lab test"}</small></span><strong>{money(item.price)}</strong><button type="button" aria-label={`Remove ${item.name}`} onClick={() => remove(item.id)}><Minus size={16} /></button></div>)}</div><div className={styles.cartTotal}><strong>Total payable</strong><strong>{money(total)}</strong></div><div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={() => { setCartOpen(false); setTab("test"); setQuery(""); setCategory("All"); }}>Add lab tests</button><button type="button" className={styles.primary} onClick={review}>Continue<ArrowRight size={18} aria-hidden /></button></div></> : <div className={styles.empty}><ShoppingCart size={32} aria-hidden /><p>Your selection is empty.</p><button type="button" className={styles.primary} onClick={() => setCartOpen(false)}>Explore packages &amp; tests</button></div>}</HealthDialog>}
    {newMember && <HealthDialog title="Add new member" onClose={() => setNewMember(false)}><NewPatient identity={ACCOUNT} onCancel={() => setNewMember(false)} onSave={patient => { const id = `health-member-${crypto.randomUUID()}`; rememberBookingMembers([{ id, patient }], id); setNewMember(false); }} /></HealthDialog>}
    {loginOpen && <LoginModal isOpen manageFocus previewOtp onClose={() => setLoginOpen(false)} onLoginSuccess={() => { setIsUserLoggedIn(true); setLoginOpen(false); if (memberId) chooseBookingMember(memberId); go("review"); }} />}
    {paymentOpen && <RazorpayDemo fee={money(total)} busy={busy} expired={false} onPay={finishPayment} onClose={() => { setPaymentOpen(false); setPaymentError("Payment cancelled. Your booking isn’t confirmed. Your selection is saved here so you can try again."); }} />}
  </div>;
}
