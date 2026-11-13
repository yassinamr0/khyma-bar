(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- copy: [Arabic, English] ---------- */

  /* ---------- flavours: each one repaints the mural (a = ground, b c d = waves, i = text) ---------- */
  const { T, FLAVOURS } = window.KHYMA;

  let L = root.lang === 'en' ? 1 : 0;
  const t = k => (T[k] ? T[k][L] : k);

  /* ---------- flavour picker ---------- */
  const scene = $('#flavour'), chips = $('#chips'), fName = $('#fName'), fDesc = $('#fDesc');
  let cur = 0;
  FLAVOURS.forEach((f, i) => chips.insertAdjacentHTML('beforeend',
    `<input type="radio" name="flavour" id="f-${f.id}" value="${i}"${i ? '' : ' checked'}><label for="f-${f.id}" style="--c:${f.a}"><i></i><span></span></label>`));
  function paint(animate) {
    const f = FLAVOURS[cur];
    ['a', 'b', 'c', 'd', 'i'].forEach(k => scene.style.setProperty('--f' + k, f[k]));
    fName.textContent = f.n[L]; fDesc.textContent = f.d2[L];
    if (animate && !reduce) { fName.classList.remove('swap'); void fName.offsetWidth; fName.classList.add('swap'); }
  }
  chips.addEventListener('change', e => { cur = +e.target.value; paint(true); });

  /* ---------- language ---------- */
  function applyLang() {
    root.lang = L ? 'en' : 'ar'; root.dir = L ? 'ltr' : 'rtl';
    document.title = t('title');
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(',').forEach(p => { const [a, k] = p.split(':'); el.setAttribute(a, t(k)); }));
    FLAVOURS.forEach(f => { $(`label[for="f-${f.id}"] span`).textContent = f.n[L]; });
    paint(false);
  }

  /* Desktop parallax; phones use a compositor animation without scroll work. */
  const murals = $$('.mural'), stripIn = $('#stripIn'), strip = $('#strip');
  const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  let ticking = false, travel = 0;
  function measureStrip() {
    const style = getComputedStyle(strip);
    const pad = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
    travel = Math.max(0, stripIn.scrollWidth + pad - strip.clientWidth);
    stripIn.style.setProperty('--strip-end', (travel * (root.dir === 'rtl' ? 1 : -1)) + 'px');
  }
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    // Read geometry together before updating styles to avoid forced layout per mural.
    const rects = murals.map(m => m.getBoundingClientRect());
    const s = strip.getBoundingClientRect();
    rects.forEach((r, i) => {
      if (r.bottom < -200 || r.top > vh + 200) return;
      murals[i].style.setProperty('--p', Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh)).toFixed(3));
    });
    if (s.bottom > 0 && s.top < vh) {
      const k = Math.max(0, Math.min(1, (vh - s.top) / (vh + s.height)));
      stripIn.style.setProperty('--x', (k * travel * (root.dir === 'rtl' ? 1 : -1)).toFixed(1) + 'px');
    }
  }
  function queueScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }
  function configureMotion() {
    removeEventListener('scroll', queueScroll);
    measureStrip();
    if (!reduce && desktop.matches) {
      addEventListener('scroll', queueScroll, { passive: true });
      onScroll();
    }
  }
  desktop.addEventListener('change', configureMotion);
  addEventListener('resize', configureMotion);
  if ('ResizeObserver' in window) new ResizeObserver(measureStrip).observe(stripIn);
  if ('IntersectionObserver' in window) {
    const stripObserver = new IntersectionObserver(entries => {
      strip.classList.toggle('is-visible', entries[0].isIntersecting);
    });
    stripObserver.observe(strip);
  } else strip.classList.add('is-visible');

  /* ---------- entrances ---------- */
  $$('.steps li, .cols .col, .facts > div, .strip .pic').forEach(el => el.style.setProperty('--i', [...el.parentElement.children].indexOf(el)));
  const targets = $$('.rv, .scene h2, .sheet, .proof .big, .proof .lead, .f-desc, .chips, .visit .actions, .strip .pic, .wordmark, .foot-row');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  applyLang();
  configureMotion();
})();
