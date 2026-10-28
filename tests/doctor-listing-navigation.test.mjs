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

const { doctorListingParams, doctorListingUrl } = await import('../src/features/search/doctorListingNavigation.ts');

test('a speciality landing selects an explicit filter, not a free-text query', () => {
  const params = doctorListingParams('/book-an-appointment/cardiologist', '');
  assert.deepEqual(params.getAll('specialties'), ['Cardiologist']);
  assert.equal(params.has('q'), false);
});

test('landing identity stays consistent with its heading and metadata despite conflicting query aliases', () => {
  const params = doctorListingParams('/book-an-appointment/cardiologist/bangalore', 'specialties=&specialties=Oncologist&location=Mumbai&city=Delhi&cityId=44');
  assert.deepEqual(params.getAll('specialties'), ['Cardiologist']);
  assert.equal(params.get('location'), 'Bangalore');
  assert.equal(params.has('city'), false);
  assert.equal(params.has('cityId'), false);
});

test('landing context survives secondary refinements and a URL round trip', () => {
  const path = '/book-an-appointment/cardiologist/bangalore';
  const params = doctorListingParams(path, 'mode=video');
  params.set('languages', 'Hindi');
  const url = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(url.pathname, path);
  assert.equal(url.searchParams.has('specialties'), false);
  assert.equal(url.searchParams.has('location'), false);
  const restored = doctorListingParams(url.pathname, url.search);
  assert.equal(restored.get('location'), 'Bangalore');
  assert.equal(restored.get('specialties'), 'Cardiologist');
  assert.equal(restored.get('languages'), 'Hindi');
  assert.equal(restored.get('mode'), 'video');
});

test('removing the landing speciality exits to a recoverable unfiltered search', () => {
  const path = '/book-an-appointment/cardiologist/bangalore';
  const params = doctorListingParams(path, '');
  params.delete('specialties');
  const url = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(url.pathname, '/search/doctors');
  assert.equal(url.searchParams.get('design'), 'd3');
  assert.equal(url.searchParams.get('location'), 'Bangalore');
  assert.equal(doctorListingParams(url.pathname, url.search).has('specialties'), false);
});

test('changing to an empty city does not create a broken landing URL or drop filters', () => {
  const path = '/book-an-appointment/cardiologist/bangalore';
  const params = doctorListingParams(path, '');
  params.set('location', 'Hosur');
  const url = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(url.pathname, '/search/doctors');
  assert.equal(url.searchParams.get('location'), 'Hosur');
  assert.equal(url.searchParams.get('specialties'), 'Cardiologist');
});

test('free text and multiple filters are URL encoded and remain editable', () => {
  const params = doctorListingParams('/book-an-appointment/cardiologist', '');
  params.append('specialties', 'General Surgeon');
  params.set('q', 'Name & hospital / test');
  const url = new URL(doctorListingUrl('/book-an-appointment/cardiologist', params), 'http://localhost');
  assert.equal(url.pathname, '/search/doctors');
  assert.deepEqual(url.searchParams.getAll('specialties'), ['Cardiologist', 'General Surgeon']);
  assert.equal(url.searchParams.get('q'), 'Name & hospital / test');
});

test('Design 4 persists through landing refinements and returning to the general directory', () => {
  const path = '/book-an-appointment/cardiologist/bangalore';
  const params = doctorListingParams(path, 'design=d4&mode=video');
  params.set('languages', 'Hindi');
  const refined = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(refined.pathname, path);
  assert.equal(refined.searchParams.get('design'), 'd4');
  assert.equal(refined.searchParams.get('languages'), 'Hindi');
  params.delete('specialties');
  const directory = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(directory.pathname, '/search/doctors');
  assert.equal(directory.searchParams.get('design'), 'd4');
  assert.equal(directory.searchParams.get('location'), 'Bangalore');
  assert.equal(directory.searchParams.get('mode'), 'video');
});

test('Search refinements preserve each supported directory preview', () => {
  for (const design of ['d3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd16', 'd17', 'd17-lite']) {
    const params = new URLSearchParams({ design, location: 'Mumbai', availability: 'tomorrow' });
    const url = new URL(doctorListingUrl('/search/doctors', params), 'http://localhost');
    assert.equal(url.searchParams.get('design'), design);
    assert.equal(url.searchParams.get('availability'), 'tomorrow');
  }
});
for (const design of ['d5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd16', 'd17', 'd17-lite']) test(`${design} persists through landing refinements and returning to the general directory`, () => {
  const path = '/book-an-appointment/cardiologist/bangalore';
  const params = doctorListingParams(path, `design=${design}&mode=video`);
  params.set('languages', 'Hindi');
  const refined = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(refined.pathname, path);
  assert.equal(refined.searchParams.get('design'), design);
  assert.equal(refined.searchParams.get('languages'), 'Hindi');
  params.delete('specialties');
  const directory = new URL(doctorListingUrl(path, params), 'http://localhost');
  assert.equal(directory.pathname, '/search/doctors');
  assert.equal(directory.searchParams.get('design'), design);
  assert.equal(directory.searchParams.get('location'), 'Bangalore');
  assert.equal(directory.searchParams.get('mode'), 'video');
});
