"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import NewPatient from "@/features/booking/shared/NewPatient";
import RazorpayDemo from "@/features/booking/shared/RazorpayDemo";
import { chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, rememberBookingMembers, subscribeBookingMembers, protectConfirmedBookingMember } from "@/features/booking/shared/memberSelection";
import type { SavedPatient, AuthIdentity } from "@/features/booking/shared/types";
import { FACILITIES, ITEMS, addCartItem, getCartItems, cartTotal, cartRequiresSlot, getHealthSlots, healthDates, healthEligibilityMessage, money, type FacilityId, type HealthItem } from "./catalog";
import { getHealthBookingHistory, getServerHealthBookingHistory, subscribeHealthBookingHistory, rememberHealthBooking, clearHealthBookingHistory } from "./healthBookingHistory";
import HealthListing3 from "./design3/HealthListing3";
import { resolveHealthDesign } from "./healthDesigns";
import HealthSelectionFeedback, { type SelectionNotice } from "./HealthSelectionFeedback";
import { healthListingHeading } from "./healthDiscovery";
import HealthDialog from "./HealthDialog";
import HealthCheckout from "./HealthCheckout";
import HealthCartDock from "./HealthCartDock";
import HealthConfirmation from "./HealthConfirmation";
import { healthItemDetailHref } from "./healthDetailTypes";
import { planHealthDetailAddition } from "./healthDetailSelection";
import { healthCityKey, healthCityOptions, resolveHealthFacility, resolveHealthEntryCentre, readHealthCentrePreference, rememberHealthCentrePreference } from "./healthFacilitySelection";
import catalogueCities from "@/data/health-checkups/cities.json";
import styles from "./HealthCheckups.module.css";
import HealthHero4 from "./design4/HealthHero4";
import preview4 from "./design4/HealthListing4.module.css";

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
  const [pendingFacility, setPendingFacility] = useState<FacilityId | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAddition, setCartAddition] = useState(0);
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
  const facility = resolveHealthFacility(FACILITIES, facilityId) ?? DEFAULT_FACILITY;
  const cart = getCartItems(ids, facilityId);
  const total = cartTotal(cart);
  const selectedPackage = cart.find(item => item.kind === "package");
  const stage = receipt ? "confirmed" : params.get("step") === "review" && cart.length ? "review" : "browse";
  const immersiveListing = stage === "browse";
  const facilityCatalog = ITEMS.filter(item => item.facilityId === facilityId);
  const searching = Boolean(query.trim());
  const listingHeading = healthListingHeading(centreChosen ? facility.city : undefined, searching ? undefined : tab);

  useEffect(() => () => { if (paymentTimer.current) clearTimeout(paymentTimer.current); }, []);
  useEffect(() => receipt ? protectConfirmedBookingMember() : undefined, [receipt]);
  useEffect(() => {
    rememberDetailSelection(centreChosen && !receipt ? { facilityId, ids } : null);
    if (centreChosen) rememberHealthCentrePreference(facilityId);
  }, [centreChosen, facilityId, ids, receipt]);
  useEffect(() => {
    if (isUserLoggedIn) return;
    clearHealthBookingHistory();
    if (paymentTimer.current) clearTimeout(paymentTimer.current);
    setPaymentOpen(false); setBusy(false);
  }, [isUserLoggedIn]);

  // Next preserves this client across same-route links. Honour fresh entry context.
  const cityParam = ["city", "location"].map(key => params.getAll(key)).find(values => values.length === 1)?.[0];
  const entryCity = CITIES.find(city => city.value === healthCityKey(cityParam ?? ""))?.value;
  const contextKey = JSON.stringify(["hospital", "item", "add", "tab", "q", "city", "location"].map(key => params.getAll(key)));
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

    if (item && !shouldAdd) {
      rememberDetailSelection({ facilityId, ids });
      router.replace(healthItemDetailHref(item, design));
      return;
    }
    const hospitalValues = params.getAll("hospital");
    const entryCentre = resolveHealthEntryCentre(FACILITIES, {
      explicitFacility: item?.facilityId ?? (hospitalValues.length === 1 ? hospitalValues[0] : null),
      rememberedFacility: centreChosen ? facilityId : readHealthCentrePreference(),
      city: cart.length ? undefined : entryCity,
    });
    const requestedFacility = entryCentre?.id ?? facilityId;
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
      setCentreChosen(Boolean(entryCentre));
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
  }, [contextKey, params, receipt, facilityId, centreChosen, entryCity, ids, cart.length, router, design]);

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
    if (item.kind === "package" && selectedPackage && selectedPackage.id !== item.id) {
      setPendingPackage(item); return;
    }
    const next = addCartItem(ids, item, facilityId);
    setIds(next.ids);
    if (next.ids.includes(item.id)) setCartAddition(value => value + 1);
    showNotice(next.message ?? `${item.name} added to your cart.`, next.ids.includes(item.id));
  }
  function replacePackage() {
    if (!pendingPackage) return;
    const next = addCartItem(ids.filter(id => id !== selectedPackage?.id), pendingPackage, facilityId);
    if (next.ids.includes(pendingPackage.id)) setCartAddition(value => value + 1);
    setIds(next.ids); showNotice(next.message ?? `${pendingPackage.name} selected.`, next.ids.includes(pendingPackage.id)); setPendingPackage(null);
  }
  function remove(id: string) { setIds(current => current.filter(value => value !== id)); setPaymentError(""); }
  function openDetails(item: HealthItem) {
    rememberDetailSelection({ facilityId, ids });
    router.push(healthItemDetailHref(item, design));
  }
  function openFacilityPicker() { setFacilityOpen(true); }
  function closeFacilityPicker() { setFacilityOpen(false); }
  function changeFacility(next: FacilityId) {
    if (!resolveHealthFacility(FACILITIES, next)) return;
    if (next === facilityId && centreChosen) { closeFacilityPicker(); return; }
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
    setPendingFacility(null); incomingDetail.current = null; incomingAdd.current = false;
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

  return <div className={`${styles.page} ${immersiveListing ? preview4.page : ""}`} data-health-design={design}>
    <div className={`${styles.container} ${immersiveListing ? preview4.container : ""}`}>
      {stage === "browse" && <HealthListing3
        renderHero={controls => <HealthHero4 title={listingHeading} headingRef={heading}>{controls}</HealthHero4>}
        bookedIds={isUserLoggedIn && memberId ? bookingHistory[memberId] ?? [] : []}
        cities={CITIES} facilities={FACILITIES} initialCity={entryCity}
        facility={centreChosen ? facility : undefined}
        facilityOpen={facilityOpen} onOpenFacility={openFacilityPicker}
        onCloseFacility={closeFacilityPicker} onFacility={changeFacility}
        catalog={facilityCatalog} query={query} onQuery={setQuery}
        tab={tab} onTab={setTab} category={category} onCategory={setCategory}
        ids={ids} includedIds={selectedPackage?.includedTestIds ?? []}
        onAdd={add} onDetails={openDetails} />}
      {stage === "review" && (isUserLoggedIn ? <HealthCheckout items={cart} facility={facility} members={members} memberId={memberId} onMemberChange={chooseBookingMember} onAddMember={() => setNewMember(true)} date={date} time={time} onDateChange={changeDate} onTimeChange={value => { setTime(value); setPaymentError(""); }} onBack={() => go("browse")} onRemove={remove} onPay={() => { if (canPay()) { setPaymentError(""); if (total === 0) finishPayment(); else setPaymentOpen(true); } }} paymentError={paymentError} /> : <section className={styles.empty}><h1>Continue your booking</h1><p>Your selection is ready. Sign in to choose a member.</p><button type="button" className={styles.primary} onClick={() => setLoginOpen(true)}>Sign in to continue</button><button type="button" className={styles.textButton} onClick={() => go("browse")}>Back to packages</button></section>)}
      {stage === "confirmed" && receipt && (isUserLoggedIn ? <HealthConfirmation items={receipt.items} facility={FACILITIES.find(entry => entry.id === receipt.facilityId)!} member={receipt.member} date={receipt.date} time={receipt.time} onRestart={() => { setReceipt(null); setIds([]); go("browse"); }} /> : <section className={styles.empty}><h1>Sign in to view your booking</h1><button type="button" className={styles.primary} onClick={() => setLoginOpen(true)}>Sign in</button></section>)}
    </div>
    <HealthSelectionFeedback notice={notice} onDismiss={() => setNotice(null)} />
    {stage === "browse" && <HealthCartDock items={cart} centre={facility.name} expanded={cartOpen} addition={cartAddition}
      onExpandedChange={setCartOpen} onRemove={remove} onContinue={review}
      onBrowse={() => { setCartOpen(false); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}
      onEmptyClose={() => heading.current?.focus({ preventScroll: true })} />}
    {pendingPackage && <HealthDialog title="Replace your package?" onClose={() => setPendingPackage(null)}><p className={styles.dialogSub}>Replace {selectedPackage?.name} with {pendingPackage.name}? Your additional tests stay selected unless they’re already included in the new package.</p><div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={() => setPendingPackage(null)}>Keep current package</button><button type="button" className={styles.primary} onClick={replacePackage}>Replace package</button></div></HealthDialog>}
    {pendingFacility && <HealthDialog title="Change your centre?" onClose={keepFacility}><p className={styles.dialogSub}>Changing to {resolveHealthFacility(FACILITIES, pendingFacility)?.name} will remove {cart.length} {cart.length === 1 ? "item" : "items"} from your cart. Packages and prices vary by centre.</p><div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={keepFacility}>Keep selection</button><button type="button" className={styles.primary} onClick={() => applyFacility(pendingFacility)}>Change centre</button></div></HealthDialog>}

    {newMember && <HealthDialog title="Add new member" onClose={() => setNewMember(false)}><NewPatient identity={ACCOUNT} onCancel={() => setNewMember(false)} onSave={patient => { const id = `health-member-${crypto.randomUUID()}`; rememberBookingMembers([{ id, patient }], id); setNewMember(false); }} /></HealthDialog>}
    {loginOpen && <LoginModal isOpen manageFocus previewOtp onClose={() => setLoginOpen(false)} onLoginSuccess={() => { setIsUserLoggedIn(true); setLoginOpen(false); if (memberId) chooseBookingMember(memberId); go("review"); }} />}
    {paymentOpen && <RazorpayDemo fee={money(total)} busy={busy} expired={false} onPay={finishPayment} onClose={() => { setPaymentOpen(false); setPaymentError("Payment cancelled. Your booking isn’t confirmed. Your selection is saved here so you can try again."); }} />}
  </div>;
}
