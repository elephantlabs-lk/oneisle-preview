/* One Isle — signature interactions (loads after main.js) */
(() => {
  'use strict';
  const D = window.ONEISLE || {};
  const O = window.OneIsle || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  /* ---------- 1. Building selector ---------- */
  $$('[data-building]').forEach(root => {
    const key = root.dataset.building;
    const b = D.building && D.building[key];
    const dev = D.developments && D.developments[key];
    if (!b || !dev) return;
    const svg = $('.bsel__svg', root);
    const list = $('.bsel__floors', root);
    const detail = $('.bsel__detail', root);
    const NS = 'http://www.w3.org/2000/svg';
    const [x0, x1] = b.x;
    let active = null;

    b.floors.forEach((f, i) => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x0); r.setAttribute('width', x1 - x0);
      r.setAttribute('y', f.y[0]); r.setAttribute('height', f.y[1] - f.y[0]);
      r.dataset.i = i;
      svg.appendChild(r);
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" aria-pressed="false" data-i="${i}"><span>${f.label}</span><span class="k">${f.kind === 'residential' ? 'Residences' : f.kind === 'podium' ? 'Podium' : 'Amenity'}</span></button>`;
      list.appendChild(li);
    });

    const statusChip = s => `<span class="status status--${s}">${s}</span>`;
    const render = (i) => {
      const f = b.floors[i];
      let body = '';
      if (f.kind === 'residential') {
        if (f.units && f.units.length) {
          body = `<ul class="spec-list">${f.units.map(u => {
            const r = dev.residences.find(x => x.id === u.type) || {};
            return `<li><span>${u.no} · ${r.name || ''}</span><span>${r.sqft ? r.sqft.toLocaleString() + ' sq ft · ' : ''}${statusChip(u.status)}</span></li>`;
          }).join('')}</ul>`;
        } else {
          body = `<p>The unit schedule for ${f.label.toLowerCase()} will be published soon — ask our team for live availability. Residence types at ${dev.name}:</p>
            <ul class="spec-list">${dev.residences.map(r => `<li><span>${r.name}</span><span>${r.beds} Bed · ${r.baths} Bath · ${r.sqft.toLocaleString()} sq ft</span></li>`).join('')}</ul>`;
        }
        body += `<button class="btn btn--light" type="button" data-floor-enquire><span class="label">Enquire about ${f.label}</span><span class="arrow" aria-hidden="true"></span></button>`;
      } else {
        body = `<p>${f.note || ''}</p>`;
      }
      detail.innerHTML = `<div class="bsel__fade"><span class="tag">${dev.name} · ${f.kind === 'residential' ? 'Residential level' : f.kind === 'podium' ? 'Podium' : 'Amenity'}</span><h3>${f.label}</h3>${body}</div>`;
      const eb = $('[data-floor-enquire]', detail);
      if (eb && O.prefillForm) eb.addEventListener('click', () => O.prefillForm(key, '', `I'm interested in a residence on ${f.label} of ${dev.name}.`));
    };
    const select = (i, focusList) => {
      active = i;
      $$('rect', svg).forEach(r => r.classList.toggle('is-active', +r.dataset.i === i));
      $$('button', list).forEach(btn => btn.setAttribute('aria-pressed', +btn.dataset.i === i));
      render(i);
      if (focusList) $$('button', list)[i].focus();
    };
    const preview = (i) => $$('rect', svg).forEach(r => r.classList.toggle('is-active', +r.dataset.i === (i ?? active)));

    svg.addEventListener('click', e => { const r = e.target.closest('rect'); if (r) select(+r.dataset.i); });
    svg.addEventListener('mouseover', e => { const r = e.target.closest('rect'); if (r) preview(+r.dataset.i); });
    svg.addEventListener('mouseleave', () => preview(null));
    list.addEventListener('click', e => { const btn = e.target.closest('button'); if (btn) select(+btn.dataset.i); });
    list.addEventListener('mouseover', e => { const btn = e.target.closest('button'); if (btn) preview(+btn.dataset.i); });
    list.addEventListener('mouseleave', () => preview(null));
    select(b.floors.findIndex(f => f.kind === 'residential'));
  });

  /* ---------- 2. Day ↔ dusk slider ---------- */
  $$('.dn').forEach(dn => {
    const range = $('input[type="range"]', dn);
    const set = v => { dn.style.setProperty('--pos', v + '%'); range.value = v; range.setAttribute('aria-valuetext', v > 60 ? 'Mostly dusk' : v < 40 ? 'Mostly day' : 'Half day, half dusk'); };
    range.addEventListener('input', () => set(+range.value));
    // drag anywhere on the image (pointer events — works for mouse and touch)
    let dragging = false;
    const fromEvent = e => { const r = dn.getBoundingClientRect(); set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)).toFixed(1)); };
    dn.addEventListener('pointerdown', e => { if (e.target === range) return; dragging = true; dn.setPointerCapture(e.pointerId); fromEvent(e); });
    dn.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    dn.addEventListener('pointerup', () => { dragging = false; });
    set(50);
    if (!reduced) {
      const io = new IntersectionObserver(en => {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const anim = t => { const p = Math.min(1, (t - t0) / 2200); const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; set((92 - 42 * e).toFixed(1)); if (p < 1 && !dragging) requestAnimationFrame(anim); };
        set(92); requestAnimationFrame(anim);
      }, { threshold: .5 });
      io.observe(dn);
    }
  });

  /* ---------- 3. Video hero (when the client supplies footage) ---------- */
  const hero = $('.hero');
  const v = D.heroVideo;
  if (hero && v && v.mp4 && !reduced && !saveData && window.matchMedia('(min-width: 768px)').matches) {
    const video = document.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'metadata' });
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    if (v.poster) video.poster = v.poster;
    video.className = 'hero__video';
    video.innerHTML = `${v.webm ? `<source src="${v.webm}" type="video/webm">` : ''}<source src="${v.mp4}" type="video/mp4">`;
    video.addEventListener('playing', () => hero.classList.add('has-video'), { once: true });
    $('.hero__slides', hero).appendChild(video);
  }

  /* ---------- 4. Residences: compare all ---------- */
  $$('[data-residences]').forEach(root => {
    const btn = $('[data-compare]', root);
    const panel = $('.res__compare', root);
    if (!btn || !panel) return;
    const draw = () => {
      const dev = D.developments[root.dataset.current || root.dataset.residences || 'isle-ii'];
      const rows = [['Size', r => `${r.sqft.toLocaleString()} sq ft`], ['Bedrooms', r => r.beds], ['Bathrooms', r => r.baths], ['Balcony views', r => r.balconies]];
      panel.innerHTML = `<table class="cmp"><caption class="sr-only">Compare residences at ${dev.name}</caption>
        <thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${dev.residences.map(r => `<th scope="col">${r.plan ? `<img src="${r.plan}" alt="" width="580" height="400" loading="lazy">` : '<span class="cmp__noplan">Plan on request</span>'}<span>${r.name}</span></th>`).join('')}</tr></thead>
        <tbody>${rows.map(([label, fn]) => `<tr><th scope="row">${label}</th>${dev.residences.map(r => `<td>${fn(r)}</td>`).join('')}</tr>`).join('')}
        <tr><th scope="row">Starting from</th><td colspan="3">${dev.startingFrom} <small>(development starting price)</small></td></tr></tbody></table>`;
    };
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      $('.label', btn).textContent = open ? 'Hide comparison' : 'Compare all';
      if (open) draw();
      panel.hidden = !open;
    });
    root.addEventListener('residences:change', () => { if (!panel.hidden) draw(); });
  });

  /* ---------- 5. Horizontal drag strip ---------- */
  $$('.hstrip__track').forEach(track => {
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    const bar = $('.hstrip__progress i', track.parentElement);
    const upd = () => { if (bar) bar.style.transform = `scaleX(${(track.scrollLeft + track.clientWidth) / track.scrollWidth})`; };
    track.addEventListener('scroll', upd, { passive: true }); upd();
    $$('[data-strip]', track.parentElement).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: (b.dataset.strip === 'next' ? 1 : -1) * track.clientWidth * .7, behavior: reduced ? 'auto' : 'smooth' })));
  });

  /* ---------- 6. Custom cursor (fine pointers only) ---------- */
  if (finePointer && !reduced) {
    const c = document.createElement('div');
    c.className = 'cursor'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor__label"></span>';
    document.body.appendChild(c);
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    let raf = 0;
    const loop = () => { cx += (x - cx) * .3; cy += (y - cy) * .3; c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; raf = (Math.abs(x - cx) + Math.abs(y - cy) > .5) ? requestAnimationFrame(loop) : 0; };
    window.addEventListener('pointermove', () => { if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    const label = $('.cursor__label', c);
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor], a, button, .gal__item, .dn, .hstrip__track, [data-full]');
      if (!t) { c.className = 'cursor is-on'; label.textContent = ''; return; }
      const word = t.dataset.cursor || (t.matches('.gal__item, [data-full]') ? 'View' : t.matches('.dn') ? 'Drag' : t.matches('.hstrip__track') ? 'Drag' : '');
      c.className = 'cursor is-on ' + (word ? 'is-label' : 'is-link');
      label.textContent = word;
    });
  }

  /* ---------- 7. Intro loader (first visit per session) ---------- */
  const loader = $('.loader');
  if (loader) {
    if (!document.documentElement.classList.contains('is-loading')) loader.remove();
    else {
      const done = () => { loader.classList.add('is-done'); document.documentElement.classList.remove('is-loading'); setTimeout(() => loader.remove(), 1100); };
      const minTime = new Promise(r => setTimeout(r, 1300));
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      Promise.race([Promise.all([minTime, fonts]), new Promise(r => setTimeout(r, 2400))]).then(done);
    }
  }
})();
