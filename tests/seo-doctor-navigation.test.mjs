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

const { seoDoctorHref } = await import('../src/components/layout/seoDoctorHref.ts');
const { SEO_LINK_SECTIONS } = await import('../src/data/seo-links.ts');

const asUrl = href => new URL(href, 'https://nh.local');

test('every existing footer doctor link reaches D20 with its city and specialty filters', () => {
  const doctorLinks = SEO_LINK_SECTIONS.flatMap(section => section.links)
    .filter(link => link.href.startsWith('/ocaapp/doctors/'));
  assert.ok(doctorLinks.length > 0);
  for (const { href } of doctorLinks) {
    const result = asUrl(seoDoctorHref(href));
    assert.equal(result.pathname, '/search/doctors', href);
    assert.equal(result.searchParams.get('design'), 'd20', href);
    assert.ok(result.searchParams.get('location'), href);
    assert.ok(result.searchParams.getAll('specialties').length, href);
  }
});

test('SEO doctor links keep broad neuroscience intent and city selection', () => {
  const result = asUrl(seoDoctorHref('/ocaapp/doctors/bangalore/neuro-sciences'));
  assert.equal(result.searchParams.get('location'), 'Bangalore');
  assert.deepEqual(result.searchParams.getAll('specialties'), ['Neurologist', 'Neurosurgeon']);
});

test('unrelated and external footer URLs are left untouched', () => {
  for (const href of ['/bangalore/cardiac-sciences', '/', '#', 'https://www.narayanahealth.org/ocaapp/doctors/bangalore/cancer-care']) {
    assert.equal(seoDoctorHref(href), href);
  }
});
