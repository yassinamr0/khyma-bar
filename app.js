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

  /* ---------- scroll: the mural's waves slide at different depths, the photo strip drifts sideways ---------- */
  const murals = $$('.mural'), stripIn = $('#stripIn'), strip = $('#strip');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    murals.forEach(m => {
      const r = m.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      m.style.setProperty('--p', Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh)).toFixed(3));
    });
    const s = strip.getBoundingClientRect();
    if (s.bottom > 0 && s.top < vh) {
      // 0 as the strip enters at the bottom of the screen, 1 as it leaves at the top: by then every picture has passed
      const k = Math.max(0, Math.min(1, (vh - s.top) / (vh + s.height)));
      const pad = parseFloat(getComputedStyle(strip).paddingInlineStart) * 2;
      const travel = Math.max(0, stripIn.scrollWidth + pad - strip.clientWidth);
      stripIn.style.setProperty('--x', (k * travel * (root.dir === 'rtl' ? 1 : -1)).toFixed(1) + 'px');
    }
  }
  if (!reduce) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll); onScroll();
  }

  /* ---------- entrances ---------- */
  $$('.steps li, .cols .col, .facts > div, .strip .pic').forEach(el => el.style.setProperty('--i', [...el.parentElement.children].indexOf(el)));
  const targets = $$('.rv, .scene h2, .sheet, .proof .big, .proof .lead, .f-desc, .chips, .visit .actions, .strip .pic, .wordmark, .foot-row');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  applyLang();
})();
