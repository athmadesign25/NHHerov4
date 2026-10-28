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
    if (specifier === 'next/navigation') return nextResolve('next/navigation.js', context);
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

const { readDesignVariant, setDesignVariant } = await import('../src/features/design-preview/useDesignVariant.ts');
const scope = 'search-top';
const storageKey = 'nh_design_preview:search-top';
const changeEvent = 'nh-design-preview-change';

function preview(t, pathname, query, stored = 'd4') {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map([[storageKey, stored]]);
  const events = new EventTarget();
  Object.defineProperty(globalThis, 'window', {
    configurable: true, writable: true, value: Object.assign(events, { location: { pathname, search: query } }),
  });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  } });
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else Object.defineProperty(globalThis, 'window', previousWindow);
    if (previousStorage === undefined) delete globalThis.localStorage;
    else Object.defineProperty(globalThis, 'localStorage', previousStorage);
  });
  return {
    navigate: queryString => { window.location.search = queryString; },
    otherTabSelect: id => { values.set(storageKey, id); },
  };
}

test('an explicit preview URL remains authoritative when another tab changes its preference', t => {
  const browser = preview(t, '/preview-explicit', '?design=d6', 'd4');
  assert.equal(readDesignVariant(scope), 'd6');
  browser.otherTabSelect('d5');
  assert.equal(readDesignVariant(scope), 'd6');
  browser.navigate('?design=d6&location=Mumbai');
  assert.equal(readDesignVariant(scope), 'd6');
});

test('D6 to D5 to D6 switches survive synchronous notifications and pending router URLs', t => {
  const browser = preview(t, '/preview-switches', '?design=d6');
  assert.equal(readDesignVariant(scope), 'd6');
  const snapshots = [];
  window.addEventListener(changeEvent, () => snapshots.push(readDesignVariant(scope)));

  setDesignVariant(scope, 'd5');
  assert.equal(readDesignVariant(scope), 'd5', 'the pending URL still says d6');
  browser.otherTabSelect('d4');
  assert.equal(readDesignVariant(scope), 'd5', 'the local pending choice beats another tab');
  browser.navigate('?design=d5');
  assert.equal(readDesignVariant(scope), 'd5');

  setDesignVariant(scope, 'd6');
  assert.equal(readDesignVariant(scope), 'd6', 'the pending URL still says d5');
  browser.navigate('?design=d6');
  assert.equal(readDesignVariant(scope), 'd6');
  browser.otherTabSelect('d4');
  assert.equal(readDesignVariant(scope), 'd6', 'the committed URL beats another tab');
  assert.deepEqual(snapshots, ['d5', 'd6']);
});

test('legacy manual choices survive filter-only changes until a new explicit design is entered', t => {
  const browser = preview(t, '/preview-legacy', '?design=d2&q=heart');
  assert.equal(readDesignVariant(scope), 'd2');
  setDesignVariant(scope, 'd1');
  assert.equal(readDesignVariant(scope), 'd1');
  browser.navigate('?design=d2&q=heart&location=Mumbai');
  assert.equal(readDesignVariant(scope), 'd1');
  browser.navigate('?design=d6&q=heart&location=Mumbai');
  assert.equal(readDesignVariant(scope), 'd6');
});

test('a legacy page without a design parameter retains its manual preference', t => {
  const browser = preview(t, '/preview-no-param', '?q=heart', 'd2');
  assert.equal(readDesignVariant(scope), 'd2');
  setDesignVariant(scope, 'd1');
  browser.navigate('?q=heart&location=Mumbai');
  browser.otherTabSelect('d4');
  assert.equal(readDesignVariant(scope), 'd1');
  browser.navigate('?design=d6&q=heart');
  assert.equal(readDesignVariant(scope), 'd6');
});

test('blocked storage still permits explicit URLs, manual switches and committed navigation', t => {
  const browser = preview(t, '/preview-blocked-storage', '?design=d6');
  globalThis.localStorage = {
    getItem() { throw new Error('Storage blocked'); },
    setItem() { throw new Error('Storage blocked'); },
  };
  assert.equal(readDesignVariant(scope), 'd6');
  setDesignVariant(scope, 'd5');
  assert.equal(readDesignVariant(scope), 'd5');
  browser.navigate('?design=d5');
  assert.equal(readDesignVariant(scope), 'd5');
  browser.navigate('?design=d6');
  assert.equal(readDesignVariant(scope), 'd6');
});

for (const design of ['d8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd16', 'd17', 'd17-lite']) test(`${design} remains selected through filter changes and a return from another visual option`, t => {
  const browser = preview(t, `/preview-${design}`, `?design=${design}&location=Bangalore`);
  assert.equal(readDesignVariant(scope), design);
  browser.otherTabSelect('d7');
  browser.navigate(`?design=${design}&location=Mumbai&mode=video`);
  assert.equal(readDesignVariant(scope), design);
  setDesignVariant(scope, 'd7');
  browser.navigate('?design=d7');
  assert.equal(readDesignVariant(scope), 'd7');
  setDesignVariant(scope, design);
  assert.equal(readDesignVariant(scope), design);
  browser.navigate(`?design=${design}`);
  assert.equal(readDesignVariant(scope), design);
});
