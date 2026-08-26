/* test/version-check.test.mjs — the "no device stays on an old build" logic.
 *
 * js/version-check.js is browser code, so it runs here inside a node:vm with
 * stubbed window / document / storage / fetch. No browser required.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('../js/version-check.js', import.meta.url), 'utf8');

function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

/* Builds a page, runs version-check.js in it, and returns handles to drive it. */
function makePage({ buildIds = [], pathname = '/', local = {}, session = {}, endpointDown = false } = {}) {
  const listeners = { window: {}, document: {} };
  const state = { reloads: 0, fetches: 0 };
  let idx = 0;

  const addTo = (bag) => (type, fn) => { (bag[type] ||= []).push(fn); };

  const sandbox = {
    location: { pathname, reload: () => { state.reloads++; } },
    localStorage: fakeStorage(local),
    sessionStorage: fakeStorage(session),
    document: {
      readyState: 'complete',
      hidden: false,
      addEventListener: addTo(listeners.document),
    },
    fetch: async () => {
      state.fetches++;
      if (endpointDown) throw new Error('network down');
      const buildId = buildIds[Math.min(idx++, buildIds.length - 1)];
      return {
        ok: buildId != null,
        json: async () => ({ buildId }),
      };
    },
    Date,
    console,
  };
  sandbox.window = sandbox;
  sandbox.window.addEventListener = addTo(listeners.window);

  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox);

  const fire = async (target, type, ev = {}) => {
    for (const fn of listeners[target][type] || []) fn(ev);
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));
  };

  return { state, sandbox, fire, settle: () => new Promise((r) => setTimeout(r, 0)) };
}

describe('version check', () => {
  test('records the build on first load and does not reload', async () => {
    const page = makePage({ buildIds: ['build-1'] });
    await page.settle();
    assert.equal(page.state.reloads, 0);
    assert.equal(page.sandbox.sessionStorage.getItem('rh_build_id'), 'build-1');
  });

  test('reloads exactly once when a new build is deployed', async () => {
    const page = makePage({ buildIds: ['build-1', 'build-2', 'build-2', 'build-2'] });
    await page.settle();
    assert.equal(page.state.reloads, 0, 'baseline captured, no reload yet');

    /* pageshow(persisted) is the bfcache case and clears the throttle */
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 1, 'new build -> reload');

    await page.fire('window', 'pageshow', { persisted: true });
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 1, 'guarded against a reload loop');
  });

  test('does not reload while the build is unchanged', async () => {
    const page = makePage({ buildIds: ['same', 'same', 'same'] });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 0);
  });

  test('an endpoint that is down never blocks or reloads the page', async () => {
    const page = makePage({ endpointDown: true });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 0);
    assert.ok(page.state.fetches > 0, 'it did try');
  });

  test('never reloads the admin panel itself', async () => {
    const page = makePage({ buildIds: ['build-1', 'build-2'], pathname: '/admin.html' });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.fetches, 0, 'the admin page is never version-checked');
    assert.equal(page.state.reloads, 0);
  });

  test('never reloads while the admin has unpublished local changes', async () => {
    const page = makePage({
      buildIds: ['build-1', 'build-2'],
      local: { rh_admin_unpublished: '1' },
    });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.fetches, 0, 'no check runs mid-edit');
    assert.equal(page.state.reloads, 0);
  });

  /* Regression: the admin's own browser keeps rh_admin_* working copies in
   * localStorage forever. If those keys suppressed the check, the one browser
   * most likely to be verifying a publish would never pick up a new build. */
  test('leftover admin working copies do NOT freeze version checking', async () => {
    const page = makePage({
      buildIds: ['build-1', 'build-2'],
      local: {
        rh_admin_projects: '[{"title":"published already"}]',
        rh_admin_products: '[{"name":"published already"}]',
        /* note: no rh_admin_unpublished — the last publish cleared it */
      },
    });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 1, 'a published admin still gets the new build');
  });

  test('after a successful publish clears the flag, reloads resume', async () => {
    const page = makePage({
      buildIds: ['build-1', 'build-2', 'build-2'],
      local: { rh_admin_unpublished: '1' },
    });
    await page.settle();
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 0, 'held while edits are unpublished');

    page.sandbox.localStorage.removeItem('rh_admin_unpublished');   // publish succeeded

    /* The first unsuppressed check captures the baseline — this page was
     * served by build-1, so build-1 is correctly its starting point. */
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 0, 'first check after publishing captures the baseline');
    assert.equal(page.sandbox.sessionStorage.getItem('rh_build_id'), 'build-1');

    /* The next one sees the deploy the publish triggered. */
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 1, 'reload resumes once published');
  });

  test('throttles repeated checks so focus-flapping cannot hammer the endpoint', async () => {
    const page = makePage({ buildIds: ['build-1', 'build-1', 'build-1'] });
    await page.settle();
    const after = page.state.fetches;
    await page.fire('window', 'focus');
    await page.fire('window', 'focus');
    await page.fire('document', 'visibilitychange');
    assert.equal(page.state.fetches, after, 'throttled within the 30s window');
  });

  test('a visibility change after the throttle window does check', async () => {
    const page = makePage({ buildIds: ['build-1', 'build-2'] });
    await page.settle();
    /* pageshow(persisted) resets the throttle, which is how a phone waking
     * from bfcache picks up a deploy that landed while it was asleep. */
    await page.fire('window', 'pageshow', { persisted: true });
    assert.equal(page.state.reloads, 1);
  });
});
