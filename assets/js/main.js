/* One Isle Residencies — interactions (vanilla JS, no build step) */
(() => {
  'use strict';
  const D = window.ONEISLE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Smooth scroll (Lenis, progressive) ---------- */
  let lenis = null;
  const initLenis = () => {
    if (lenis || !window.Lenis || reduced || isTouch) return;
    lenis = new window.Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    window.oneisleLenis = lenis;
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  // Native scrolling is used for speed; Lenis only runs if a page explicitly includes it.
  if (window.Lenis) initLenis();
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  const lock = (on) => {
    document.body.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* In-page anchor links */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    const norm = p => p.replace(/\/index\.html$/, '/');
    if (norm(url.pathname) !== norm(location.pathname) || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (menu && menu.classList.contains('is-open')) closeMenu();
    setTimeout(() => scrollToEl(target), menu && menu.classList.contains('is-open') ? 0 : 0);
    history.replaceState(null, '', url.hash);
  });

  /* ---------- Header ---------- */
  const header = $('.header');
  let lastY = 0;
  const onScrollHeader = () => {
    const y = window.scrollY;
    if (!header) return;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !document.body.classList.contains('is-locked'));
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Menu overlay ---------- */
  const menu = $('#menu');
  const trigger = $('.menu-trigger');
  let lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    lock(true);
    setTimeout(() => $('.menu-close', menu).focus(), 300);
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    lock(false);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  if (menu && trigger) {
    trigger.addEventListener('click', openMenu);
    $('.menu-close', menu).addEventListener('click', closeMenu);
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
      if (e.key === 'Tab') {
        const f = $$('a, button', menu).filter(el => el.offsetParent !== null);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    const previews = $$('.menu__preview img', menu);
    $$('.menu__list a', menu).forEach((a, i) => {
      const show = () => previews.forEach((p, j) => p.classList.toggle('is-active', j === (i % previews.length)));
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
    });
  }

  /* ---------- Split headline lines ---------- */
  $$('[data-lines]').forEach(el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p => `<span class="line"><span>${p.trim()}</span></span>`).join('');
    el.classList.add('lines');
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
  const heroEls = $$('.hero .reveal, .hero .lines, .page-hero, .page-hero .reveal, .page-hero .lines');
  $$('.reveal, .lines, .mask').filter(el => !heroEls.includes(el)).forEach(el => io.observe(el));
  // Above-the-fold hero content animates in on load rather than on scroll
  const introDelay = 60;
  requestAnimationFrame(() => setTimeout(() => heroEls.forEach(el => el.classList.add('is-in')), introDelay));

  /* ---------- Parallax ---------- */
  const px = $$('[data-parallax]');
  px.forEach(el => el.parentElement.classList.add('has-parallax'));
  if (px.length && !reduced) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      px.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * speed * 100).toFixed(2)}%, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Hero slideshow ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero);
    const counter = $('.hero__meta .cur', hero);
    const bar = $('.hero__meta .bar i', hero);
    let i = 0, timer;
    // slides 2+ are fetched only after the page has loaded, so the first photo gets full bandwidth
    const loadSlide = (s) => {
      const img = $('img', s);
      if (img && img.dataset.src) {
        if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
        img.src = img.dataset.src; img.removeAttribute('data-src');
      }
    };
    const preloadRest = () => setTimeout(() => slides.slice(1).forEach(loadSlide), 800);
    if (document.readyState === 'complete') preloadRest(); else window.addEventListener('load', preloadRest, { once: true });
    const go = (n) => {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      const s = slides[i];
      const img = $('img', s);
      loadSlide(s);
      s.classList.add('is-active');
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); }
    };
    // first slide is visible from first paint; restart its slow zoom
    const first = $('img', slides[0]);
    if (first && !reduced) { first.style.transform = 'scale(1.14)'; void first.offsetWidth; requestAnimationFrame(() => { first.style.transform = ''; }); }
    if (bar) bar.classList.add('run');
    if (slides.length > 1 && !reduced) timer = setInterval(() => go(i + 1), 7000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else if (slides.length > 1 && !reduced) { clearInterval(timer); timer = setInterval(() => go(i + 1), 7000); }
    });
  }

  /* ---------- Residences explorer ---------- */
  $$('[data-residences]').forEach(root => {
    const fixed = root.dataset.residences;           // "isle-ii" | "loft" | "" (switchable)
    let devKey = fixed || 'isle-ii';
    let idx = 0;
    const typesEl = $('.res__types', root);
    const stage = $('.res__stage', root);
    const priceEl = $('.res__price span', root);
    const specs = { sqft: $('[data-spec="sqft"]', root), beds: $('[data-spec="beds"]', root), baths: $('[data-spec="baths"]', root), balc: $('[data-spec="balc"]', root) };
    const label = $('.res__stage-label', root);
    const zoom = $('.res__stage-zoom', root);
    const enquire = $('[data-res-enquire]', root);
    const dl = $('.res__stage-dl', root);
    const tabs = $$('.toggle button', root);
    const pill = $('.toggle__pill', root);

    const placePill = () => {
      const active = tabs.find(t => t.getAttribute('aria-selected') === 'true');
      if (!active || !pill) return;
      pill.style.width = active.offsetWidth + 'px';
      pill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
    };

    const renderTypes = () => {
      const dev = D.developments[devKey];
      typesEl.innerHTML = dev.residences.map((r, n) => `
        <li><button type="button" role="tab" aria-selected="${n === idx}" data-i="${n}">
          <span class="n">0${n + 1}</span><span class="t">${r.name}</span><span class="s">${r.beds} Bed · ${r.sqft.toLocaleString()} sq ft</span>
        </button></li>`).join('');
      stage.querySelectorAll('.res__plan').forEach(p => p.remove());
      dev.residences.forEach((r, n) => {
        const d = document.createElement('div');
        d.className = 'res__plan' + (n === idx ? ' is-active' : '');
        d.innerHTML = r.plan
          ? `<img src="${r.plan}" alt="Floor plan — ${r.name}, ${dev.name}" width="580" height="400" loading="lazy">`
          : `<div class="res__placeholder"><strong>Floor plan coming soon</strong>The ${r.name} plan for ${dev.name} is available on request. <br><small>[Client to supply plan artwork]</small></div>`;
        stage.appendChild(d);
      });
      if (priceEl) priceEl.textContent = dev.startingFrom;
      select(idx);
    };

    const select = (n) => {
      const dev = D.developments[devKey];
      idx = n;
      const r = dev.residences[n];
      $$('button', typesEl).forEach((b, j) => b.setAttribute('aria-selected', j === n));
      $$('.res__plan', stage).forEach((p, j) => p.classList.toggle('is-active', j === n));
      specs.sqft.textContent = r.sqft.toLocaleString();
      specs.beds.textContent = r.beds;
      specs.baths.textContent = r.baths;
      specs.balc.textContent = r.balconies;
      if (label) label.textContent = `${dev.name} — ${r.name}`;
      if (zoom) zoom.hidden = !r.plan;
      if (enquire) enquire.dataset.prefill = `${devKey}|${r.id}`;
      if (dl) { dl.hidden = !r.plan; if (r.plan) { dl.href = r.plan; dl.setAttribute('download', `${dev.name.replace(/\W+/g, '-')}-${r.name.replace(/\W+/g, '-')}-floor-plan.png`); } }
      root.dataset.current = devKey;
      root.dispatchEvent(new CustomEvent('residences:change'));
    };

    typesEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) select(+b.dataset.i); });
    typesEl.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const n = (idx + (e.key === 'ArrowDown' ? 1 : -1) + 3) % 3;
      select(n); $$('button', typesEl)[n].focus();
    });
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.setAttribute('aria-selected', x === t));
      devKey = t.dataset.dev; idx = 0; renderTypes(); placePill();
    }));
    if (zoom) zoom.addEventListener('click', () => {
      const r = D.developments[devKey].residences[idx];
      openLightbox([{ src: r.plan, caption: `${D.developments[devKey].name} — ${r.name} floor plan`, plan: true }], 0);
    });
    if (enquire) enquire.addEventListener('click', () => {
      const [dv, rid] = (enquire.dataset.prefill || '').split('|');
      prefillForm(dv, rid);
    });
    window.addEventListener('resize', placePill);
    renderTypes();
    requestAnimationFrame(placePill);
    document.fonts && document.fonts.ready.then(placePill);
  });

  /* ---------- Amenities: sync sticky image to the item in view ---------- */
  const amen = $('.amen');
  if (amen) {
    const figs = $$('.amen__visual figure', amen);
    const items = $$('.amen__item', amen);
    const count = $('.amen__count .cur', amen);
    const aio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const n = items.indexOf(en.target);
        items.forEach((it, j) => it.classList.toggle('is-active', j === n));
        figs.forEach((f, j) => f.classList.toggle('is-active', j === n));
        if (count) count.textContent = String(n + 1).padStart(2, '0');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(it => aio.observe(it));
  }

  /* ---------- Location map (Leaflet, loaded when near view) ---------- */
  const mapEl = $('#map');
  if (mapEl && D.map) {
    let markers = [];
    const list = $('.loc__list');
    const init = () => {
      if (!window.L) return;
      const L = window.L;
      const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([6.8560, 79.9070], 15);
      // OpenStreetMap tiles, toned to the palette in CSS. For high-traffic production use,
      // swap for a keyed provider (e.g. MapTiler / Stadia) per OSM's tile usage policy.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19
      }).addTo(map);
      const icon = (cls) => L.divIcon({ className: '', html: `<div class="pin ${cls}"></div>`, iconSize: [22, 22], iconAnchor: [11, 11] });
      D.map.developments.forEach(d => {
        L.marker([d.lat, d.lng], { icon: icon('pin--dev'), keyboard: false })
          .addTo(map).bindTooltip(`<strong>${d.name}</strong><br>${d.sub}`, { className: 'oi-tip', direction: 'top', offset: [0, -14], permanent: true });
      });
      markers = D.map.places.map(p => L.marker([p.lat, p.lng], { icon: icon(''), title: p.name })
        .addTo(map).bindTooltip(p.name, { className: 'oi-tip', direction: 'top', offset: [0, -10] }));
      const all = L.featureGroup([...markers]);
      map.fitBounds(all.getBounds().pad(0.15));
      $$('.loc__place', list).forEach((btn, n) => {
        btn.addEventListener('click', () => {
          $$('.loc__place', list).forEach(b => b.classList.toggle('is-active', b === btn));
          $$('.pin', mapEl).forEach(p => p.classList.remove('is-active'));
          const m = markers[n];
          map.flyTo(m.getLatLng(), 16, { duration: 1.1 });
          m.openTooltip();
          const el = m.getElement() && m.getElement().querySelector('.pin');
          if (el) el.classList.add('is-active');
        });
      });
      $$('.loc__filters .chip').forEach(chip => chip.addEventListener('click', () => {
        const cat = chip.dataset.cat;
        $$('.loc__filters .chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
        const shown = [];
        D.map.places.forEach((p, n) => {
          const on = cat === 'all' || p.cat === cat;
          $$('li', list)[n].hidden = !on;
          if (on) { markers[n].addTo(map); shown.push(markers[n]); } else markers[n].remove();
        });
        if (shown.length) map.flyToBounds(L.featureGroup(shown).getBounds().pad(0.35), { duration: 1, maxZoom: 16 });
      }));
    };
    // build list
    list.innerHTML = D.map.places.map(p => `<li><button type="button" class="loc__place"><span class="c">${p.cat}</span><span class="t">${p.name}</span></button><a class="loc__dir" href="${p.url}" target="_blank" rel="noopener">Directions<span class="sr-only"> to ${p.name} (opens Google Maps)</span></a></li>`).join('');
    const mio = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      mio.disconnect();
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = init;
      document.head.appendChild(s);
    }, { rootMargin: '600px' });
    mio.observe(mapEl);
  }

  /* ---------- Gallery + lightbox ---------- */
  const lb = $('#lightbox');
  let lbItems = [], lbIndex = 0, lbReturn = null;
  function renderLb() {
    const img = $('img', lb);
    const it = lbItems[lbIndex];
    img.classList.add('is-out');
    setTimeout(() => {
      img.src = it.src; img.alt = it.caption || '';
      img.style.background = it.plan ? 'var(--ivory)' : '';
      img.style.padding = it.plan ? '4%' : '';
      img.onload = () => img.classList.remove('is-out');
      if (img.complete) img.classList.remove('is-out');
    }, lb.classList.contains('is-open') ? 250 : 0);
    $('.lightbox__caption', lb).textContent = it.caption || '';
    $('.lightbox__count', lb).textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
    $('.lightbox__nav', lb).style.visibility = lbItems.length > 1 ? 'visible' : 'hidden';
  }
  function openLightbox(items, n) {
    if (!lb) return;
    lbItems = items; lbIndex = n; lbReturn = document.activeElement;
    renderLb();
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    lock(true);
    $('.lightbox__close', lb).focus();
  }
  function closeLightbox() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    lock(false);
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  }
  if (lb) {
    const step = d => { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; renderLb(); };
    $('.lightbox__close', lb).addEventListener('click', closeLightbox);
    $('[data-lb="prev"]', lb).addEventListener('click', () => step(-1));
    $('[data-lb="next"]', lb).addEventListener('click', () => step(1));
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') { // trap
        const f = $$('button', lb).filter(b => b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden');
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
    $('.lightbox__stage', lb).addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });
  }
  const gal = $('.gal__grid');
  if (gal) {
    const visible = () => $$('.gal__item', gal).filter(b => !b.hidden);
    gal.addEventListener('click', e => {
      const b = e.target.closest('.gal__item'); if (!b) return;
      const vis = visible();
      openLightbox(vis.map(x => ({ src: x.dataset.full, caption: x.dataset.caption })), vis.indexOf(b));
    });
    $$('.gal__filters .chip').forEach(chip => chip.addEventListener('click', () => {
      $$('.gal__filters .chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
      const cat = chip.dataset.cat;
      $$('.gal__item', gal).forEach(it => { it.hidden = !(cat === 'all' || it.dataset.cat.split(' ').includes(cat)); });
    }));
  }
  $$('[data-lightbox-group]').forEach(group => {
    const items = $$('[data-full]', group);
    items.forEach((it, n) => it.addEventListener('click', () => openLightbox(items.map(x => ({ src: x.dataset.full, caption: x.dataset.caption })), n)));
  });

  /* ---------- Enquiry form → existing Contact Form 7 backend ---------- */
  // On preview hosts (anything other than oneisle.co / localhost) forms never reach the real backend.
  const PREVIEW = !/(^|\.)oneisle\.co$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
  function prefillForm(devKey, resId, note) {
    const form = $('#enquiry-form');
    if (!form) {
      const q = new URLSearchParams();
      if (devKey) q.set('dev', devKey); if (resId) q.set('res', resId); if (note) q.set('note', note);
      location.href = `contact.html?${q}`; return;
    }
    if (devKey) form.elements.development.value = devKey;
    syncConfigOptions(form);
    if (resId) form.elements.configuration.value = resId;
    if (note) form.elements.message.value = note;
    scrollToEl($('#enquire'));
  }
  function syncConfigOptions(form) {
    const dev = form.elements.development.value;
    const sel = form.elements.configuration;
    const keep = sel.value;
    const devs = dev && D.developments[dev] ? [dev] : Object.keys(D.developments);
    const seen = new Set();
    sel.innerHTML = '<option value="">No preference</option>' + devs.flatMap(k => D.developments[k].residences).filter(r => !seen.has(r.id) && seen.add(r.id))
      .map(r => {
        const sizes = devs.map(k => D.developments[k].residences.find(x => x.id === r.id)).map(x => x.sqft.toLocaleString()).join(' / ');
        return `<option value="${r.id}">${r.name} — ${r.beds} bed · ${sizes} sq ft</option>`;
      }).join('');
    if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
  }

  let recaptchaLoading = null;
  function loadRecaptcha() {
    const key = D.backend && D.backend.recaptchaSiteKey;
    if (!key) return Promise.resolve(null);
    if (recaptchaLoading) return recaptchaLoading;
    recaptchaLoading = new Promise(res => {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
      s.onload = () => res(window.grecaptcha || null);
      s.onerror = () => res(null);
      document.head.appendChild(s);
      setTimeout(() => res(window.grecaptcha || null), 8000);
    });
    return recaptchaLoading;
  }
  async function recaptchaToken() {
    const g = await loadRecaptcha();
    if (!g || !g.execute) return '';
    return new Promise(res => {
      try { g.ready(() => g.execute(D.backend.recaptchaSiteKey, { action: 'contactform' }).then(res, () => res(''))); }
      catch (_) { res(''); }
      setTimeout(() => res(''), 6000);
    });
  }
  async function submitCF7(formId, unitTag, fields) {
    const fd = new FormData();
    fd.append('_wpcf7', formId);
    fd.append('_wpcf7_version', '6.2.4.1');
    fd.append('_wpcf7_locale', 'en_US');
    fd.append('_wpcf7_unit_tag', unitTag);
    fd.append('_wpcf7_container_post', '0');
    fd.append('_wpcf7_recaptcha_response', await recaptchaToken());
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    const endpoint = window.ONEISLE_FORM_ENDPOINT || `${D.backend.base}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
    const r = await fetch(endpoint, { method: 'POST', body: fd });
    const json = await r.json().catch(() => ({}));
    return { ok: r.ok && json.status === 'mail_sent', json };
  }

  const form = $('#enquiry-form');
  if (form) {
    syncConfigOptions(form);
    form.elements.development.addEventListener('change', () => syncConfigOptions(form));
    const dateEl = form.elements.date;
    const t = new Date(); t.setDate(t.getDate() + 1);
    dateEl.min = t.toISOString().slice(0, 10);
    // prefill from query (?dev=&res=)
    const q = new URLSearchParams(location.search);
    if (q.get('dev')) { form.elements.development.value = q.get('dev'); syncConfigOptions(form); }
    if (q.get('res')) form.elements.configuration.value = q.get('res');
    if (q.get('note')) form.elements.message.value = q.get('note');
    form.addEventListener('focusin', loadRecaptcha, { once: true });

    const status = $('.form__status', form);
    const setErr = (name, msg) => {
      const f = form.elements[name].closest('.field');
      f.classList.toggle('is-invalid', !!msg);
      form.elements[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
      $('.field__err', f).textContent = msg || '';
    };
    const validate = () => {
      let ok = true;
      const v = n => form.elements[n].value.trim();
      if (!v('name')) { setErr('name', 'Please tell us your name.'); ok = false; } else setErr('name');
      if (!/^[+()\d\s-]{7,}$/.test(v('phone'))) { setErr('phone', 'Please enter a valid phone number.'); ok = false; } else setErr('phone');
      if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) { setErr('email', 'Please check your email address.'); ok = false; } else setErr('email');
      return ok;
    };
    $$('input, select', form).forEach(el => el.addEventListener('blur', () => { if (form.dataset.tried) validate(); }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      form.dataset.tried = '1';
      if (!validate()) { const bad = $('.is-invalid input, .is-invalid select', form); if (bad) bad.focus(); return; }
      const btn = $('button[type="submit"]', form);
      btn.setAttribute('aria-busy', 'true');
      const label = $('.label', btn); const old = label.textContent; label.textContent = 'Sending…';
      const el = form.elements;
      const devName = el.development.value ? D.developments[el.development.value].name : 'No preference';
      const cfg = el.configuration.options[el.configuration.selectedIndex].text;
      const message = [
        `Preferred development: ${devName}`,
        `Preferred configuration: ${cfg}`,
        el.message.value.trim() ? `\n${el.message.value.trim()}` : ''
      ].join('\n');
      const fields = {
        'full-name': el.name.value.trim(),
        'number': el.phone.value.trim(),
        'your-email': el.email.value.trim(),
        'date-270': el.date.value,
        'menu-429': el.time.value,
        'your-message': message
      };
      let result = { ok: false };
      if (PREVIEW) {
        btn.removeAttribute('aria-busy'); label.textContent = old;
        status.classList.add('is-shown', 'is-ok');
        status.innerHTML = '<strong>Preview only — this request was not sent.</strong> On the live site (oneisle.co) it goes straight to the One Isle sales team.';
        status.setAttribute('tabindex', '-1'); status.focus();
        return;
      }
      try { result = await submitCF7(D.backend.viewingFormId, 'wpcf7-f1149-o1', fields); } catch (_) { /* network / CORS */ }
      btn.removeAttribute('aria-busy'); label.textContent = old;
      status.classList.add('is-shown');
      if (result.ok) {
        status.classList.add('is-ok');
        status.innerHTML = `<strong>Thank you, ${fields['full-name'].split(' ')[0]}.</strong> Your viewing request has been received — our team will be in touch shortly to confirm.`;
        form.reset(); syncConfigOptions(form); delete form.dataset.tried;
      } else {
        status.classList.remove('is-ok');
        const wa = `${D.contact.whatsapp}?text=${encodeURIComponent(`Hello One Isle, I'd like to schedule a private viewing.\nName: ${fields['full-name']}\nPhone: ${fields.number}\n${message}\nPreferred date: ${fields['date-270'] || '-'} ${fields['menu-429']}`)}`;
        status.innerHTML = `We couldn't send your request just now. Please <a href="${wa}" target="_blank" rel="noopener">send it via WhatsApp</a> or call <a href="${D.contact.phoneHref}">${D.contact.phone}</a>.`;
      }
      status.focus && status.setAttribute('tabindex', '-1'); status.focus();
    });
  }

  /* Newsletter (existing CF7 form 719) */
  $$('.news').forEach(nf => nf.addEventListener('submit', async e => {
    e.preventDefault();
    const input = $('input', nf), msg = nf.nextElementSibling;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) { msg.textContent = 'Please enter a valid email.'; return; }
    if (PREVIEW) { msg.textContent = 'Preview only — not subscribed. This works on the live site.'; return; }
    msg.textContent = 'Subscribing…';
    let r = { ok: false };
    try { r = await submitCF7(D.backend.newsletterFormId, 'wpcf7-f719-o2', { 'your-email': input.value.trim() }); } catch (_) {}
    msg.textContent = r.ok ? 'Thank you — you are on the list.' : `Sorry, that didn't go through. Email us at ${D.contact.email}.`;
    if (r.ok) input.value = '';
  }));

  /* Shared API for enhance.js */
  window.OneIsle = { prefillForm, openLightbox, scrollToEl, lock, $, $$, reduced, isTouch };

  /* Current year */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
