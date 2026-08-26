/* js/version-check.js — no browser stays stuck on an old deploy.
 *
 * Asks /version.json which build is live. The first answer of the session is
 * the build this page loaded with; if a later answer differs, a new deploy
 * landed while the tab was open, so reload exactly once.
 *
 * No build-time injection is needed: the baseline is captured at page load,
 * which is by definition the build that served this page.
 *
 * Runs on load, on tab focus, on visibility change, and on pageshow with
 * persisted=true (the bfcache back/forward case, which is the usual way a
 * phone ends up showing a version from hours ago).
 */
(function () {
  'use strict';

  var ENDPOINT = '/version.json';
  var BUILD_KEY = 'rh_build_id';
  var RELOAD_KEY = 'rh_reloaded_for';
  var MIN_GAP_MS = 30 * 1000;

  var lastCheck = 0;

  /* Suppress the reload only when it would actually cost the admin something.
   *
   * Deliberately NOT keyed on the rh_admin_* working-copy keys: admin.html
   * writes those on every edit and never clears them, so testing for them
   * would permanently freeze version checking in the admin's own browser —
   * the browser most likely to be checking whether a publish went live.
   *
   * 'rh_admin_unpublished' is the precise signal: set when an edit is saved
   * locally, cleared the moment a publish succeeds. */
  function adminIsMidEdit() {
    if (/\/admin(\.html)?$/.test(location.pathname)) return true;
    try {
      return localStorage.getItem('rh_admin_unpublished') === '1';
    } catch (e) {
      return false;   /* storage blocked — treat as not editing */
    }
  }

  function session(get, key, val) {
    try { return get ? sessionStorage.getItem(key) : sessionStorage.setItem(key, val); }
    catch (e) { return null; }
  }

  function check() {
    if (adminIsMidEdit()) return;

    var now = Date.now();
    if (now - lastCheck < MIN_GAP_MS) return;
    lastCheck = now;

    fetch(ENDPOINT, { cache: 'no-store', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.buildId) return;

        var known = session(true, BUILD_KEY);

        /* First answer this session: record it and stop. */
        if (!known) { session(false, BUILD_KEY, data.buildId); return; }
        if (known === data.buildId) return;

        /* A different build is live. Reload once per build ID — the guard
         * makes a reload loop impossible even if the endpoint flaps. */
        if (session(true, RELOAD_KEY) === data.buildId) return;
        session(false, RELOAD_KEY, data.buildId);
        session(false, BUILD_KEY, data.buildId);
        location.reload();
      })
      .catch(function () { /* offline or endpoint down — never block the page */ });
  }

  if (document.readyState === 'complete') check();
  else window.addEventListener('load', check);

  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) check();
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { lastCheck = 0; check(); }
  });
})();
