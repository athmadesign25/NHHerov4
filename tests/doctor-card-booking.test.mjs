import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
registerHooks({
  resolve(specifier, context, nextResolve) {
    const candidate = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2))
      : specifier.startsWith('.') && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + '.ts')) return nextResolve(pathToFileURL(candidate + '.ts').href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith('.ts') && !url.includes('/node_modules/')) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const listing = await import('../src/features/search/doctorListing.ts');
const { getDesign3BookingSlots, isDesign3BookingSlotAvailable } = await import('../src/features/booking/design3Availability.ts');
const { generateTimeSlots } = await import('../src/features/booking/useBookingState.ts');
const { searchDoctorsData } = await import('../src/app/search/mockDoctors.ts');
const { design3CityDoctors } = await import('../src/features/search/design3CityDoctors.ts');
const { getDesign3BookingDoctor } = await import('../src/features/booking/doctors.ts');
const doctors = searchDoctorsData.map(listing.fromDirectoryDoctor);
const morning = new Date(2026, 9, 19, 9);

test('elapsed, invalid and unsupported appointment times are not next available slots', () => {
  const doctor = doctors[0];
  assert.equal(listing.nextSlot(doctor, 'hospital', new Date(2026, 9, 19, 10, 30)), null);
  assert.equal(listing.nextSlot(doctor, 'hospital', new Date(2026, 9, 19, 12)), null);
  assert.equal(listing.nextSlot({...doctor, availability: {hospital: '2026-02-30, 10:30 AM'}}, 'hospital', morning), null);
  assert.equal(listing.nextSlot({...doctor, modes: {...doctor.modes, hospital: false}}, 'hospital', morning), null);
  assert.equal(listing.nextSlot(doctor, 'hospital', morning)?.getHours(), 10);
});

test('today and earliest filters do not promote past times, while doctors remain discoverable', () => {
  const now = new Date(2026, 9, 19, 12);
  const past = {...doctors[0], id: 'past'};
  const future = {...doctors[0], id: 'future', availability: {hospital: 'Today, 02:00 PM'}};
  const filters = listing.emptyDoctorFilters();
  assert.equal(listing.filterDoctors([past, future], filters, 'hospital', now).length, 2);
  assert.deepEqual(listing.filterDoctors([past, future], {...filters, availability: 'today'}, 'hospital', now).map(d => d.id), ['future']);
  assert.deepEqual(listing.sortDoctors([past, future], 'earliest', 'hospital', now).map(d => d.id), ['future', 'past']);
  const url = new URL(listing.bookingUrl(past, 'hospital', true, now), 'http://localhost');
  assert.equal(url.searchParams.has('time'), false);
  assert.equal(url.searchParams.has('date'), false);
});

test('a matching secondary hospital is displayed and passed to booking without mutating the doctor', () => {
  const original = doctors[0];
  const secondary = original.hospitals[1];
  const selected = listing.withSelectedDoctorHospital(original, [secondary]);
  assert.notEqual(selected, original);
  assert.equal(selected.hospital, secondary);
  assert.deepEqual(listing.doctorHospitals(selected).sort(), listing.doctorHospitals(original).sort());
  assert.notEqual(original.hospital, secondary);
  const url = new URL(listing.bookingUrl(selected, 'hospital', true, morning), 'http://localhost');
  assert.equal(url.searchParams.get('hospital'), secondary);
  assert.equal(listing.withSelectedDoctorHospital(original, ['Unrelated hospital']), original);
});

test('the Design 3 booking grid includes the listing time and starts at the advertised next slot', () => {
  const doctor = doctors[0];
  const slots = getDesign3BookingSlots(doctor.id, '2026-10-19', 'hospital', doctor.hospital, morning);
  assert.ok(slots.find(slot => slot.time === '10:30 AM')?.available);
  assert.equal(slots.find(slot => slot.time === '09:45 AM')?.available, false);
  assert.equal(slots.find(slot => slot.available)?.time, '10:30 AM');
  assert.ok(slots.filter(slot => slot.available).length > 1, 'the existing preview calendar retains additional choices');
  assert.equal(isDesign3BookingSlotAvailable(doctor.id, '2026-10-19', '10:30 AM', 'hospital', doctor.hospitals[1], morning), true);
});

test('all future advertised fixture slots can be selected on the matching booking date and mode', () => {
  for (const doctor of [...doctors, ...design3CityDoctors]) {
    for (const mode of ['hospital', 'video']) {
      const url = new URL(listing.bookingUrl(doctor, mode, true, morning), 'http://localhost');
      const time = url.searchParams.get('time');
      if (!time) continue;
      assert.equal(isDesign3BookingSlotAvailable(doctor.id, url.searchParams.get('date'), time, mode, doctor.hospital, morning), true, `${doctor.id}: ${mode}`);
    }
  }
});

test('one to four unique preview affiliations remain selectable through the booking flow', () => {
  const affiliationCounts = new Set();
  for (const doctor of design3CityDoctors) {
    const affiliations = listing.doctorHospitals(doctor);
    affiliationCounts.add(affiliations.length);
    assert.equal(doctor.hospitals.length, affiliations.length, `${doctor.id}: no duplicate affiliations`);
    assert.equal(affiliations[0], doctor.hospital, `${doctor.id}: primary hospital stays first`);
    const bookingDoctor = getDesign3BookingDoctor(doctor.id);
    assert.ok(bookingDoctor, `${doctor.id}: exact booking lookup`);
    assert.deepEqual(bookingDoctor.locations.map(location => location.name), affiliations);
    for (const hospital of affiliations) {
      const selected = listing.withSelectedDoctorHospital(doctor, [hospital]);
      const url = new URL(listing.bookingUrl(selected, 'hospital', true, morning), 'http://localhost');
      assert.equal(url.searchParams.get('hospital'), hospital);
      assert.equal(isDesign3BookingSlotAvailable(doctor.id, url.searchParams.get('date'), url.searchParams.get('time'), 'hospital', hospital, morning), true, `${doctor.id}: ${hospital}`);
    }
  }
  assert.deepEqual([...affiliationCounts].sort(), [1, 2, 3, 4]);
});

test('tomorrow availability does not manufacture earlier appointments today', () => {
  const doctor = doctors.find(d => d.id === 'dr-ashley');
  assert.equal(getDesign3BookingSlots(doctor.id, '2026-10-19', 'hospital', doctor.hospital, morning).some(slot => slot.available), false);
  assert.equal(getDesign3BookingSlots(doctor.id, '2026-10-20', 'hospital', doctor.hospital, morning).find(slot => slot.available)?.time, '11:30 AM');
});

test('Design 3 rejects arbitrary, elapsed and invalid booking selections', () => {
  const doctor = doctors[0];
  const valid = (date, time, mode = 'hospital', hospital = doctor.hospital, now = morning) =>
    isDesign3BookingSlotAvailable(doctor.id, date, time, mode, hospital, now);
  assert.equal(valid('2026-10-19', '10:31 AM'), false);
  assert.equal(valid('2026-10-19', '10:30 AM', 'hospital', doctor.hospital, new Date(2026, 9, 19, 11)), false);
  assert.equal(valid('2026-10-18', '10:30 AM'), false);
  assert.equal(valid('2026-11-03', '10:30 AM'), false);
  assert.equal(valid('2026-02-30', '10:30 AM'), false);
  assert.equal(valid('2026-10-19', '10:30 AM', 'hospital', 'Unrelated hospital'), false);
  assert.deepEqual(getDesign3BookingSlots('unknown-doctor', '2026-10-19', 'hospital', doctor.hospital, morning), []);
  const hospitalOnly = doctors.find(d => d.id === 'dr-ashley');
  assert.deepEqual(getDesign3BookingSlots(hospitalOnly.id, '2026-10-20', 'video', hospitalOnly.hospital, morning), []);
});

test('Original and Design 2 retain the unchanged shared mock time grid', () => {
  const original = generateTimeSlots();
  assert.equal(original.length, 18);
  assert.equal(original.find(slot => slot.time === '10:15 AM')?.available, false);
  assert.equal(original.some(slot => slot.time === '10:30 AM'), false);
});
