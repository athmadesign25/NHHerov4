import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

// Use the repository's existing TypeScript compiler; no test dependency or build output.
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
const { withDesign3DemoMetadata } = await import('../src/features/search/design3DoctorMetadata.ts');
const { getDesign3BookingDoctor } = await import('../src/features/booking/doctors.ts');
const { searchDoctorsData } = await import('../src/app/search/mockDoctors.ts');
const { readSearchLocation, catalogResults, filterCatalog, emptyCatalogFilters } = await import('../src/features/search/design3Data.ts');
const doctors = searchDoctorsData.map(listing.fromDirectoryDoctor);
const { suggestDoctorCity } = await import('../src/features/search/doctorLocation.ts');
const { design3CityDoctors, DESIGN3_EMPTY_CITY } = await import('../src/features/search/design3CityDoctors.ts');
const { NH_CITIES, getCityId } = await import('../src/lib/searchService.ts');
const now = new Date(2026, 9, 15, 0, 0);

test('Design 3 cities have varied stable counts, both modes, and exactly one empty city', () => {
  const directory = [...doctors, ...design3CityDoctors];
  assert.equal(new Set(directory.map(doctor => doctor.id)).size, directory.length);
  const previewCounts = new Set();
  for (const { value } of NH_CITIES) {
    const cityDoctors = directory.filter(doctor => getCityId(doctor.city) === getCityId(value));
    if (value === DESIGN3_EMPTY_CITY) { assert.equal(cityDoctors.length, 0); continue; }
    if (value !== 'Bangalore') previewCounts.add(cityDoctors.length);
    for (const mode of ['hospital', 'video']) {
      assert.ok(listing.filterDoctors(cityDoctors, listing.emptyDoctorFilters(), mode, now).length, `${value}: ${mode}`);
      // A single-doctor city may legitimately have no results for one date.
      let datedCount = 0;
      for (const availability of ['today', 'tomorrow']) {
        const matches = listing.filterDoctors(cityDoctors, {...listing.emptyDoctorFilters(), availability}, mode, now);
        assert.ok(matches.every(doctor => doctor.availability[mode].toLowerCase().startsWith(availability)));
        datedCount += matches.length;
      }
      if (value !== 'Bangalore') assert.equal(datedCount, cityDoctors.length);
      else assert.ok(datedCount > 0);
    }
  }
  assert.deepEqual([...previewCounts].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);
  assert.ok(searchDoctorsData.every(doctor => doctor.city === 'Bangalore'), 'shared directory stays unchanged');
});

test('city preview booking resolves the selected fixture without a Bangalore fallback', () => {
  for (const doctor of design3CityDoctors) {
    const booking = getDesign3BookingDoctor(doctor.id);
    assert.equal(booking.id, doctor.id);
    assert.equal(booking.name, doctor.name);
    assert.equal(booking.city, doctor.city);
    assert.deepEqual(booking.locations, listing.doctorHospitals(doctor).map(name => ({name, city: doctor.city})));
    const url = new URL(listing.bookingUrl(doctor, 'hospital', true, now), 'http://localhost');
    assert.equal(url.searchParams.get('city'), doctor.city);
    assert.equal(url.searchParams.get('hospital'), doctor.hospital);
  }
  assert.equal(getDesign3BookingDoctor('d3-preview-56-1'), null, 'empty city has no bookable fixture');
});

test('preview cities expose two to four working hospital facets including secondary affiliations', () => {
  const counts = new Set();
  for (const city of new Set(design3CityDoctors.map(doctor => doctor.city))) {
    const records = design3CityDoctors.filter(doctor => doctor.city === city);
    const options = listing.doctorFilterOptions(records, listing.emptyDoctorFilters(), 'hospital', 'hospitals');
    counts.add(options.length);
    assert.ok(options.length >= 2 && options.length <= 4);
    for (const option of options) {
      const matches = listing.filterDoctors(records, {...listing.emptyDoctorFilters(), hospitals:[option.value]}, 'hospital', now);
      assert.ok(matches.length > 0);
      assert.equal(matches.length, option.count);
      assert.ok(matches.every(doctor => listing.doctorHospitals(doctor).includes(option.value)));
    }
  }
  assert.deepEqual([...counts].sort(), [2, 3, 4]);
  assert.ok(!design3CityDoctors.some(doctor => doctor.city === DESIGN3_EMPTY_CITY));
});

test('location suggests only nearby mapped cities and normalizes the Delhi hub to an API city', () => {
  assert.equal(suggestDoctorCity({latitude:12.9716,longitude:77.5946,accuracy:50}), 'Bangalore');
  assert.equal(suggestDoctorCity({latitude:28.6139,longitude:77.2090,accuracy:50}), 'Delhi');
  // Never map a remote user to the old demonstration fallback (Pune/Hosur).
  assert.equal(suggestDoctorCity({latitude:18.5204,longitude:73.8567,accuracy:50}), null);
  assert.equal(suggestDoctorCity({latitude:51.5074,longitude:-0.1278,accuracy:50}), null);
});

test('imprecise and invalid coordinates require manual city selection', () => {
  assert.equal(suggestDoctorCity({latitude:12.9716,longitude:77.5946,accuracy:20000}), null);
  assert.equal(suggestDoctorCity({latitude:NaN,longitude:77.5946,accuracy:50}), null);
  assert.equal(suggestDoctorCity({latitude:91,longitude:77.5946,accuracy:50}), null);
  assert.equal(suggestDoctorCity({latitude:12.9716,longitude:181,accuracy:50}), null);
  assert.equal(suggestDoctorCity({latitude:12.9716,longitude:77.5946,accuracy:-1}), null);
});

test('Design 3 resolves the exact selected doctor, including prefix-collision IDs', () => {
  for (const id of ['dr-1', 'dr-10', 'dr-11', 'dr-20']) assert.equal(getDesign3BookingDoctor(id)?.id, id);
  assert.equal(getDesign3BookingDoctor('dr-50'), null);
  assert.equal(getDesign3BookingDoctor('999999-unknown'), null);
});

test('API records do not inherit demonstration portraits, fees, qualifications or slots', () => {
  const result = listing.fromApiDoctor({ id: 999, name: 'Test doctor', speciality: 'Test specialty', hospital: 'Test hospital',
    photo: '/unverified.png', apptEnabled: true, walkinEnabled: false, vcEnabled: false,
    availability: {hospital: 'Today 05:30 PM', video: 'Today 05:30 PM'} });
  assert.equal(result.img, ''); assert.equal(result.fee, ''); assert.equal(result.degrees, '');
  assert.deepEqual(result.availability, {}); assert.equal(result.modes.video, false);
});

test('consultation mode and secondary hospital affiliations actually filter doctors', () => {
  const video = listing.filterDoctors(doctors, listing.emptyDoctorFilters(), 'video', now);
  assert.ok(video.length > 0 && video.length < doctors.length);
  assert.ok(video.every((doctor) => doctor.modes.video !== false));
  const multi = doctors.find((doctor) => doctor.hospitals?.length > 1);
  const filters = {...listing.emptyDoctorFilters(), hospitals: [multi.hospitals[1]]};
  assert.ok(listing.filterDoctors([multi], filters, 'hospital', now).includes(multi));
});

test('tomorrow slot carries its own date and consultation mode into booking', () => {
  const doctor = doctors.find((doctor) => doctor.availability.video?.startsWith('Tomorrow'));
  const url = new URL(listing.bookingUrl(doctor, 'video', true, now), 'http://localhost');
  assert.equal(url.searchParams.get('date'), '2026-10-16');
  assert.equal(url.searchParams.get('mode'), 'video');
  assert.ok(url.searchParams.get('time')); assert.equal(url.searchParams.has('hospital'), false);
});

test('availability filters use the selected mode and sorting keeps unknown fees last', () => {
  const tomorrow = listing.filterDoctors(doctors, {...listing.emptyDoctorFilters(), availability:'tomorrow'}, 'video', now);
  assert.ok(tomorrow.length); assert.ok(tomorrow.every((doctor) => doctor.availability.video.startsWith('Tomorrow')));
  const values = [{...doctors[0],id:'unknown',fee:''}, {...doctors[0],id:'high',fee:'₹2,000'}, {...doctors[0],id:'low',fee:'₹500'}];
  assert.deepEqual(listing.sortDoctors(values,'fee_asc','hospital',now).map((d)=>d.id),['low','high','unknown']);
  assert.deepEqual(listing.sortDoctors(values,'fee_desc','hospital',now).map((d)=>d.id),['high','low','unknown']);
});

test('URL state restores filters and accepts existing location entry parameters', () => {
  const state = listing.readListingParams(new URLSearchParams('mode=video&sort=fee_desc&availability=tomorrow&specialties=A&specialties=B'));
  assert.equal(state.mode,'video'); assert.equal(state.sort,'fee_desc'); assert.equal(state.filters.availability,'tomorrow');
  assert.deepEqual(state.filters.specialties,['A','B']);
  assert.equal(readSearchLocation(new URLSearchParams('city=Bengaluru')),'Bangalore');
  assert.equal(readSearchLocation(new URLSearchParams('cityId=44')),'Mumbai');
});

test('live treatment results still obey type and alphabet filters', () => {
  const catalogs={hospitals:[],treatments:[],packages:[],labs:[],articles:[]};
  const api={doctors:[],specialities:[],subSpecialities:[],blogs:[],treatments:[{id:1,name:'Alpha',type:'Treatments',speciality:'',image:''}],procedures:[{id:2,name:'Beta',type:'Procedures',speciality:'',image:''}]};
  const items=catalogResults(catalogs,'test','All',api).treatments;
  assert.deepEqual(filterCatalog(items,{...emptyCatalogFilters(),types:['Procedures']}).map((i)=>i.name),['Beta']);
  assert.deepEqual(filterCatalog(items,{...emptyCatalogFilters(),letters:['A']}).map((i)=>i.name),['Alpha']);
});

test('preview metadata fills all requested facets without mutating directory or enriching unknown API IDs', () => {
  const preview = withDesign3DemoMetadata(doctors);
  assert.ok(preview.every((doctor) => doctor.languages?.length && doctor.gender && doctor.expertise?.length));
  assert.equal(doctors[0].gender, undefined);
  const unknown = {...doctors[0], id:'api-only-id'};
  assert.equal(withDesign3DemoMetadata([unknown])[0], unknown);
});

test('facets count other selected groups, OR within a group, and retain removable zero-result choices', () => {
  const records = [
    {...doctors[0], id:'a', speciality:'Cardiology / Internal medicine', languages:['English','Hindi'], gender:'Female', expertise:['Heart failure']},
    {...doctors[0], id:'b', speciality:'Cardiology', languages:['English'], gender:'Male', expertise:['Heart failure']},
    {...doctors[0], id:'c', speciality:'Neurology', languages:['Hindi'], gender:'Female', expertise:['Stroke care']},
  ];
  const filters = {...listing.emptyDoctorFilters(), languages:['English'], genders:['Female']};
  assert.deepEqual(listing.filterDoctors(records, filters, 'hospital', now).map(d=>d.id), ['a']);
  assert.deepEqual(listing.doctorFilterOptions(records,filters,'hospital','genders'),[{value:'Female',count:1},{value:'Male',count:1}]);
  assert.deepEqual(listing.filterDoctors(records,{...filters,genders:['Female','Male']},'hospital',now).map(d=>d.id),['a','b']);
  assert.deepEqual(listing.filterDoctors(records,{...filters,specialties:['Internal medicine']},'hospital',now).map(d=>d.id),['a']);
  const empty={...filters,expertise:['Unknown expertise']};
  assert.ok(listing.doctorFilterOptions(records,empty,'hospital','expertise').some(o=>o.value==='Unknown expertise'&&o.count===0));
  assert.equal(listing.filterDoctors(records,empty,'hospital',now).length,0);
});
