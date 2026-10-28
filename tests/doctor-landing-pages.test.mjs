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

const landing = await import('../src/features/search/doctorLandingPages.ts');
const { getDoctorLandingMetadata } = await import('../src/features/search/doctorLandingMetadata.ts');
const { searchDoctorsData } = await import('../src/app/search/mockDoctors.ts');
const { design3CityDoctors } = await import('../src/features/search/design3CityDoctors.ts');
const { filterDoctors, emptyDoctorFilters, fromDirectoryDoctor } = await import('../src/features/search/doctorListing.ts');
const directory = [...searchDoctorsData, ...design3CityDoctors];

test('clean route variants round-trip exact speciality and city filter values', () => {
  assert.deepEqual(landing.getDoctorLandingContext('/book-an-appointment'), {});
  for (const speciality of landing.DOCTOR_LANDING_SPECIALITIES) {
    const context = landing.getDoctorLandingContext(landing.getDoctorLandingPath(speciality.slug, 'bangalore'));
    assert.equal(context.speciality.label, speciality.label);
    assert.equal(context.city.value, 'Bangalore');
    assert.ok(landing.hasDoctorLandingDoctors(context, directory), `Missing directory mapping for ${speciality.slug}`);
  }
  for (const city of landing.DOCTOR_LANDING_CITIES) {
    assert.equal(landing.getDoctorLandingContext(landing.getDoctorLandingPath(undefined, city.slug)).city.value, city.value);
  }
  assert.equal(landing.findDoctorLandingCity('Bengaluru').slug, 'bangalore');
  assert.equal(landing.findDoctorLandingSpeciality('Cardiac Surgeon').slug, 'cardiac-surgeon');
});

test('navbar cardiologist context uses an exact speciality facet, not broad text search', () => {
  const context = landing.getDoctorLandingContext('/book-an-appointment/cardiologist/bangalore');
  const filters = { ...emptyDoctorFilters(), specialties: [context.speciality.label] };
  const results = filterDoctors(searchDoctorsData.map(fromDirectoryDoctor), filters, 'hospital');
  assert.ok(results.length > 0);
  assert.ok(results.every(doctor => doctor.speciality === 'Cardiologist'));
  assert.ok(!results.some(doctor => doctor.speciality === 'Cardiac Surgeon'));
});

test('unsupported and malformed routes never become landing pages', () => {
  for (const pathname of [
    '/search/doctors', '/book-an-appointment/city', '/book-an-appointment/dentist',
    '/book-an-appointment/cardiologist/unknown', '/book-an-appointment/cardiologist/mumbai/extra',
    '/book-an-appointment/Cardiologist', '/book-an-appointment/cardiologist%2Fmumbai',
    '/book-an-appointment/cardiologist?specialties=Oncologist', '/book-an-appointment//cardiologist',
  ]) assert.equal(landing.getDoctorLandingContext(pathname), null, pathname);
  assert.throws(() => landing.getDoctorLandingPath('unsupported'));
  assert.throws(() => landing.getDoctorLandingPath('cardiologist', 'unsupported'));
});

test('landing eligibility uses mapped doctors, independent of temporary appointment availability', () => {
  const cardiologistMumbai = landing.getDoctorLandingContext('/book-an-appointment/cardiologist/mumbai');
  assert.ok(landing.hasDoctorLandingDoctors(cardiologistMumbai, directory));
  assert.equal(landing.hasDoctorLandingDoctors(landing.getDoctorLandingContext('/book-an-appointment/oncologist/mumbai'), directory), false);
  assert.equal(landing.hasDoctorLandingDoctors(landing.getDoctorLandingContext('/book-an-appointment/city/hosur'), directory), false);
  assert.ok(landing.hasDoctorLandingDoctors(cardiologistMumbai, [{ speciality: 'Cardiologist', city: 'Mumbai', availability: {} }]));
  assert.equal(landing.hasDoctorLandingDoctors(cardiologistMumbai, [{ speciality: 'Interventional Cardiologist', city: 'Mumbai' }]), false);
  assert.ok(landing.hasDoctorLandingDoctors(cardiologistMumbai, [{ speciality: 'Cardiologist / General Physician', city: 'Mumbai' }]));
});

test('preview metadata stays noindex even when fixtures populate a landing page', () => {
  const context = landing.getDoctorLandingContext('/book-an-appointment/cardiologist/bangalore');
  const metadata = getDoctorLandingMetadata(context);
  assert.equal(metadata.title, 'Cardiologists in Bangalore | Narayana Health');
  assert.equal(metadata.alternates.canonical, new URL('/book-an-appointment/cardiologist/bangalore', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.narayanahealth.org').toString());
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.doesNotMatch(metadata.description, /best|top-rated|live availability/i);
  assert.equal(landing.canIndexDoctorLanding({ approved: false, verifiedDoctorCount: 8 }), false);
  for (const count of [0, -1, NaN, Infinity, 0.5]) assert.equal(landing.canIndexDoctorLanding({ approved: true, verifiedDoctorCount: count }), false);
  assert.equal(landing.canIndexDoctorLanding({ approved: true, verifiedDoctorCount: 1 }), true);
});

test('contextual page copy handles the directory, city and specialist without unsupported claims', () => {
  assert.equal(landing.getDoctorLandingCopy({}).heading, 'Find a doctor');
  assert.equal(landing.getDoctorLandingCopy(landing.getDoctorLandingContext('/book-an-appointment/city/mumbai')).heading, 'Doctors in Mumbai');
  const copy = landing.getDoctorLandingCopy(landing.getDoctorLandingContext('/book-an-appointment/ent-specialist'));
  assert.equal(copy.heading, 'ENT specialists');
  assert.match(copy.summary, /ENT specialists/);
});
