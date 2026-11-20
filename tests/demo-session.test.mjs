import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/features/auth/demo-session.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function session(saved = true, blocked = false) {
  const storage = () => {
    const data = new Map(saved ? [['isLoggedIn', 'true']] : []);
    return { getItem: key => { if (blocked) throw Error(); return data.get(key) ?? null; }, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  };
  const listeners = new Map();
  const window = { localStorage: storage(), sessionStorage: storage(), addEventListener: (type, callback) => listeners.set(type, callback), removeEventListener: type => listeners.delete(type), dispatchEvent: event => listeners.get(event.type)?.(event) };
  class CustomEvent { constructor(type, { detail } = {}) { this.type = type; this.detail = detail; } }
  function load() {
    const context = { exports: {}, window, sessionStorage: window.sessionStorage, CustomEvent };
    vm.runInNewContext(code, context);
    return context.exports;
  }
  return { load, window, listeners };
}
test('restores sign-in after a fresh module load and reload', () => {
  const { load } = session();
  assert.equal(load().getDemoSession(), true);
  assert.equal(load().getDemoSession(), true);
});
test('explicit logout stays signed out after reload', () => {
  const { load } = session();
  load().setDemoSession(false);
  assert.equal(load().getDemoSession(), false);
});
test('login before subscriptions is retained', () => {
  const { load } = session(false);
  const auth = load();
  auth.setDemoSession(true);
  assert.equal(auth.getDemoSession(), true);
  assert.equal(load().getDemoSession(), true);
});
test('cross-tab logout clears the stale session flag', () => {
  const { load, listeners } = session();
  const auth = load();
  auth.getDemoSession();
  auth.subscribeDemoSession(() => {});
  listeners.get('storage')({ key: 'isLoggedIn', newValue: null });
  assert.equal(auth.getDemoSession(), false);
});
test('unavailable storage does not throw', () => {
  const auth = session(false, true).load();
  assert.equal(auth.getDemoSession(), false);
  auth.setDemoSession(true);
  assert.equal(auth.getDemoSession(), true);
});
