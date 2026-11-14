(() => {
  const root = document.documentElement;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = motionPreference.matches;
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

  /* Reviews never autoplay. Native scrolling also works without JavaScript. */
  const reviews = $('.reviews'), cards = $$('.review-card');
  const controls = $('.review-controls');
  controls.hidden = false;
  controls.addEventListener('click', e => {
    const button = e.target.closest('[data-review-step]');
    if (!button) return;
    const viewport = reviews.getBoundingClientRect();
    const positions = cards.map(card => card.getBoundingClientRect());
    const start = root.dir === 'rtl' ? viewport.right : viewport.left;
    const distances = positions.map(r => Math.abs((root.dir === 'rtl' ? r.right : r.left) - start));
    const current = distances.indexOf(Math.min(...distances));
    const next = Math.max(0, Math.min(cards.length - 1, current + Number(button.dataset.reviewStep)));
    cards[next].scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'nearest', inline: 'start' });
  });

  /* Desktop-only parallax. No scroll listener or geometry reads on phones. */
  const murals = $$('.mural'), visibleMurals = new Set();
  const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  let scrollFrame = 0;
  function onScroll() {
    scrollFrame = 0;
    if (reduce || !desktop.matches || document.hidden) return;
    const vh = innerHeight;
    const rects = [...visibleMurals].map(m => [m, m.getBoundingClientRect()]);
    rects.forEach(([m, r]) => {
      m.style.setProperty('--p', Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh)).toFixed(3));
    });
  }
  function queueScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll);
  }
  function configureMotion() {
    removeEventListener('scroll', queueScroll);
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    reduce = motionPreference.matches;
    if (!reduce && desktop.matches) {
      addEventListener('scroll', queueScroll, { passive: true });
      queueScroll();
    } else {
      murals.forEach(m => m.style.removeProperty('--p'));
    }
  }
  desktop.addEventListener('change', configureMotion);
  motionPreference.addEventListener('change', configureMotion);
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        target.classList.toggle('motion-visible', isIntersecting);
        if (target.classList.contains('mural')) {
          if (isIntersecting) visibleMurals.add(target);
          else visibleMurals.delete(target);
        }
      });
      if (!reduce && desktop.matches) queueScroll();
    });
    [...murals, $('.hero-pics'), $('.marquee'), $('.proof')].forEach(el => motionObserver.observe(el));
  }
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('motion-hidden', document.hidden);
    if (!document.hidden && !reduce && desktop.matches) queueScroll();
  });

  /* ---------- entrances ---------- */
  $$('.steps li, .cols .col, .facts > div').forEach(el => el.style.setProperty('--i', [...el.parentElement.children].indexOf(el)));
  const targets = $$('.rv, .scene h2, .sheet, .proof .big, .proof .lead, .f-desc, .chips, .visit .actions, .wordmark, .foot-row');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  applyLang();
  configureMotion();
})();
