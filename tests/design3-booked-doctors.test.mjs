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

const { readDesign3BookedDoctors } = await import('../src/features/search/useDesign3BookedDoctors.ts');
const now = Date.parse('2026-10-19T12:00:00.000Z');
const record = (changes = {}) => ({
  ref: 'NH-ABCDEF', createdAt: '2026-10-19T11:00:00.000Z', doctorSlug: 'd3-preview-mumbai-1',
  doctorName: 'Preview Doctor', speciality: 'Cardiologist', consultationType: 'hospital',
  hospital: 'Narayana Hospital', date: '2026-10-20', time: '10:00 AM',
  patientName: 'Preview Patient', relation: 'self', fee: '₹1,000', ...changes,
});
const store = (entries) => ({
  length: entries.length,
  key: (index) => entries[index]?.[0] ?? null,
  getItem: (key) => entries.find(([entryKey]) => entryKey === key)?.[1] ?? null,
});
const entry = (booking) => [`nh:booking:${booking.ref}`, JSON.stringify(booking)];

test('uses actual saved bookings, exact doctor IDs and deduplicates repeated bookings', () => {
  const ids = readDesign3BookedDoctors(store([
    entry(record()), entry(record({ ref: 'NH-ABCDEG' })),
    entry(record({ ref: 'NH-ABCDEH', doctorSlug: 'd3-preview-mumbai-10' })),
  ]), now);
  assert.deepEqual([...ids], ['d3-preview-mumbai-1', 'd3-preview-mumbai-10']);
  assert.equal(ids.has('mumbai-1'), false);
  assert.equal(ids.has('D3-PREVIEW-MUMBAI-1'), false);
  assert.equal(ids.has('Preview Patient'), false);
});

test('ignores unrelated keys, malformed records and a reference that does not match its storage key', () => {
  const ids = readDesign3BookedDoctors(store([
    ['other-data', JSON.stringify(record())],
    ['nh:booking:NH-ABCDEG', JSON.stringify(record())],
    ['nh:booking:NH-ABCDEH', '{broken'],
    ['nh:booking:NH-ABCDEJ', JSON.stringify({ ref: 'NH-ABCDEJ', doctorSlug: 'no-completed-booking' })],
    entry(record({ ref: 'NH-ABCDEK', doctorSlug: 'valid-id' })),
  ]), now);
  assert.deepEqual([...ids], ['valid-id']);
});

test('rejects invalid or future creation dates and ambiguous blank or padded doctor IDs', () => {
  const variants = [
    { createdAt: 'not-a-date' }, { createdAt: '2026-02-30T11:00:00.000Z' },
    { createdAt: '2026-10-19T12:00:00.001Z' }, { doctorSlug: '' }, { doctorSlug: ' doctor-id ' },
  ];
  for (const changes of variants) assert.equal(readDesign3BookedDoctors(store([entry(record(changes))]), now).size, 0);
  assert.equal(readDesign3BookedDoctors(store([entry(record({ createdAt: '2026-10-19T12:00:00.000Z' }))]), now).size, 1);
  assert.equal(readDesign3BookedDoctors(store([entry(record())]), Number.NaN).size, 0);
});

test('future appointment dates still count as a booking already created', () => {
  assert.equal(readDesign3BookedDoctors(store([entry(record({ date: '2027-01-01' }))]), now).has('d3-preview-mumbai-1'), true);
});

test('blocked or partially inaccessible storage fails closed without retaining partial history', () => {
  for (const inaccessible of [
    { get length() { throw new Error('blocked'); } },
    { length: 1, key() { throw new Error('blocked'); } },
    { length: 1, key: () => 'nh:booking:NH-ABCDEF', getItem() { throw new Error('blocked'); } },
    { length: 2, key(index) { if (index === 1) throw new Error('blocked'); return 'nh:booking:NH-ABCDEF'; }, getItem: () => JSON.stringify(record()) },
  ]) assert.equal(readDesign3BookedDoctors(inaccessible, now).size, 0);
  assert.equal(readDesign3BookedDoctors(store([]), now), readDesign3BookedDoctors(store([]), now));
});
