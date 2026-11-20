import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + ".ts")) return nextResolve(pathToFileURL(candidate + ".ts").href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});


const { refineDesign21Doctors, design21CardMode, design21FilterRecovery, findDesign21NextAvailability, matchesDesign21Filter, incompatibleHospitalFilters } = await import("../src/features/search/design21Filters.ts");
const { matchesFilterOption, matchingAvailabilityOptions, design21FilterSearchGroups } = await import("../src/features/search/design21FilterSearch.ts");
const { emptyDoctorFilters, filterDoctors, doctorFilterOptions } = await import("../src/features/search/doctorListing.ts");
const { design20ListingReturnTo, design20InlineUrl, design20FlowUrl } = await import("../src/features/booking/design20/model.ts");
const { design20BookingEntryUrl } = await import("../src/features/search/design20BookingEntry.ts");
const { design17ProfileUrl } = await import("../src/features/search/design17Profile.ts");
const { doctorListingUrl } = await import("../src/features/search/doctorListingNavigation.ts");
const now = new Date("2026-11-02T02:30:00Z");
const make = (id, modes, availability, extra = {}) => ({ id, name: id, speciality: "Cardiology", degrees: "", hospital: "Hospital A", hospitals: ["Hospital A"], city: "Bangalore", experience: "20", img: "", fee: "1000", rating: 0, reviews: 0, modes, availability, expertise: ["Heart failure"], ...extra });
const hospital = make("test-hospital", { hospital: true, video: false }, { hospital: "2026-11-02, 11:00 AM" });
const video = make("test-video", { hospital: false, video: true }, { video: "2026-11-02, 10:00 AM" });
const both = make("test-both", { hospital: true, video: true }, { hospital: "2026-11-03, 11:00 AM", video: "2026-11-02, 09:00 AM" });
const source = [hospital, video, both];

test("unified search finds category names, values and established aliases", () => {
  assert.equal(matchesFilterOption("Hospital", "Mazumdar Shaw Medical Centre", "hospital"), true);
  assert.equal(matchesFilterOption("Speciality", "Adult Cardiology", "cardio"), true);
  assert.equal(matchesFilterOption("Expertise", "Interventional Cardiology", "cardio"), true);
  assert.equal(matchesFilterOption("Speciality", "Dermatology", "skin"), true);
  assert.equal(matchesFilterOption("Hospital", "Mazumdar Shaw Medical Centre", "skin"), false);
  assert.equal(matchesFilterOption("Language", "Kannada", "  KANNADA  "), true);
});

test("availability search respects availability and retains selected unavailable dates", () => {
  assert.deepEqual(matchingAvailabilityOptions("today", true, "any").dates, ["today"]);
  assert.deepEqual(matchingAvailabilityOptions("availability", true, "any").dates, ["today", "tomorrow", "week"]);
  assert.equal(matchingAvailabilityOptions("cardio", true, "any").hasMatches, false);
  assert.equal(matchingAvailabilityOptions("availability", false, "any").hasMatches, false);
  assert.deepEqual(matchingAvailabilityOptions("tomorrow", false, "tomorrow").dates, ["tomorrow"]);
  const custom = matchingAvailabilityOptions("7 Nov", false, "any", "Sat, 7 Nov");
  assert.equal(custom.custom, true);
  assert.equal(custom.hasMatches, true);
  assert.deepEqual(custom.dates, []);
});
test("popover groups preserve category context and change only the chosen filter", () => {
  const value = { ...emptyDoctorFilters(), hospitals: ["Hospital A"] };
  const doctors = [make("a", { hospital: true, video: true }, {}, { expertise: ["Interventional Cardiology"], languages: ["Kannada"] })];
  const groups = design21FilterSearchGroups({ doctors, value }, "cardio");
  assert.deepEqual(groups.map(group => group.label), ["Speciality", "Expertise"]);
  assert.deepEqual(groups[0].options[0].nextFilters.specialties, ["Cardiology"]);
  assert.deepEqual(groups[0].options[0].nextFilters.hospitals, ["Hospital A"]);
  assert.deepEqual(value.specialties, []);
  assert.deepEqual(design21FilterSearchGroups({ doctors, value }, "  "), []);
  assert.deepEqual(design21FilterSearchGroups({ doctors, value }, "zzzz"), []);
});
test("popover hides unavailable options but retains selected ones for removal", () => {
  const doctors = [make("a", { hospital: true, video: true }, {}, { languages: ["English", "Kannada"] })];
  const value = { ...emptyDoctorFilters(), languages: ["English"] };
  const groups = design21FilterSearchGroups({ doctors, matchingDoctors: [], value }, "language");
  assert.deepEqual(groups[0].options.map(option => option.label), ["English"]);
  assert.equal(groups[0].options[0].selected, true);
  assert.deepEqual(groups[0].options[0].nextFilters.languages, []);
});
test("popover expertise respects selected speciality and availability stays single-select", () => {
  const doctors = [make("a", { hospital: true, video: true }, {}, { expertise: ["Cardiac surgery"] }),
    make("b", { hospital: true, video: true }, {}, { speciality: "Dermatology", expertise: ["Skin surgery"] })];
  const value = { ...emptyDoctorFilters(), specialties: ["Cardiology"], availability: "today" };
  assert.deepEqual(design21FilterSearchGroups({ doctors, value: { ...value, availability: "any" } }, "surgery")[0].options.map(option => option.label), ["Cardiac surgery"]);
  const options = design21FilterSearchGroups({ doctors, value }, "availability")[0].options;
  assert.equal(options.find(option => option.label === "Today").nextFilters.availability, "any");
  assert.equal(options.find(option => option.label === "Tomorrow").nextFilters.availability, "tomorrow");
  assert.equal(design21FilterSearchGroups({ doctors, value, customDateLabel: "Sat, 7 Nov" }, "7 Nov")[0].options[0].clearCustomDate, true);
});
const run = (filters = emptyDoctorFilters(), mode = "hospital", sort = "relevance", date = "") => refineDesign21Doctors(source, filters, mode, sort, date, false, new Set(), now);

test("D21 unfiltered shows both modes once in directory order", () => {
  assert.deepEqual(run().map(d => d.id), source.map(d => d.id));
  assert.deepEqual(run(emptyDoctorFilters(), "video").map(d => d.id), [video.id, both.id]);
  assert.deepEqual(filterDoctors(source, emptyDoctorFilters(), "hospital", now).map(d => d.id), [hospital.id, both.id]);
});
test("combined date filtering and booking mode use the matching slot, never stale other-mode availability", () => {
  const results = run(emptyDoctorFilters(), "hospital", "relevance", "2026-11-02");
  assert.equal(results.length, 3);
  const matching = results.find(d => d.id === both.id);
  assert.equal(matching.availability.hospital, undefined);
  assert.equal(design21CardMode(matching, "hospital", now), "video");
  assert.deepEqual(run(emptyDoctorFilters(), "hospital", "relevance", "2026-11-03").map(d => d.id), [both.id]);
  assert.equal(run(emptyDoctorFilters(), "hospital", "relevance", "2026-11-03")[0].availability.video, undefined);
});
test("earliest sorts across offered modes without changing filters", () => {
  assert.deepEqual(run(emptyDoctorFilters(), "hospital", "earliest").map(d => d.id), [both.id, video.id, hospital.id]);
});
test("all-mode facet counts count each doctor once and dates can match either mode", () => {
  assert.equal(doctorFilterOptions(source, emptyDoctorFilters(), "all", "specialties")[0].count, 3);
  assert.deepEqual(filterDoctors(source, { ...emptyDoctorFilters(), availability: "tomorrow" }, "all", now).map(d => d.id), [both.id]);
});
test("different groups intersect and multiple values within one group broaden", () => {
  const filters = { ...emptyDoctorFilters(), hospitals: ["Hospital A", "Hospital B"], expertise: ["Heart failure"] };
  assert.equal(run(filters).length, 3);
  assert.equal(run({ ...filters, languages: ["Kannada"] }).length, 0);
});
test("later-date recovery searches both consultation modes while keeping other filters", () => {
  const recovery = findDesign21NextAvailability([both], emptyDoctorFilters(), "hospital", "relevance", "2026-11-02", false, new Set(), now);
  assert.equal(recovery.date, "2026-11-03");
  assert.equal(findDesign21NextAvailability([both], { ...emptyDoctorFilters(), languages: ["Kannada"] }, "hospital", "relevance", "2026-11-02", false, new Set(), now), null);
});
test("incompatible hospital recovery preserves valid selections", () => {
  assert.deepEqual(incompatibleHospitalFilters(source, { ...emptyDoctorFilters(), hospitals: ["Hospital A", "Hospital B"] }), ["Hospital B"]);
  assert.equal(matchesDesign21Filter("Adult Cardiology", "heart specialist"), true);
  assert.equal(matchesDesign21Filter("Dermatology", "skin"), true);
  assert.equal(matchesDesign21Filter("Cardiology", "skin"), false);
});
test("D21 survives refinement links, direct booking and returns from D20 checkout", () => {
  const back = "/search/doctors?design=d21&location=Bangalore&languages=English&mode=video";
  assert.equal(new URL(doctorListingUrl("/search/doctors", new URLSearchParams(back.split("?")[1])), "https://nh.local").searchParams.get("design"), "d21");
  assert.equal(new URL(design20ListingReturnTo(back), "https://nh.local").searchParams.get("design"), "d21");
  assert.equal(new URL(design20BookingEntryUrl(both, "video", "2026-11-02", back), "https://nh.local").searchParams.get("design"), "d21");
  const draft = { doctorId: both.id, selection: { doctorId: both.id, mode: "video", hospital: both.hospital, date: "2026-11-02", time: "09:00 AM" }, stage: "appointment" };
  const flow = new URL(design20FlowUrl(draft, back), "https://nh.local");
  assert.equal(flow.searchParams.get("design"), "d20");
  assert.equal(new URL(flow.searchParams.get("returnTo"), "https://nh.local").searchParams.get("design"), "d21");
  assert.equal(new URL(design20InlineUrl(draft, back), "https://nh.local").searchParams.get("design"), "d21");
  assert.equal(new URL(design20ListingReturnTo("/search/doctors?design=d20"), "https://nh.local").searchParams.get("design"), "d21");
  assert.doesNotThrow(() => design20ListingReturnTo("http://[malformed"));
  assert.match(design20ListingReturnTo("https://evil.example?design=d21"), /^\/search\/doctors\?/);
});

test("profile links retain the D21 listing as their return destination", () => {
  const url = new URL(design17ProfileUrl(both, "video", "", false, "d20", "/search/doctors?design=d21&languages=English"), "https://nh.local");
  const back = new URL(url.searchParams.get("returnTo"), "https://nh.local");
  assert.equal(back.searchParams.get("design"), "d21");
  assert.equal(back.searchParams.get("languages"), "English");
});
test("targeted recovery only clears the offered category and aliases avoid substring collisions", () => {
  const filters = { ...emptyDoctorFilters(), expertise: ["Not supplied"], hospitals: ["Hospital A"] };
  const recovery = design21FilterRecovery(source, filters, "hospital", "relevance", "", false, new Set(), now);
  assert.equal(recovery.label, "expertise");
  assert.equal(recovery.count, 3);
  assert.deepEqual(recovery.filters.hospitals, ["Hospital A"]);
  assert.deepEqual(filters.expertise, ["Not supplied"]);
  assert.equal(matchesDesign21Filter("E.N.T", "ear"), true);
  assert.equal(matchesDesign21Filter("Child Development", "ear"), false);
});

const { design21AppliedFilters } = await import("../src/features/search/design21AppliedFilters.ts");
test("applied summary exposes every category and removes only the targeted value", () => {
  const filters = { specialties: ["Cardiology", "Neurology"], expertise: ["Heart failure"], hospitals: ["Hospital A"], languages: ["English"], genders: ["Female"], availability: "today" };
  const changed = [];
  const tags = design21AppliedFilters(filters, next => changed.push(next));
  assert.equal(tags.length, 7);
  for (const tag of tags) {
    tag.remove();
    const next = changed.at(-1);
    if (tag.key === "availability") assert.deepEqual(next, { ...filters, availability: "any" });
    else {
      const key = tag.key.split("-")[0];
      assert.deepEqual(next, { ...filters, [key]: filters[key].filter(value => value !== tag.label) });
      assert.match(tag.accessibleLabel, /^Remove .* filter:/);
    }
  }
  assert.deepEqual(filters.specialties, ["Cardiology", "Neurology"]);
});
test("applied summary retains custom date, video and history actions without duplicating state", () => {
  const removed = [];
  const extras = ["appointmentDate", "mode", "previouslyBooked"].map(key => ({ key, label: key, remove: () => removed.push(key) }));
  const chips = design21AppliedFilters(emptyDoctorFilters(), () => assert.fail("An extra chip must use its own state action"), extras);
  assert.deepEqual(chips.map(chip => chip.key), extras.map(chip => chip.key));
  chips.forEach(chip => chip.remove());
  assert.deepEqual(removed, extras.map(chip => chip.key));
  assert.deepEqual(design21AppliedFilters(emptyDoctorFilters(), () => {}), []);
});

test("summary omits smart-chip selections but retains independent panel selections", () => {
  const filters = { ...emptyDoctorFilters(), specialties: ["Cardiology"], languages: ["Kannada", "English"], availability: "today" };
  const extra = ["appointmentDate", "mode", "previouslyBooked"].map(key => ({ key, label: key, remove: () => {} }));
  const represented = ["availability", "languages-Kannada", ...extra.map(chip => chip.key)];
  const changes = [];
  const chips = design21AppliedFilters(filters, next => changes.push(next), extra, represented);
  assert.deepEqual(chips.map(chip => chip.key), ["specialties-Cardiology", "languages-English"]);
  chips[1].remove();
  assert.deepEqual(changes[0], { ...filters, languages: ["Kannada"] });
  assert.equal(design21AppliedFilters({ ...emptyDoctorFilters(), availability: "today" }, () => {}, extra, represented).length, 0);
});
test("panel-only availability and languages stay visible when no smart chip represents them", () => {
  const filters = { ...emptyDoctorFilters(), availability: "week", languages: ["English"] };
  const chips = design21AppliedFilters(filters, () => {}, [], ["mode", "appointmentDate", "previouslyBooked"]);
  assert.deepEqual(chips.map(chip => chip.key), ["languages-English", "availability"]);
});
