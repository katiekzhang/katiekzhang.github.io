/* ============================================================
   theme-toggle.js
   Handles:
     1. Day/night toggle button (theme stored in localStorage)
     2. Moon phase SVG in the night-mode divider
     3. Active section highlighting in the sticky nav
   ============================================================ */

/* ── 1. Theme toggle button ── */
(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();


/* ── 2. Moon phase — drives the SVG crescent in the night divider ── */
(function () {
  var shape = document.getElementById('moonShape');
  if (!shape) return;

  var CX = 710, CY = 22, R = 9;
  var SYNODIC_MS = 29.530588853 * 86400000;
  // Reference new moon: 2000-01-06 18:14 UTC
  var REF_NEW = Date.UTC(2000, 0, 6, 18, 14);

  function phaseFraction(date) {
    var elapsed = (date.getTime() - REF_NEW) % SYNODIC_MS;
    return (elapsed < 0 ? elapsed + SYNODIC_MS : elapsed) / SYNODIC_MS;
  }

  function moonPath(p) {
    // p: 0–1 where 0 = new moon, 0.5 = full moon
    var angle   = p * 2 * Math.PI;
    var cosA    = Math.cos(angle);
    var rx      = R * Math.abs(cosA);
    var waxing  = p < 0.5;
    var gibbous = cosA < 0;
    var outerSweep = waxing ? 1 : 0;
    var termSweep  = waxing ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1);
    return (
      'M ' + CX + ' ' + (CY - R) +
      ' A ' + R + ' ' + R + ' 0 0 ' + outerSweep + ' ' + CX + ' ' + (CY + R) +
      ' A ' + rx.toFixed(2) + ' ' + R + ' 0 0 ' + termSweep + ' ' + CX + ' ' + (CY - R) + ' Z'
    );
  }

  function phaseName(p) {
    if (p < 0.02 || p >= 0.98) return 'New Moon';
    if (p < 0.23) return 'Waxing Crescent';
    if (p < 0.27) return 'First Quarter';
    if (p < 0.48) return 'Waxing Gibbous';
    if (p < 0.52) return 'Full Moon';
    if (p < 0.73) return 'Waning Gibbous';
    if (p < 0.77) return 'Last Quarter';
    return 'Waning Crescent';
  }

  function update() {
    var now   = new Date();
    var p     = phaseFraction(now);
    var age   = (p * 29.530588853).toFixed(1);
    var illum = Math.round((1 - Math.cos(p * 2 * Math.PI)) / 2 * 100);
    shape.setAttribute('d', moonPath(p));
    var title = shape.querySelector('title');
    if (title) title.textContent = phaseName(p) + ' · ' + illum + '% illuminated · age ' + age + 'd';
  }

  update();
  // Re-check hourly in case the page sits open across a phase boundary
  setInterval(update, 60 * 60 * 1000);
})();


/* ── 3. Active section highlighting in the sticky nav ── */
(function () {
  var links    = document.querySelectorAll('.nav-links a[data-target]');
  var sections = Array.from(links)
    .map(function (l) { return document.getElementById(l.dataset.target); })
    .filter(Boolean);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) {
          l.classList.toggle('active', l.dataset.target === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
})();
