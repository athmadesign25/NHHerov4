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

const { design20DirectorySource } = await import('../src/features/search/design20DirectoryData.ts');
const { design20FeaturedClinicalSource } = await import('../src/features/search/design20FeaturedClinicalMetadata.ts');
const { searchDoctorsData } = await import('../src/app/search/mockDoctors.ts');
const { allSearchDataDoctors } = await import('../src/components/search/NHSearchExperience/searchData.ts');
const { design20BangaloreDoctors, design20Directory, design20SearchableIds, getDesign20BookingDoctor, getDesign20ProfileDoctor, getDesign20RelatedDoctors } = await import('../src/features/search/design20Directory.ts');
const { getDesign3BookingDoctor } = await import('../src/features/booking/doctors.ts');
const { getDesign17ProfileDoctor } = await import('../src/features/search/design17Profile.ts');
const { design16DoctorsInLocation, refineDesign16Doctors } = await import('../src/features/search/design16Refinements.ts');
const { emptyDoctorFilters, filterDoctors, doctorFilterOptions } = await import('../src/features/search/doctorListing.ts');
const { searchDesign17Directory } = await import('../src/features/search/design17DirectorySearch.ts');
const { getDesign20Availability } = await import('../src/features/search/design20Availability.ts');
const { design20BookingEntryUrl, design20DoctorRecoveryUrl } = await import('../src/features/search/design20BookingEntry.ts');
const { getDesign3BookingSlots } = await import('../src/features/booking/design3Availability.ts');
const { indiaClock, indiaDate } = await import('../src/features/booking/appointmentTime.ts');
const { Design15DraftStore } = await import('../src/features/booking/design15/serverDraftStore.ts');
const { Design20DraftStore, restoreDesign20DraftMethods } = await import('../src/features/booking/design20/serverDraftStore.ts');
const { patientsForIdentity } = await import('../src/features/booking/design15/model.ts');
const { design20Available, design20RequestedSelection, confirmDesign20, design20SafeStep, design20ContinuePhase, design20InlineUrl, design20FlowUrl } = await import('../src/features/booking/design20/model.ts');
const now = new Date('2026-10-28T02:00:00Z');

test('public search doctor IDs enter D20 without changing clinician identity', () => {
  for (const source of allSearchDataDoctors) {
    const doctor = getDesign20BookingDoctor(source.id, source.name);
    assert.ok(doctor, source.id);
    assert.equal(doctor.name.toLowerCase(), source.name.toLowerCase());
    const profile = getDesign20ProfileDoctor(source.id, new URLSearchParams({ name: source.name }));
    assert.equal(profile.id, doctor.id);
    assert.equal(profile.name, doctor.name);
    const mode = profile.modes.hospital ? 'hospital' : 'video';
    assert.ok(getDesign3BookingSlots(doctor.id, '2026-10-29', mode, doctor.hospital, now, 15, 'd20').some(slot => slot.available), source.id);
  }
  assert.equal(getDesign20BookingDoctor('doc-devi-shetty').id, 'dr-1');
  assert.equal(getDesign20BookingDoctor('dr-devi-prasad-shetty').id, 'dr-1');
  assert.equal(getDesign20BookingDoctor('dr-arun-krishnan').id, 'dr-3');
  assert.equal(getDesign20BookingDoctor('dr-rajiv-menon').name, 'Dr. Rajiv Menon');
  for (const unknown of ['unknown-doctor', 'dr-1-extra', 'devi']) assert.equal(getDesign20BookingDoctor(unknown), null);
});

test('public booking handoffs open D20 slots with the selected doctor and retain discovery context', () => {
  const doctor = getDesign20ProfileDoctor('doc-devi-shetty', new URLSearchParams());
  const returnTo = '/search/doctors?design=d17-lite&location=Bangalore&languages=Kannada&mode=hospital';
  const target = new URL(design20BookingEntryUrl(doctor, 'video', '2026-10-29', returnTo), 'https://nh.local');
  assert.equal(target.pathname, '/search/doctors');
  assert.equal(target.searchParams.get('design'), 'd20');
  assert.equal(target.searchParams.get('booking'), 'dr-1');
  assert.equal(target.searchParams.get('bookingMode'), 'video');
  assert.equal(target.searchParams.get('mode'), 'hospital');
  assert.equal(target.searchParams.get('hospital'), doctor.hospital);
  assert.equal(target.searchParams.get('date'), '2026-10-29');
  assert.equal(target.searchParams.get('languages'), 'Kannada');
  assert.equal(target.searchParams.has('time'), false);
  assert.equal(target.searchParams.has('step'), false);
  assert.equal(new URL(design20BookingEntryUrl(doctor, 'hospital', '', '//external.test'), 'https://nh.local').origin, 'https://nh.local');
});

test('unresolved doctor URLs recover through D20 discovery using supplied public context only', () => {
  const target = new URL(design20DoctorRecoveryUrl(new URLSearchParams({ name: 'Dr. Example & Partner', city: 'Bangalore',
    mode: 'video', returnTo: '//external.test', patient: 'Private detail', time: '10:00 AM', design: 'd3' })), 'https://nh.local');
  assert.equal(target.pathname, '/search/doctors');
  assert.deepEqual(Object.fromEntries(target.searchParams), { q: 'Dr. Example & Partner', location: 'Bangalore', mode: 'video', design: 'd20' });
  assert.equal(design20DoctorRecoveryUrl(new URLSearchParams()), '/search/doctors?design=d20');
});

test('every official Bangalore unit has six distinct verified sampled doctors and a matching filter', () => {
  assert.equal(design20DirectorySource.units.length, 16);
  assert.equal(design20BangaloreDoctors.length, 72);
  assert.equal(new Set(design20BangaloreDoctors.map(doctor => doctor.id)).size, 72);
  for (const unit of design20DirectorySource.units) {
    assert.equal(new Set(unit.sampledDoctorIds).size, 6, unit.name);
    const matches = filterDoctors(design20BangaloreDoctors, { ...emptyDoctorFilters(), hospitals: [unit.name] }, 'hospital', now);
    for (const id of unit.sampledDoctorIds) assert.ok(matches.some(doctor => doctor.id === `d20-${id}`), `${unit.name}: ${id}`);
  }
});

test('clinical fields retain captured values and displayed portraits exist, with unknown values left empty', () => {
  for (const source of design20DirectorySource.doctors) {
    const doctor = design20BangaloreDoctors.find(item => item.id === `d20-${source.id}`);
    assert.equal(doctor.name, source.name);
    assert.equal(doctor.degrees, source.qualifications);
    assert.equal(doctor.speciality, source.specialties.join(', '));
    assert.equal(doctor.experience, source.experienceLabel ?? '');
    assert.deepEqual(doctor.languages, source.languages ?? []);
    assert.deepEqual(doctor.expertise, source.expertise);
    assert.equal(doctor.rating, 0);
    assert.equal(doctor.reviews, 0);
    if (source.imageUrl) assert.ok(existsSync(path.join(root, 'public', doctor.img)), source.id);
    else assert.equal(doctor.img, '');
  }
});

test('D20 retains its three featured preview doctors without leaking new doctors into older resolvers', () => {
  assert.equal(design16DoctorsInLocation(design20Directory, 'Bangalore').length, 75);
  for (const doctor of design20BangaloreDoctors) {
    assert.equal(getDesign3BookingDoctor(doctor.id), null);
    assert.equal(getDesign17ProfileDoctor(doctor.id, new URLSearchParams()), null);
  }
  assert.ok(getDesign3BookingDoctor('dr-1'));
  assert.deepEqual(design20Directory.slice(0, 3).map(doctor => doctor.id), ['dr-1', 'dr-ashley', 'dr-3']);
  assert.equal(getDesign20BookingDoctor('dr-1').id, 'dr-1');
  assert.ok(design20Directory.some(doctor => doctor.city !== 'Bangalore'));
});

test('featured D20 doctors use official surgical metadata without replacing identities, photos or preview controls', () => {
  for (const [id, source] of Object.entries(design20FeaturedClinicalSource)) {
    const fixture = searchDoctorsData.find(doctor => doctor.id === id);
    const doctor = design20Directory.find(doctor => doctor.id === id);
    assert.equal(doctor.name, fixture.name);
    assert.equal(doctor.img, fixture.img);
    assert.equal(doctor.fee, fixture.fee);
    assert.deepEqual(doctor.availability, fixture.availability);
    assert.equal(doctor.designation, source.designation);
    assert.equal(doctor.speciality, source.specialties.join(', '));
    assert.deepEqual(doctor.specialityAliases, source.navigationAliases);
    assert.equal(doctor.degrees, source.qualifications);
    assert.deepEqual(doctor.expertise, source.expertise);
    assert.deepEqual(doctor.hospitals, source.hospitals);
    assert.equal(doctor.hospital, source.hospitals[0]);
    assert.match(doctor.experience, /^\d+ years experience$/); // Existing stakeholder-preview experience.
    assert.deepEqual(doctor.languages, []);
    assert.equal(doctor.gender, undefined);
    assert.equal(doctor.rating, 0);
    assert.equal(doctor.reviews, 0);
    const profile = getDesign20ProfileDoctor(id, new URLSearchParams());
    const booking = getDesign20BookingDoctor(id);
    assert.equal(profile.speciality, doctor.speciality);
    assert.equal(profile.degrees, doctor.degrees);
    assert.equal(profile.img, fixture.img);
    assert.equal(booking.speciality, doctor.speciality);
    assert.equal(booking.subSpeciality, doctor.degrees);
    assert.deepEqual(booking.locations.map(location => location.name), source.hospitals);
  }
});

test('featured surgeons use surgical labels and aliases while older design fixtures remain unchanged', () => {
  const matches = (speciality) => filterDoctors(design20Directory,
    { ...emptyDoctorFilters(), specialties: [speciality] }, 'hospital', now).map(doctor => doctor.id);
  for (const speciality of ['Adult Cardiac Surgery', 'Paediatric & Congenital Heart Surgery', 'Cardiac Surgeon']) {
    assert.ok(matches(speciality).includes('dr-1'), speciality);
  }
  assert.ok(!matches('Cardiologist').includes('dr-1'));
  assert.ok(matches('Paediatric Surgery').includes('dr-ashley'));
  assert.ok(matches('Paediatric Surgeon').includes('dr-ashley'));
  assert.ok(!matches('General Surgeon').includes('dr-ashley'));
  const legacySpecialties = { 'dr-1': 'Cardiologist', 'dr-ashley': 'General Surgeon' };
  for (const [id, speciality] of Object.entries(legacySpecialties)) {
    const fixture = searchDoctorsData.find(doctor => doctor.id === id);
    assert.equal(fixture.speciality, speciality);
    const olderProfile = getDesign17ProfileDoctor(id, new URLSearchParams());
    const olderBooking = getDesign3BookingDoctor(id);
    assert.equal(olderProfile.speciality, speciality);
    assert.equal(olderBooking.speciality, speciality);
    assert.deepEqual(olderProfile.hospitals, fixture.hospitals);
    assert.equal(olderProfile.degrees, fixture.degrees);
    assert.equal(olderProfile.experience, fixture.experience);
    assert.equal(olderProfile.rating, fixture.rating);
  }
  const untouched = getDesign17ProfileDoctor('dr-3', new URLSearchParams());
  const swapped = design20Directory.find(doctor => doctor.id === 'dr-3');
  const abhinandan = design20BangaloreDoctors.find(doctor => doctor.id === 'd20-dr-abhinandan-s-punit');
  assert.deepEqual(swapped, { ...untouched, hospital: abhinandan.hospital,
    hospitals: abhinandan.hospitals, hospitalCount: '+3' });
  const swappedAbhinandan = design20Directory.find(doctor => doctor.id === abhinandan.id);
  assert.equal(swappedAbhinandan.hospital, untouched.hospital);
  assert.deepEqual(swappedAbhinandan.hospitals, untouched.hospitals);
  assert.deepEqual(getDesign20BookingDoctor(swapped.id).locations.map(location => location.name), abhinandan.hospitals);
  assert.deepEqual(getDesign20BookingDoctor(abhinandan.id).locations.map(location => location.name), untouched.hospitals);
});

test('D20 featured profile selection and draft recovery accept only their corrected official affiliations', () => {
  const token = '12345678-1234-4234-8234-123456789012';
  const store = new Design20DraftStore(() => now.getTime());
  const identity = { method: 'email', value: 'directory-test@example.com' };
  const patients = patientsForIdentity(identity);
  try {
    for (const [id, source] of Object.entries(design20FeaturedClinicalSource)) {
      const doctor = getDesign20BookingDoctor(id);
      for (const hospital of source.hospitals) {
        const params = new URLSearchParams({ hospital, date: indiaDate(now, 1) });
        assert.equal(getDesign20ProfileDoctor(id, params).hospital, hospital);
        const selection = design20RequestedSelection(doctor, params, now.getTime());
        assert.equal(selection.hospital, hospital);
        const draft = { version: 1, doctorId: id, identity, patients, selectedPatientId: patients[0].id, selection, payment: 'hospital', failureHold: null, receipt: null, stage: 'appointment' };
        assert.equal(store.put(token, id, draft), 'saved');
        assert.equal(store.get(token, id).selection.hospital, hospital);
        assert.equal(store.put(token, id, { ...draft, selection: { ...selection, hospital: 'Narayana Health City, Bangalore' } }), 'invalid');
      }
    }
  } finally { store.dispose(); }
});

test('corrected featured affiliations retain matching D20 filter, card, booking and confirmation slots without changing older calendars', () => {
  const date = indiaDate(now, 1);
  const identity = { method: 'email', value: 'directory-test@example.com' };
  const patients = patientsForIdentity(identity);
  for (const id of Object.keys(design20FeaturedClinicalSource)) {
    const doctor = design20Directory.find(doctor => doctor.id === id);
    const fixture = searchDoctorsData.find(doctor => doctor.id === id);
    for (const hospital of doctor.hospitals) {
      const filters = { ...emptyDoctorFilters(), hospitals: [hospital] };
      for (const mode of ['hospital', 'video'].filter(mode => doctor.modes[mode] === true)) {
        const [refined] = refineDesign16Doctors([doctor], filters, mode, 'earliest', date, false, new Set(), now, {}, 'd20');
        assert.ok(refined, `${id}: ${hospital}: ${mode}`);
        assert.equal(refined.hospital, hospital);
        const advertised = getDesign20Availability(refined, mode, date, 'any', now);
        assert.ok(advertised);
        const selection = design20RequestedSelection(getDesign20BookingDoctor(id), new URLSearchParams({ hospital, mode, date }), now.getTime());
        selection.time = indiaClock(advertised);
        assert.ok(getDesign3BookingSlots(id, date, mode, hospital, now, 21, 'd20').some(slot => slot.available && slot.time === selection.time));
        assert.equal(design20Available(selection, now.getTime()), true);
        const draft = { version: 1, doctorId: id, identity, patients, selectedPatientId: patients[0].id, selection, payment: mode === 'hospital' ? 'hospital' : 'online', failureHold: null, receipt: null, stage: 'review' };
        assert.equal(design20ContinuePhase(draft, true, now.getTime()), 'member');
        assert.equal(design20SafeStep('review', draft, true, now.getTime()), 'review');
        assert.ok(confirmDesign20({ ...draft, stage: mode === 'video' ? 'payment' : 'review' }, true, mode === 'video', now.getTime()));
      }
      if (!fixture.hospitals.includes(hospital)) {
        assert.deepEqual(getDesign3BookingSlots(id, date, 'hospital', hospital, now, 21), []);
      }
    }
    const legacyHospital = 'Narayana Health City, Bangalore';
    const legacySlots = getDesign3BookingSlots(id, date, 'hospital', legacyHospital, now, 21);
    const legacySelection = { doctorId: id, mode: 'hospital', hospital: legacyHospital, date, time: legacySlots.find(slot => slot.available).time };
    assert.equal(design20Available(legacySelection, now.getTime()), false);
    assert.deepEqual(getDesign3BookingSlots(id, date, 'hospital', legacyHospital, now, 21, 'd20'), []);
  }
});

test('official department names support existing specialty landing terms and name search', () => {
  const filters = { ...emptyDoctorFilters(), specialties: ['Cardiologist'] };
  const cardiologists = filterDoctors(design20BangaloreDoctors, filters, 'hospital', now);
  assert.ok(cardiologists.length > 0);
  assert.ok(cardiologists.every(doctor => doctor.speciality.includes('Cardiology') || doctor.speciality.includes('Heart Failure')));
  const option = doctorFilterOptions(design20BangaloreDoctors, filters, 'hospital', 'specialties').find(item => item.value === 'Cardiologist');
  assert.equal(option.count, cardiologists.length);
  assert.ok(searchDesign17Directory(design20Directory, 'Abhinandan', design20SearchableIds).some(doctor => doctor.name === 'Dr. Abhinandan S Punit'));
  assert.equal(searchDesign17Directory(design20BangaloreDoctors, 'Abhinandan').length, 0);
});

test('every displayed sample hospital and both simulated modes preserve their advertised slot into booking', () => {
  for (const doctor of design20Directory.filter(doctor => design20BangaloreDoctors.some(source => source.id === doctor.id))) {
    for (const hospital of doctor.hospitals) {
      const selected = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital }));
      assert.equal(selected.hospital, hospital);
      for (const mode of ['hospital', 'video']) {
        const slot = getDesign20Availability(selected, mode, indiaDate(now, 1), 'any', now);
        assert.ok(slot, `${doctor.id} ${hospital} ${mode}`);
        assert.equal(indiaDate(slot), indiaDate(now, 1));
        const slots = getDesign3BookingSlots(doctor.id, indiaDate(slot), mode, hospital, now, 21, 'd20');
        assert.ok(slots.some(item => item.available && item.time === indiaClock(slot)));
      }
    }
    assert.deepEqual(getDesign3BookingSlots(doctor.id, indiaDate(now), 'hospital', 'Unrelated hospital', now), []);
  }
});

test('selected hospitals and dates survive refinement, profile, review and return navigation', () => {
  const source = design20Directory.find(doctor => doctor.id.startsWith("d20-") && doctor.hospitals.length > 1);
  const hospital = source.hospitals[1];
  const [refined] = refineDesign16Doctors([source], { ...emptyDoctorFilters(), hospitals: [hospital] }, 'hospital', 'relevance', indiaDate(now, 1), false, new Set(), now, {}, 'd20');
  assert.equal(refined.hospital, hospital);
  const doctor = getDesign20BookingDoctor(source.id);
  const selection = design20RequestedSelection(doctor, new URLSearchParams({ hospital, date: indiaDate(now, 1) }), now.getTime());
  selection.time = getDesign3BookingSlots(doctor.id, selection.date, 'hospital', hospital, now, 21, 'd20').find(slot => slot.available).time;
  const identity = { method: 'email', value: 'directory-test@example.com' };
  const patients = patientsForIdentity(identity);
  const draft = { version: 1, doctorId: doctor.id, identity, patients, selectedPatientId: patients[0].id, selection, payment: 'hospital', failureHold: null, receipt: null, stage: 'review' };
  assert.equal(design20ContinuePhase(draft, true, now.getTime()), 'member');
  const receipt = confirmDesign20(draft, true, false, now.getTime());
  assert.ok(receipt);
  const returnTo = '/search/doctors?design=d20&location=Bangalore';
  const review = new URL(design20FlowUrl(draft, returnTo), 'https://nh.local');
  assert.equal(review.pathname, `/doctors/${doctor.id}/book`);
  const inline = new URL(design20InlineUrl(draft, returnTo), 'https://nh.local');
  assert.equal(inline.searchParams.get('hospital'), hospital);
  assert.equal(inline.searchParams.get('booking'), doctor.id);
  const confirmation = new URL(design20FlowUrl({ ...draft, stage: 'confirmation', receipt }, returnTo), 'https://nh.local');
  assert.equal(confirmation.pathname, `/doctors/${doctor.id}/book/confirmation`);
  assert.ok(getDesign20RelatedDoctors(doctor.id, 'hospital').every(other => other.id !== doctor.id));
});

test('D20 recovery accepts real IDs only in its own store and rejects unrelated hospitals', () => {
  const doctor = getDesign20BookingDoctor(design20BangaloreDoctors[0].id);
  const selection = design20RequestedSelection(doctor, new URLSearchParams(), now.getTime());
  const identity = { method: 'email', value: 'directory-test@example.com' };
  const patients = patientsForIdentity(identity);
  const draft = { version: 1, doctorId: doctor.id, identity, patients, selectedPatientId: patients[0].id, selection, payment: 'online', failureHold: null, receipt: null, stage: 'appointment' };
  const token = '12345678-1234-4234-8234-123456789012';
  const d20 = new Design20DraftStore(() => now.getTime());
  const d15 = new Design15DraftStore(() => now.getTime());
  try {
    assert.equal(d20.put(token, doctor.id, draft), 'saved');
    assert.equal(d20.get(token, doctor.id).selection.hospital, doctor.hospital);
    // Model the persisted instance from the earlier constructor-injected resolver.
    Object.defineProperty(d20, 'resolveDoctor', { value: () => null, configurable: true });
    assert.equal(d20.put(token, doctor.id, draft), 'invalid');
    restoreDesign20DraftMethods(d20);
    assert.equal(d20.get(token, doctor.id).selection.hospital, doctor.hospital);
    assert.equal(d20.put(token, doctor.id, draft), 'saved');
    assert.equal(d15.put(token, doctor.id, draft), 'invalid');
    assert.equal(d15.get(token, doctor.id), null);
    assert.equal(d20.put(token, doctor.id, { ...draft, selection: { ...selection, hospital: 'Unrelated hospital' } }), 'invalid');
  } finally { d20.dispose(); d15.dispose(); }
});

const { design17ConsultationHistory } = await import('../src/features/search/design17ConsultationHistory.ts');
const { getDesign16LanguageShortcut } = await import('../src/features/search/design16Language.ts');

test('D20 consulted history resolves to its real Bangalore IDs without changing older design seeds', () => {
  const session = new Set(['existing-session-doctor']);
  const context = { variant: 'd20', live: false, authenticated: true };
  const history = design17ConsultationHistory(session, context);
  assert.deepEqual([...session], ['existing-session-doctor']);
  assert.ok(history.has('existing-session-doctor'));
  for (const mode of ['hospital', 'video']) {
    const doctors = refineDesign16Doctors(design20BangaloreDoctors, emptyDoctorFilters(), mode, 'relevance', '', true, history, now);
    assert.deepEqual(doctors.map(doctor => doctor.id), ['d20-dr-abhinandan-s-punit', 'd20-dr-akhila-vasanth-hassan']);
  }
  for (const variant of ['d17', 'd17-lite', 'd18', 'd19']) {
    assert.deepEqual([...design17ConsultationHistory(new Set(), { ...context, variant })], ['dr-1', 'dr-3']);
  }
  assert.equal(design17ConsultationHistory(session, { ...context, authenticated: false }), session);
  assert.equal(design17ConsultationHistory(session, { ...context, live: true }), session);
});

test('D20 hides unsupported language suggestions and can enable a supplied language without invented facts', () => {
  const filters = emptyDoctorFilters();
  assert.equal(getDesign16LanguageShortcut(design20BangaloreDoctors, filters, 'hospital', 'Bangalore', now, undefined, true), null);
  assert.equal(getDesign16LanguageShortcut(design20BangaloreDoctors, { ...filters, languages: ['Kannada'] }, 'hospital', 'Bangalore', now, undefined, true), null);
  const doctor = { ...design20BangaloreDoctors[0], languages: ['Kannada'] };
  assert.deepEqual(getDesign16LanguageShortcut([doctor], filters, 'hospital', 'Bangalore', now, undefined, true), { value: 'Kannada', selected: false, count: 1 });
  assert.equal(getDesign16LanguageShortcut([{ ...doctor, languages: ['English'] }], filters, 'hospital', 'Bangalore', now, undefined, true), null);
  assert.deepEqual(getDesign16LanguageShortcut(design20BangaloreDoctors, filters, 'hospital', 'Bangalore', now), { value: 'Kannada', selected: false, count: 0 });
});
