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

const { design7Doctors, matchesDoctorQuery, searchDesign7Directory, refineDesign7Doctors, design7BookingUrl, design7HospitalCity } = await import('../src/app/search/designs/d7/directory.ts');
const { emptyDoctorFilters, doctorHospitals, doctorFilterOptions } = await import('../src/features/search/doctorListing.ts');
const { isDesign3BookingSlotAvailable } = await import('../src/features/booking/design3Availability.ts');
const now = new Date(2026, 9, 20, 8, 0);
const shetty = design7Doctors.find(doctor => doctor.id === 'dr-1');

test('D7 name, speciality and affiliated hospital search is case-insensitive and combines words', () => {
  assert.ok(matchesDoctorQuery(shetty, '  SHEtTy cardiologist  '));
  assert.ok(matchesDoctorQuery(shetty, 'Mazumdar Shetty'));
  assert.ok(matchesDoctorQuery(shetty, ''));
  assert.equal(matchesDoctorQuery(shetty, 'Shetty neurosurgery'), false);
});

test('empty query preserves the directory while an unknown query produces the recoverable empty state', () => {
  assert.equal(searchDesign7Directory('   ', 'All').length, design7Doctors.length);
  assert.deepEqual(searchDesign7Directory('<not-a-doctor>?invalid=', 'All'), []);
  assert.ok(searchDesign7Directory('shetty', 'Bangalore').some(doctor => doctor.id === 'dr-1'));
});

test('city selection and empty-city results remain accurate, including the Bengaluru alias', () => {
  const bangalore = searchDesign7Directory('', 'Bangalore');
  assert.ok(bangalore.length > 0);
  assert.ok(bangalore.every(doctor => doctor.city === 'Bangalore'));
  assert.deepEqual(searchDesign7Directory('', 'Bengaluru'), bangalore);
  assert.deepEqual(searchDesign7Directory('', 'Hosur'), []);
  assert.equal(searchDesign7Directory('Shetty', 'Mumbai').length, 0);
});

test('hospital and video refinements remove doctors who do not offer that mode', () => {
  const doctors = searchDesign7Directory('', 'Bangalore');
  const hospital = refineDesign7Doctors(doctors, emptyDoctorFilters(), 'hospital', 'relevance', now);
  const video = refineDesign7Doctors(doctors, emptyDoctorFilters(), 'video', 'relevance', now);
  assert.ok(hospital.some(doctor => doctor.id === 'dr-ashley'));
  assert.equal(video.some(doctor => doctor.id === 'dr-ashley'), false);
  assert.ok(video.some(doctor => doctor.id === 'dr-2'));
  assert.equal(hospital.some(doctor => doctor.id === 'dr-2'), false);
  assert.equal(hospital[0].modes.hospital, true);
});

test('speciality, hospital and language filters combine and carry the selected affiliation forward', () => {
  const hospital = 'Mazumdar Shaw Medical Centre, Bangalore';
  const filters = { ...emptyDoctorFilters(), specialties: ['Cardiologist'], hospitals: [hospital], languages: ['Kannada'] };
  const results = refineDesign7Doctors(searchDesign7Directory('', 'Bangalore'), filters, 'hospital', 'relevance', now);
  assert.ok(results.some(doctor => doctor.id === 'dr-1'));
  assert.ok(results.every(doctor => doctor.speciality.includes('Cardiologist') && doctor.languages.includes('Kannada') && doctor.hospital === hospital));
  const url = new URL(design7BookingUrl(results.find(doctor => doctor.id === 'dr-1'), 'hospital', now), 'https://example.test');
  assert.equal(url.searchParams.get('hospital'), hospital);
});

test('impossible combined filters remain empty instead of silently dropping the user selection', () => {
  const filters = { ...emptyDoctorFilters(), specialties: ['Cardiologist'], hospitals: ['Hospital that does not exist'] };
  assert.deepEqual(refineDesign7Doctors(design7Doctors, filters, 'hospital', 'relevance', now), []);
});

test('price sorting and date filters use the same known values as the existing directory', () => {
  const filters = { ...emptyDoctorFilters(), availability: 'tomorrow' };
  const results = refineDesign7Doctors(searchDesign7Directory('', 'Bangalore'), filters, 'hospital', 'fee_asc', now);
  assert.ok(results.length > 0);
  assert.ok(results.every(doctor => doctor.availability.hospital.startsWith('Tomorrow')));
  const fees = results.map(doctor => Number(doctor.fee.replace(/[^\d.]/g, '')));
  assert.deepEqual(fees, [...fees].sort((a, b) => a - b));
});

test('booking URL preserves D7, doctor, hospital, city, mode and the exact available listing slot', () => {
  const url = new URL(design7BookingUrl(shetty, 'hospital', now), 'https://example.test');
  assert.equal(url.pathname, '/doctors/dr-1/book');
  assert.equal(url.searchParams.get('design'), 'd7');
  assert.equal(url.searchParams.get('mode'), 'hospital');
  assert.equal(url.searchParams.get('city'), 'Bangalore');
  assert.ok(doctorHospitals(shetty).includes(url.searchParams.get('hospital')));
  assert.equal(url.searchParams.get('date'), '2026-10-20');
  assert.equal(url.searchParams.get('time'), '10:30 AM');
  assert.ok(isDesign3BookingSlotAvailable(shetty.id, url.searchParams.get('date'), url.searchParams.get('time'), 'hospital', url.searchParams.get('hospital'), now));
});

test('video booking omits hospital and expired listing slots are never sent to booking', () => {
  const video = new URL(design7BookingUrl(shetty, 'video', now), 'https://example.test');
  assert.equal(video.searchParams.get('mode'), 'video');
  assert.equal(video.searchParams.has('hospital'), false);
  assert.equal(video.searchParams.get('time'), '02:00 PM');
  assert.ok(isDesign3BookingSlotAvailable(shetty.id, video.searchParams.get('date'), video.searchParams.get('time'), 'video', '', now));
  const late = new URL(design7BookingUrl(shetty, 'hospital', new Date(2026, 9, 20, 18, 0)), 'https://example.test');
  assert.equal(late.searchParams.has('date'), false);
  assert.equal(late.searchParams.has('time'), false);
  assert.equal(late.searchParams.get('design'), 'd7');
});

test('tomorrow slots and encoded doctor names are not mistaken for an invalid route', () => {
  const ashley = design7Doctors.find(doctor => doctor.id === 'dr-ashley');
  const url = new URL(design7BookingUrl(ashley, 'hospital', now), 'https://example.test');
  assert.equal(url.searchParams.get('date'), '2026-10-21');
  assert.equal(url.searchParams.get('time'), '11:30 AM');
  assert.ok(isDesign3BookingSlotAvailable(ashley.id, url.searchParams.get('date'), url.searchParams.get('time'), 'hospital', url.searchParams.get('hospital'), now));
  const encoded = new URL(design7BookingUrl({ ...shetty, id: 'doctor/name & value' }, 'hospital', now), 'https://example.test');
  assert.equal(encoded.pathname, '/doctors/doctor%2Fname%20%26%20value/book');
});

test('city-scoped hospital filters exclude out-of-city affiliations and expose the doctor in the matching city', () => {
  const mumbaiHospital = "SRCC Children's Hospital, Mumbai";
  const bangalore = searchDesign7Directory('', 'Bangalore');
  const options = doctorFilterOptions(bangalore, emptyDoctorFilters(), 'hospital', 'hospitals');
  assert.equal(options.some(option => option.value === mumbaiHospital), false);
  assert.equal(doctorHospitals(bangalore.find(doctor => doctor.id === 'dr-3')).includes(mumbaiHospital), false);
  assert.deepEqual(refineDesign7Doctors(bangalore, { ...emptyDoctorFilters(), hospitals: [mumbaiHospital] }, 'hospital', 'relevance', now), []);

  const mumbai = searchDesign7Directory('Arun', 'Mumbai');
  const arun = mumbai.find(doctor => doctor.id === 'dr-3');
  assert.ok(arun);
  assert.equal(arun.city, 'Mumbai');
  assert.equal(arun.hospital, mumbaiHospital);
  assert.deepEqual(doctorHospitals(arun), [mumbaiHospital]);
  const url = new URL(design7BookingUrl(arun, 'hospital', now), 'https://example.test');
  assert.equal(url.searchParams.get('city'), 'Mumbai');
  assert.equal(url.searchParams.get('hospital'), mumbaiHospital);
  assert.ok(isDesign3BookingSlotAvailable(arun.id, url.searchParams.get('date'), url.searchParams.get('time'), 'hospital', mumbaiHospital, now));
});

test('all-cities hospital selection and defensive booking links use the selected hospital city', () => {
  const mumbaiHospital = "SRCC Children's Hospital, Mumbai";
  const results = refineDesign7Doctors(searchDesign7Directory('', 'All'), { ...emptyDoctorFilters(), hospitals: [mumbaiHospital] }, 'hospital', 'relevance', now);
  const arun = results.find(doctor => doctor.id === 'dr-3');
  assert.equal(arun.city, 'Mumbai');
  const defensive = new URL(design7BookingUrl({ ...arun, city: 'Bangalore' }, 'hospital', now), 'https://example.test');
  assert.equal(defensive.searchParams.get('city'), 'Mumbai');
  assert.equal(design7HospitalCity('Narayana Health City', 'Bangalore'), 'Bangalore');
  assert.equal(design7HospitalCity('Example Hospital, Bengaluru', 'Mumbai'), 'Bangalore');
});

for (const variant of ['d7', 'd8', 'd9', 'd10', 'd11', 'd12']) test(`${variant} preserves the complete appointment context when leaving its visual option`, () => {
  const hospital = 'Mazumdar Shaw Medical Centre, Bangalore';
  const selected = { ...shetty, hospital };
  const url = new URL(design7BookingUrl(selected, 'hospital', now, variant), 'https://example.test');
  assert.equal(url.searchParams.get('design'), variant);
  assert.equal(url.pathname, '/doctors/dr-1/book');
  assert.equal(url.searchParams.get('city'), 'Bangalore');
  assert.equal(url.searchParams.get('mode'), 'hospital');
  assert.equal(url.searchParams.get('hospital'), hospital);
  assert.equal(url.searchParams.get('date'), '2026-10-20');
  assert.equal(url.searchParams.get('time'), '10:30 AM');
  assert.ok(isDesign3BookingSlotAvailable(shetty.id, url.searchParams.get('date'), url.searchParams.get('time'), 'hospital', hospital, now));
  const video = new URL(design7BookingUrl(shetty, 'video', now, variant), 'https://example.test');
  assert.equal(video.searchParams.get('design'), variant);
  assert.equal(video.searchParams.has('hospital'), false);
  assert.equal(video.searchParams.get('mode'), 'video');
});
