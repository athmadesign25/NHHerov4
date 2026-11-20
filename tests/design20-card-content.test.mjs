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

const { getDesign20CardContent } = await import('../src/features/search/design20CardContent.ts');

function doctor(overrides = {}) {
  return {
    id: 'verified-doctor', name: 'Dr. Example', speciality: 'Paediatric Cardiology',
    designation: '', degrees: '', hospital: 'Narayana Health', city: 'Bangalore',
    experience: '', img: '', fee: '', rating: 0, reviews: 0, availability: {},
    modes: { hospital: null, video: null }, ...overrides,
  };
}

test('an exact selected facet promotes the second source specialty and preserves other specialties', () => {
  const source = doctor({ speciality: 'Paediatric Cardiology, Paediatric & Congenital Heart Surgery' });
  const content = getDesign20CardContent(source, {
    specialties: [' paediatric & congenital heart surgery '], focusTerms: ['Paediatric Cardiology'],
  });
  assert.equal(content.speciality, 'Paediatric & Congenital Heart Surgery');
  assert.deepEqual(content.additionalSpecialties, ['Paediatric Cardiology']);
});

test('query selection keeps clinical qualifiers and prefers an exact source label before substring matching', () => {
  const source = doctor({ speciality: 'Adult Cardiology / Paediatric Cardiology / Paediatric & Congenital Heart Surgery' });
  assert.equal(getDesign20CardContent(source, { focusTerms: ['Paediatric Cardiology'] }).speciality, 'Paediatric Cardiology');
  assert.equal(getDesign20CardContent(source, { focusTerms: ['congenital heart'] }).speciality, 'Paediatric & Congenital Heart Surgery');
  assert.equal(getDesign20CardContent(source, { specialties: ['Cardiology'] }).speciality, 'Adult Cardiology');
  assert.equal(getDesign20CardContent(source, { specialties: ['unknown'], focusTerms: ['Paediatric Cardiology'] }).speciality, 'Paediatric Cardiology');
});

test('focus prefers specific source expertise and prioritizes matched expertise', () => {
  const source = doctor({
    speciality: 'Orthopaedic Surgery, Sports Medicine',
    expertise: ['Orthopaedic Surgery', 'sports medicine', 'Joint Replacement', 'Robotic Orthopaedic Surgery', 'joint replacement', 'Knee Arthroscopy'],
  });
  assert.deepEqual(getDesign20CardContent(source).focus, ['Joint Replacement', 'Robotic Orthopaedic Surgery']);
  assert.deepEqual(getDesign20CardContent(source, { focusTerms: ['knee'] }).focus, ['Knee Arthroscopy', 'Joint Replacement']);
  assert.deepEqual(getDesign20CardContent(source, { focusTerms: ['joint', 'Knee Arthroscopy'] }).focus, ['Knee Arthroscopy', 'Joint Replacement']);
  assert.deepEqual(getDesign20CardContent(doctor({ expertise: ['Paediatric Cardiology'] })).focus, ['Paediatric Cardiology']);
});

test('broad published expertise remains visible when no more specific source terms exist', () => {
  const source = doctor({ speciality: 'Paediatric Cardiology, Adult Cardiology', expertise: ['Paediatric Cardiology', 'Adult Cardiology', 'adult cardiology'] });
  assert.deepEqual(getDesign20CardContent(source).fullExpertise, ['Paediatric Cardiology', 'Adult Cardiology']);
  assert.deepEqual(getDesign20CardContent(doctor({ expertise: [] })).fullExpertise, []);
});

test('concise expertise is preferred without rewriting or truncating supplied clinical descriptions', () => {
  const longTerm = 'Reconstruction and revision of complex joint replacements following previous surgery';
  const source = doctor({ expertise: [longTerm, 'Paediatric Joint Reconstruction', 'Sports Injuries'] });
  assert.deepEqual(getDesign20CardContent(source).focus, ['Paediatric Joint Reconstruction', 'Sports Injuries']);
  assert.deepEqual(getDesign20CardContent(source, { focusTerms: ['revision'] }).focus, [longTerm]);
  assert.deepEqual(getDesign20CardContent(doctor({ expertise: ['Paediatric Nephrology'] })).focus, ['Paediatric Nephrology']);
});

test('a language appears only when a selected language matches supplied language data', () => {
  const source = doctor({ languages: ['English', 'Kannada'] });
  assert.equal(getDesign20CardContent(source).language, null);
  assert.equal(getDesign20CardContent(source, { languages: [' kannada '] }).language, 'Kannada');
  assert.equal(getDesign20CardContent(source, { languages: ['Hindi'] }).language, null);
  assert.equal(getDesign20CardContent(doctor(), { languages: ['Kannada'] }).language, null);
});

test('experience separates a verified year value from its source label, preserving plus qualifiers', () => {
  for (const [input, value, label] of [
    ['18 years', '18 years', 'experience'], ['18+ years', '18+ years', 'experience'],
    ['17 years in practice', '17 years', 'in practice'], ['1 year', '1 year', 'experience'],
    ['18 years of experience', '18 years', 'experience'], ['2.5 yrs', '2.5 years', 'experience'],
  ]) {
    const content = getDesign20CardContent(doctor({ experience: input }));
    assert.equal(content.experienceValue, value);
    assert.equal(content.experienceLabel, label);
  }
  for (const experience of ['', 'Senior Consultant', 'Since 2008', '18', 'N/A']) {
    assert.equal(getDesign20CardContent(doctor({ experience })).experienceValue, null);
  }
});

test('missing facts stay missing without substituting a designation or qualification for experience', () => {
  const empty = getDesign20CardContent(doctor({ name: 'Dr. Example', speciality: '', city: 'Bangalore' }));
  assert.deepEqual(empty, {
    speciality: '', additionalSpecialties: [], focus: [], fullExpertise: [], language: null,
    experienceValue: null, experienceLabel: 'experience',
  });
  for (const details of [
    { designation: 'Senior Consultant', degrees: 'MBBS, MD' },
    { degrees: 'MBBS, MD (Paediatrics)' },
    { designation: 'Senior Consultant in Cardiology and Programme Lead for Advanced Heart Failure and Transplantation Services' },
  ]) {
    assert.deepEqual(getDesign20CardContent(doctor(details)), getDesign20CardContent(doctor()));
  }
});

test('a long expertise record supplies one complete source term without enlarging the preview content budget', () => {
  const longTerms = [
    'Comprehensive management of congenital and acquired cardiac conditions in infants, children and adolescents',
    'Advanced assessment and multidisciplinary treatment planning for complex congenital heart disease',
    'Specialist follow-up care for children following complex reconstructive cardiac surgery',
  ];
  const source = doctor({ speciality: '', expertise: longTerms });
  assert.deepEqual(getDesign20CardContent(source).focus, [longTerms[0]]);
  assert.deepEqual(getDesign20CardContent(source).fullExpertise, longTerms);
  assert.deepEqual(getDesign20CardContent(source, { focusTerms: ['multidisciplinary'] }).focus, [longTerms[1]]);
  assert.deepEqual(source.expertise, longTerms);
});

test('selection never mutates a doctor record or the selected filter arrays', () => {
  const source = doctor({ speciality: 'Adult Cardiology, Paediatric Cardiology', expertise: ['Heart Failure', 'Congenital Heart Disease'], languages: ['English', 'Kannada'] });
  const options = { specialties: ['Paediatric Cardiology'], focusTerms: ['congenital'], languages: ['Kannada'] };
  const before = structuredClone({ source, options });
  Object.freeze(source.expertise);
  Object.freeze(source.languages);
  Object.freeze(source);
  Object.values(options).forEach(Object.freeze);
  Object.freeze(options);
  const content = getDesign20CardContent(source, options);
  content.additionalSpecialties.push('Not a source specialty');
  content.focus.reverse();
  assert.deepEqual({ source, options }, before);
});
