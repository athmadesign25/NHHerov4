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

test('listing headings cover every imported speciality independently of SEO routes', async () => {
  const { design20DirectorySource } = await import('../src/features/search/design20DirectoryData.ts');
  const city = landing.findDoctorLandingCity('Bangalore');
  const specialties = new Set(design20DirectorySource.doctors.flatMap(doctor => doctor.specialties));
  for (const specialty of specialties) {
    const copy = landing.getDoctorListingCopy({ specialties: [specialty], city });
    assert.notEqual(copy.heading, 'Doctors in Bangalore', specialty);
    assert.ok(copy.heading.endsWith(' in Bangalore'), specialty);
    assert.equal(copy.heading, `${landing.getDoctorListingCopy({ specialties: [specialty] }).heading} in Bangalore`, specialty);
    assert.equal(copy.summary, 'Explore doctors and consultation options.');
  }
  assert.equal(landing.getDoctorListingCopy({ specialties: ['Adult Cardiology'], city }).heading, 'Adult cardiologists in Bangalore');
  assert.equal(landing.getDoctorListingCopy({ specialties: ['New Department'] }).heading, 'New Department specialists');
  assert.equal(landing.getDoctorLandingContext('/book-an-appointment/adult-cardiology'), null);
});

test('single-speciality headings retain clinical distinctions and name services accurately', () => {
  const examples = [
    ['Adult Cardiology', 'Adult cardiologists'],
    ['Paediatric Cardiology', 'Paediatric cardiologists'],
    ['Interventional Neurology', 'Interventional neurologists'],
    ['Medical Gastroenterology', 'Medical gastroenterologists'],
    ['Clinical Psychology', 'Clinical psychologists'],
    ['E.N.T', 'ENT specialists'],
    ['Obstetrics & Gynaecology', 'Obstetricians & gynaecologists'],
    ['Executive Health Checkup', 'Doctors for executive health checks'],
    ['Paediatric & Congenital Heart Surgery', 'Paediatric & Congenital Heart Surgery specialists'],
  ];
  for (const [speciality, heading] of examples) {
    assert.equal(landing.getDoctorListingCopy({ specialties: [speciality] }).heading, heading);
    assert.equal(landing.getDoctorListingCopy({ specialties: [speciality], city: landing.findDoctorLandingCity('Bangalore') }).heading, `${heading} in Bangalore`);
  }
  assert.equal(landing.getDoctorListingCopy({ specialties: ['  adult cardiology  '] }).heading, 'Adult cardiologists');
});

test('listing context remains accurate through multiple selection, city changes and reset', () => {
  const city = landing.findDoctorLandingCity('Bangalore');
  const selected = ['Adult Cardiology', 'Orthopaedic Surgery'];
  const copy = landing.getDoctorListingCopy({ specialties: selected, city });
  assert.equal(copy.heading, 'Specialists in Bangalore');
  assert.equal(copy.summary, 'Explore doctors and consultation options.');
  const many = landing.getDoctorListingCopy({ specialties: [...selected, 'Dermatology', 'E.N.T'], city });
  assert.equal(many.heading, copy.heading);
  assert.equal(many.summary, copy.summary);
  assert.equal(landing.getDoctorListingCopy({ specialties: selected }).heading, 'Our specialists');
  assert.equal(landing.getDoctorListingCopy({ specialties: [...selected, 'Dermatology'] }).heading, 'Our specialists');
  assert.equal(landing.getDoctorListingCopy({ specialties: [], city }).summary, copy.summary);
  assert.equal(landing.getDoctorListingCopy({ specialties: ['Adult Cardiology'], city }).summary, copy.summary);
  assert.equal(landing.getDoctorListingCopy({ specialties: ['Orthopaedic Surgery'], city: landing.findDoctorLandingCity('Mumbai') }).heading, 'Orthopaedic surgeons in Mumbai');
  assert.equal(landing.getDoctorListingCopy({ specialties: ['Cardiologist'], city }).heading, 'Cardiologists in Bangalore');
  assert.equal(landing.getDoctorListingCopy({ specialties: ['Adult Cardiology', 'Adult Cardiology', ' '], city }).heading, 'Adult cardiologists in Bangalore');
  assert.equal(landing.getDoctorListingCopy({ specialties: [], city }).heading, 'Doctors in Bangalore');
  assert.equal(landing.getDoctorListingCopy({ specialties: [] }).heading, 'Our doctors');
});
