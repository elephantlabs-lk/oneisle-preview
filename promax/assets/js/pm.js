/* One Isle — PRO MAX interactions. Vanilla JS + GSAP/ScrollTrigger (progressive). */
(() => {
  'use strict';
  const D = window.ONEISLE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const reduced = html.classList.contains('no-motion');
  const small = () => window.innerWidth < 900;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const PREVIEW = !/(^|\.)oneisle\.co$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);

  /* ---------- Clock (Asia/Colombo) & year ---------- */
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Colombo' });
  const tick = () => $$('[data-clock]').forEach(el => { el.textContent = fmt.format(new Date()); });
  tick(); setInterval(tick, 15000);
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Header ---------- */
  const hd = $('.hd');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (hd) {
      hd.classList.toggle('is-solid', y > 60);
      if (y > 500 && y > lastY + 6) hd.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 500) hd.classList.remove('is-hidden');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Menu ---------- */
  const mn = $('#mn');
  const openBtn = $('.hd .hd__menu');
  const setMenu = (on) => {
    if (!mn) return;
    mn.classList.toggle('is-open', on);
    mn.setAttribute('aria-hidden', String(!on));
    if (openBtn) openBtn.setAttribute('aria-expanded', String(on));
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) setTimeout(() => $('[data-close]', mn).focus(), 200); else if (openBtn) openBtn.focus({ preventScroll: true });
  };
  if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
  if (mn) {
    $('[data-close]', mn).addEventListener('click', () => setMenu(false));
    mn.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Split headings into masked words ---------- */
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const o = document.createElement('span'); o.className = 'sw';
            const inn = document.createElement('span'); inn.textContent = part; inn.style.setProperty('--i', i++);
            o.appendChild(inn); frag.appendChild(o);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(el);
  };
  const style = document.createElement('style');
  style.textContent = `.sw{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}
  .sw>span{display:inline-block;transform:translateY(105%);transition:transform .85s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i)*35ms)}
  .in .sw>span,.no-motion .sw>span{transform:none}`;
  document.head.appendChild(style);
  $$('[data-split]').forEach(splitWords);

  /* ---------- Reveal on view (cheap, IntersectionObserver) ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.rv, [data-split]').forEach(el => io.observe(el));
  // above-the-fold hero text: animate right away
  requestAnimationFrame(() => $$('.hero [data-split], .ph [data-split], .hero .rv, .ph .rv').forEach(el => el.classList.add('in')));

  /* ---------- Lazy videos: pick size, play only when visible ---------- */
  $$('video[data-src]').forEach(v => {
    const base = v.dataset.src; // e.g. assets/video/hero-palms  (we add -360/-720.mp4)
    const pick = () => `${base}-${(small() || saveData) ? 360 : 720}.mp4`;
    let loaded = false;
    const vio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (!loaded) { v.src = pick(); loaded = true; }
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else if (loaded) v.pause();
    }), { rootMargin: '200px' });
    v.muted = true; v.playsInline = true;
    v.addEventListener('playing', () => v.classList.add('playing'), { once: true });
    if (reduced) return; // posters only for reduced motion
    vio.observe(v);
  });

  /* ---------- Word-by-word statement (scroll scrub) ---------- */
  const scrubWords = $$('[data-words]');
  scrubWords.forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="word">${w}</span>`).join(' ');
  });

  /* ---------- Home: residence cards from data ---------- */
  $$('[data-hz-cards]').forEach(track => {
    const isle = D.developments['isle-ii'], loft = D.developments.loft;
    const end = track.innerHTML;
    track.innerHTML = isle.residences.map((r, i) => {
      const l = loft.residences[i];
      return `<article class="hz__card">
        <div class="hz__plan">${r.plan ? `<img src="../${r.plan}" alt="${r.name} floor plan, One Isle II" loading="lazy" width="580" height="400">` : ''}</div>
        <div class="hz__body">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="lbl lbl--dim">0${i + 1} · Residence</span><span class="lbl" style="color:var(--gold)">${r.beds} Bedrooms</span></div>
          <h3 class="d3">${r.name}</h3>
          <div class="specs"><div><b>${r.sqft.toLocaleString()}</b><span>Sq ft</span></div><div><b>${r.beds}</b><span>Beds</span></div><div><b>${r.baths}</b><span>Baths</span></div><div><b>${r.balconies}</b><span>Balcony</span></div></div>
          <p class="p" style="font-size:13px">One Isle II · ${r.sqft.toLocaleString()} sq ft &nbsp;/&nbsp; One Isle Loft · ${l.sqft.toLocaleString()} sq ft</p>
        </div></article>`;
    }).join('') + end;
  });

  /* ---------- GSAP-powered scenes ---------- */
  const startGsap = () => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || reduced) return false;
    gsap.registerPlugin(ScrollTrigger);

    // hero: content drifts and fades as you leave
    $$('.hero').forEach(h => {
      gsap.to($('.hero__c', h), { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to($('.hero__media', h), { scale: 1.08, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
    });

    // frame expand
    $$('.frame').forEach(f => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      tl.to($('.frame__img', f), { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
        .to($('.frame__img img', f), { scale: 1, ease: 'none' }, 0)
        .to($('.frame__words span:first-child', f), { xPercent: -120, opacity: 0, ease: 'none' }, 0)
        .to($('.frame__words span:last-child', f), { xPercent: 120, opacity: 0, ease: 'none' }, 0)
        .to($('.frame__cap', f), { opacity: 1, duration: .25 }, .75);
    });

    // statement words
    scrubWords.forEach(el => {
      const words = $$('.word', el);
      ScrollTrigger.create({ trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true,
        onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => { w.style.opacity = i < n ? 1 : .16; }); } });
    });

    // scattered rows + floating images
    $$('.scatter').forEach(sc => {
      $$('.scatter__row', sc).forEach((r, i) => gsap.fromTo(r, { xPercent: i % 2 ? 8 : -8 }, { xPercent: i % 2 ? -4 : 4, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: true } }));
      $$('.scatter__img', sc).forEach((im, i) => gsap.fromTo(im, { yPercent: 30 + i * 10 }, { yPercent: -30 - i * 15, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: true } }));
    });

    // stacked panels: image settles as the panel arrives
    $$('.stack__p').forEach(p => gsap.to($('.stack__bg img', p), { scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'top top', scrub: true } }));

    // horizontal residences (desktop only)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      $$('.hz').forEach(sec => {
        const track = $('.hz__track', sec);
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
      });
    });

    // parallax helpers
    $$('[data-px]').forEach(el => gsap.fromTo(el, { yPercent: -(+el.dataset.px || 10) }, { yPercent: +el.dataset.px || 10, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // counters
    $$('[data-count]').forEach(el => {
      const to = +el.dataset.count; const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
    return true;
  };
  if (!startGsap()) {
    // fallback: no GSAP yet → wait for it once, else show everything statically
    let tries = 0;
    const wait = setInterval(() => { if (startGsap() || ++tries > 40) { clearInterval(wait); if (!window.gsap) { html.classList.add('no-motion'); scrubWords.forEach(el => $$('.word', el).forEach(w => (w.style.opacity = 1))); } } }, 100);
  }

  /* ---------- Numbered index (accordion + image) ---------- */
  $$('.idx').forEach(idx => {
    const items = $$('.idx__item', idx), figs = $$('.idx__media figure', idx);
    const set = n => { items.forEach((it, i) => { it.classList.toggle('is-on', i === n); $('.idx__btn', it).setAttribute('aria-expanded', i === n); }); figs.forEach((f, i) => f.classList.toggle('is-on', i === n)); };
    items.forEach((it, i) => { const b = $('.idx__btn', it); b.addEventListener('click', () => set(i)); b.addEventListener('mouseenter', () => { if (!small()) set(i); }); });
    set(0);
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lb');
  let lbItems = [], lbI = 0, lbRet = null;
  const lbShow = () => {
    const it = lbItems[lbI]; const img = $('.lb__stage img', lb);
    img.src = it.src; img.alt = it.cap || ''; img.style.background = it.plan ? 'var(--sand)' : ''; img.style.padding = it.plan ? '3%' : '';
    $('[data-lb-cap]', lb).textContent = it.cap || '';
    $('[data-lb-count]', lb).textContent = `${String(lbI + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
  };
  const lbOpen = (items, i) => { if (!lb) return; lbItems = items; lbI = i; lbRet = document.activeElement; lbShow(); lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('[data-lb-close]', lb).focus(); };
  const lbClose = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lbRet) lbRet.focus({ preventScroll: true }); };
  if (lb) {
    const step = d => { lbI = (lbI + d + lbItems.length) % lbItems.length; lbShow(); };
    $('[data-lb-close]', lb).addEventListener('click', lbClose);
    $('[data-lb-prev]', lb).addEventListener('click', () => step(-1));
    $('[data-lb-next]', lb).addEventListener('click', () => step(1));
    lb.addEventListener('keydown', e => { if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  }
  $$('[data-gallery]').forEach(g => {
    const figs = $$('[data-full]', g);
    let down = false, sx = 0, sl = 0, moved = false;
    g.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = g.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; if (Math.abs(e.clientX - sx) > 4) moved = true; g.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', () => { down = false; });
    figs.forEach((f, i) => f.addEventListener('click', () => { if (moved) return; lbOpen(figs.map(x => ({ src: x.dataset.full, cap: x.dataset.cap })), i); }));
  });

  /* ---------- Building selector ---------- */
  $$('[data-building]').forEach(root => {
    const key = root.dataset.building, b = D.building && D.building[key], dev = D.developments[key];
    if (!b) return;
    const svg = $('.bs__svg', root), list = $('.bs__floors', root), det = $('.bs__detail', root), NS = 'http://www.w3.org/2000/svg';
    // Drawn elevation (no photo): geometry in a 100 x 150 viewBox
    const drawn = !!$('[data-drawn]', root);
    const GEO = { roof: [18, 34], l7: [34, 48], l6: [48, 62], l5: [62, 76], l4: [76, 90], l3: [90, 104], l2: [104, 116], l1: [116, 128], g: [128, 146] };
    const X = drawn ? [22, 78] : b.x;
    if (drawn) {
      const L = (x1, y1, x2, y2, w = .35, o = .55) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#F4EEE6" stroke-opacity="${o}" stroke-width="${w}"/>`;
      let g = `<rect x="22" y="34" width="56" height="112" fill="#1E1714" stroke="#F4EEE6" stroke-opacity=".7" stroke-width=".45"/>`;
      // rooftop: pergola + planting
      g += `<rect x="30" y="24" width="40" height="10" fill="none" stroke="#C4A77D" stroke-opacity=".8" stroke-width=".35"/>`;
      for (let x = 32; x <= 68; x += 4) g += L(x, 24, x, 34, .25, .45);
      g += L(26, 24, 74, 24, .4, .7);
      [27, 72].forEach(cx => { g += `<circle cx="${cx}" cy="31" r="3" fill="#6E7F5E" fill-opacity=".55"/>`; });
      // residential floors: 3 bays with windows + balcony rails
      ['l7', 'l6', 'l5', 'l4', 'l3'].forEach(id => {
        const [y0, y1] = GEO[id];
        g += L(22, y1, 78, y1, .35, .5);
        [25, 43, 61].forEach(x => {
          g += `<rect x="${x + 2}" y="${y0 + 2.5}" width="11" height="${y1 - y0 - 5}" fill="#C4A77D" fill-opacity=".16" stroke="#F4EEE6" stroke-opacity=".35" stroke-width=".25"/>`;
          g += L(x, y1 - 2.6, x + 15, y1 - 2.6, .3, .6);
          for (let k = x + 1.5; k < x + 15; k += 1.6) g += L(k, y1 - 2.6, k, y1, .12, .45);
        });
        g += `<rect x="41" y="${y0}" width="1.4" height="${y1 - y0}" fill="#F4EEE6" fill-opacity=".18"/>`;
      });
      // podium: vertical fins
      g += L(22, 116, 78, 116, .35, .5); g += L(22, 128, 78, 128, .45, .6);
      for (let x = 25; x < 78; x += 3.2) g += L(x, 105, x, 127, .2, .35);
      // ground: columns + entrance
      [24, 38, 62, 76].forEach(x => { g += `<rect x="${x - 1}" y="128" width="2" height="18" fill="#C4A77D" fill-opacity=".55"/>`; });
      g += `<rect x="44" y="134" width="12" height="12" fill="#C4A77D" fill-opacity=".25" stroke="#C4A77D" stroke-opacity=".7" stroke-width=".3"/>`;
      g += L(10, 146, 90, 146, .5, .6);
      svg.innerHTML = g;
    }
    b.floors.forEach((f, i) => {
      const y = drawn ? GEO[f.id] : f.y;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', X[0]); r.setAttribute('width', X[1] - X[0]); r.setAttribute('y', y[0]); r.setAttribute('height', y[1] - y[0]); r.dataset.i = i;
      if (drawn) r.setAttribute('x', 16), r.setAttribute('width', 68);
      svg.appendChild(r);
      list.insertAdjacentHTML('beforeend', `<li><button type="button" aria-pressed="false" data-i="${i}">${f.label}</button></li>`);
    });
    const sel = i => {
      const f = b.floors[i];
      $$('rect', svg).forEach(r => r.classList.toggle('on', +r.dataset.i === i));
      $$('button', list).forEach(x => x.setAttribute('aria-pressed', +x.dataset.i === i));
      const kind = f.kind === 'residential' ? 'Residential level' : f.kind === 'podium' ? 'Podium' : 'Amenity';
      let body = f.kind === 'residential'
        ? ((f.units && f.units.length)
            ? `<ul class="rows">${f.units.map(u => { const r = dev.residences.find(x => x.id === u.type) || {}; return `<li><span>${u.no} · ${r.name || ''}</span><span>${u.status}</span></li>`; }).join('')}</ul>`
            : `<p>The unit schedule for ${f.label.toLowerCase()} will be published soon — ask us for live availability. Residence types at ${dev.name}:</p>
               <ul class="rows">${dev.residences.map(r => `<li><span>${r.name}</span><span>${r.beds} Bed · ${r.baths} Bath · ${r.sqft.toLocaleString()} sq ft</span></li>`).join('')}</ul>`)
          + `<a class="pill" href="contact.html?dev=${key}&note=${encodeURIComponent(`I'm interested in a residence on ${f.label} of ${dev.name}.`)}">Enquire about ${f.label}</a>`
        : `<p>${f.note || ''}</p>`;
      det.innerHTML = `<span class="lbl" style="color:var(--gold)">${dev.name} · ${kind}</span><h3>${f.label}</h3>${body}`;
    };
    svg.addEventListener('click', e => { const r = e.target.closest('rect'); if (r) sel(+r.dataset.i); });
    list.addEventListener('click', e => { const x = e.target.closest('button'); if (x) sel(+x.dataset.i); });
    sel(b.floors.findIndex(f => f.kind === 'residential'));
  });

  /* ---------- Day / dusk ---------- */
  $$('.dn').forEach(dn => {
    const r = $('input', dn);
    const set = v => { dn.style.setProperty('--pos', v + '%'); r.value = v; };
    r.addEventListener('input', () => set(+r.value));
    set(50);
    if (!reduced) {
      const o = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; o.disconnect(); const t0 = performance.now(); const a = t => { const p = Math.min(1, (t - t0) / 1800); set((90 - 40 * (1 - Math.pow(1 - p, 3))).toFixed(1)); if (p < 1) requestAnimationFrame(a); }; requestAnimationFrame(a); }, { threshold: .5 });
      o.observe(dn);
    }
  });

  /* ---------- Residences explorer ---------- */
  $$('[data-rx]').forEach(root => {
    let dev = root.dataset.rx || 'isle-ii', idx = 0;
    const types = $('.rx__types', root), stage = $('.rx__stage', root), price = $('[data-price]', root), specs = $('.specs', root), cmp = $('.rx__cmp', root);
    const draw = () => {
      const d = D.developments[dev];
      types.innerHTML = d.residences.map((r, i) => `<li><button type="button" role="tab" aria-selected="${i === idx}" data-i="${i}"><span class="n">0${i + 1}</span><span class="t">${r.name}</span><span class="s">${r.beds} Bed</span></button></li>`).join('');
      $$('.rx__plan', stage).forEach(p => p.remove());
      d.residences.forEach((r, i) => stage.insertAdjacentHTML('beforeend', `<div class="rx__plan${i === idx ? ' on' : ''}">${r.plan ? `<img src="../${r.plan}" alt="${r.name} floor plan, ${d.name}" width="580" height="400">` : `<div class="rx__ph"><strong>Plan on request</strong>The ${r.name} plan for ${d.name} will be published soon.<br><small>[Client to supply plan artwork]</small></div>`}</div>`));
      if (price) price.textContent = d.startingFrom;
      if (cmp) cmp.innerHTML = `<table class="cmp"><thead><tr><th><span class="sr-only">Feature</span></th>${d.residences.map(r => `<th>${r.plan ? `<img src="../${r.plan}" alt="" loading="lazy">` : ''}${r.name}</th>`).join('')}</tr></thead><tbody>
        ${[['Size', r => r.sqft.toLocaleString() + ' sq ft'], ['Bedrooms', r => r.beds], ['Bathrooms', r => r.baths], ['Balcony views', r => r.balconies]].map(([l, f]) => `<tr><th>${l}</th>${d.residences.map(r => `<td>${f(r)}</td>`).join('')}</tr>`).join('')}
        <tr><th>Starting from</th><td colspan="3">${d.startingFrom}</td></tr></tbody></table>`;
      pick(idx);
    };
    const pick = i => {
      const d = D.developments[dev], r = d.residences[i]; idx = i;
      $$('button', types).forEach((b, j) => b.setAttribute('aria-selected', j === i));
      $$('.rx__plan', stage).forEach((p, j) => p.classList.toggle('on', j === i));
      specs.innerHTML = `<div><b>${r.sqft.toLocaleString()}</b><span>Sq ft</span></div><div><b>${r.beds}</b><span>Bedrooms</span></div><div><b>${r.baths}</b><span>Bathrooms</span></div><div><b>${r.balconies}</b><span>Balcony views</span></div>`;
      $('.rx__lbl', stage).textContent = `${d.name} — ${r.name}`;
      const tools = $('.rx__tools', stage);
      tools.style.display = r.plan ? '' : 'none';
      if (r.plan) { $('a', tools).href = '../' + r.plan; $('a', tools).setAttribute('download', `${d.name}-${r.name}-floor-plan.png`.replace(/\s+/g, '-')); }
      const enq = $('[data-rx-enquire]', root); if (enq) enq.href = `contact.html?dev=${dev}&res=${r.id}`;
    };
    types.addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
    $$('.seg button', root).forEach(b => b.addEventListener('click', () => { $$('.seg button', root).forEach(x => x.setAttribute('aria-selected', x === b)); dev = b.dataset.dev; idx = 0; draw(); }));
    const zoom = $('.rx__tools button', stage);
    if (zoom) zoom.addEventListener('click', () => { const d = D.developments[dev], r = d.residences[idx]; lbOpen([{ src: '../' + r.plan, cap: `${d.name} — ${r.name}`, plan: true }], 0); });
    draw();
  });

  /* ---------- Map ---------- */
  const mapEl = $('#map');
  if (mapEl && D.map) {
    const list = $('.places');
    if (list) list.innerHTML = D.map.places.map((p, i) => `<li><button type="button" data-i="${i}"><span class="c">${p.cat}</span><span class="t">${p.name}</span></button><a href="${p.url}" target="_blank" rel="noopener">Directions</a></li>`).join('');
    const go = () => {
      const L = window.L; if (!L) return;
      const map = L.map(mapEl, { scrollWheelZoom: false }).setView([6.856, 79.907], 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
      const ic = c => L.divIcon({ className: '', html: `<div class="pin ${c}"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
      D.map.developments.forEach(d => L.marker([d.lat, d.lng], { icon: ic('pin--dev'), keyboard: false }).addTo(map).bindTooltip(d.name, { className: 'tip', permanent: true, direction: 'top', offset: [0, -12] }));
      const ms = D.map.places.map(p => L.marker([p.lat, p.lng], { icon: ic(''), title: p.name }).addTo(map).bindTooltip(p.name, { className: 'tip', direction: 'top', offset: [0, -8] }));
      map.fitBounds(L.featureGroup(ms).getBounds().pad(.15));
      if (list) list.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const m = ms[+b.dataset.i]; map.flyTo(m.getLatLng(), 16, { duration: .9 }); m.openTooltip(); $$('.pin', mapEl).forEach(p => p.classList.remove('on')); const el = m.getElement() && m.getElement().querySelector('.pin'); if (el) el.classList.add('on'); });
    };
    const mo = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; mo.disconnect();
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = go; document.head.appendChild(s); }, { rootMargin: '500px' });
    mo.observe(mapEl);
  }

  /* ---------- Enquiry form (existing Contact Form 7 backend) ---------- */
  const submitCF7 = async (formId, unit, fields) => {
    const fd = new FormData();
    Object.entries({ _wpcf7: formId, _wpcf7_version: '6.2.4.1', _wpcf7_locale: 'en_US', _wpcf7_unit_tag: unit, _wpcf7_container_post: '0', _wpcf7_recaptcha_response: '' }).forEach(([k, v]) => fd.append(k, v));
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    const r = await fetch(`${D.backend.base}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`, { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.status === 'mail_sent';
  };
  const form = $('#enquiry');
  if (form) {
    const el = form.elements, q = new URLSearchParams(location.search);
    const fill = () => {
      const devs = el.development.value ? [el.development.value] : Object.keys(D.developments);
      const keep = el.configuration.value, seen = new Set();
      el.configuration.innerHTML = '<option value="">No preference</option>' + devs.flatMap(k => D.developments[k].residences).filter(r => !seen.has(r.id) && seen.add(r.id)).map(r => `<option value="${r.id}">${r.name} — ${r.beds} bed</option>`).join('');
      el.configuration.value = keep;
    };
    fill(); el.development.addEventListener('change', fill);
    if (q.get('dev')) { el.development.value = q.get('dev'); fill(); }
    if (q.get('res')) el.configuration.value = q.get('res');
    if (q.get('note')) el.message.value = q.get('note');
    const t = new Date(); t.setDate(t.getDate() + 1); el.date.min = t.toISOString().slice(0, 10);
    const st = $('.status', form);
    const err = (n, m) => { const f = el[n].closest('.fld'); f.classList.toggle('bad', !!m); $('.err', f).textContent = m || ''; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      if (!el.name.value.trim()) { err('name', 'Please tell us your name.'); ok = false; } else err('name');
      if (!/^[+()\d\s-]{7,}$/.test(el.phone.value.trim())) { err('phone', 'Please enter a valid phone number.'); ok = false; } else err('phone');
      if (el.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.email.value)) { err('email', 'Please check your email.'); ok = false; } else err('email');
      if (!ok) return;
      st.classList.add('on');
      if (PREVIEW) { st.innerHTML = '<strong>Preview only — this request was not sent.</strong> On the live site (oneisle.co) it goes straight to the One Isle sales team.'; return; }
      const devName = el.development.value ? D.developments[el.development.value].name : 'No preference';
      const msg = `Preferred development: ${devName}\nPreferred configuration: ${el.configuration.options[el.configuration.selectedIndex].text}\n\n${el.message.value}`;
      let sent = false;
      try { sent = await submitCF7(D.backend.viewingFormId, 'wpcf7-f1149-o1', { 'full-name': el.name.value, number: el.phone.value, 'your-email': el.email.value, 'date-270': el.date.value, 'menu-429': el.time.value, 'your-message': msg }); } catch (_) {}
      st.innerHTML = sent ? `<strong>Thank you.</strong> Your viewing request has been received — we'll be in touch shortly.`
        : `We couldn't send this just now. Please <a href="${D.contact.whatsapp}?text=${encodeURIComponent('Hello One Isle, I would like to schedule a viewing.\n' + msg)}" target="_blank" rel="noopener">message us on WhatsApp</a> or call ${D.contact.phone}.`;
      if (sent) form.reset();
    });
  }
  $$('.news').forEach(n => n.addEventListener('submit', async e => {
    e.preventDefault(); const m = n.nextElementSibling, v = $('input', n).value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { m.textContent = 'Please enter a valid email.'; return; }
    if (PREVIEW) { m.textContent = 'Preview only — not subscribed. Works on the live site.'; return; }
    let ok = false; try { ok = await submitCF7(D.backend.newsletterFormId, 'wpcf7-f719-o2', { 'your-email': v }); } catch (_) {}
    m.textContent = ok ? 'Thank you — you are on the list.' : `Sorry, please email ${D.contact.email}.`;
  }));


  /* ---------- Scroll-scrubbed frame sequences ("video scrub") ----------
     <div data-scrub="assets/frames/NAME" data-frames="72" [data-track="selector"]> … </div>
     Frames load coarse → fine (step by step), so it works almost at once and sharpens as it loads. */
  $$('[data-scrub]').forEach(box => {
    const base = box.dataset.scrub, count = +box.dataset.frames || 1;
    const set = (window.innerWidth < 700 || saveData) ? 'm' : 'd';
    const track = box.dataset.track ? box.closest(box.dataset.track) : box;
    const cv = document.createElement('canvas'); cv.className = 'scrub__cv'; cv.setAttribute('aria-hidden', 'true');
    box.prepend(cv);
    const bar = document.createElement('div'); bar.className = 'scrub__load'; bar.innerHTML = '<i></i>';
    box.appendChild(bar);
    const ctx = cv.getContext('2d');
    const frames = new Array(count);
    let loaded = 0, cur = 0, target = 0, running = false, started = false, lastDrawn = -1;
    const url = i => `${base}/${set}/${String(i).padStart(3, '0')}.webp`;
    // coarse → fine order: 0, last, then every 16th, 8th, 4th, 2nd, 1st
    const order = []; const seen = new Set();
    const push = i => { if (i >= 0 && i < count && !seen.has(i)) { seen.add(i); order.push(i); } };
    push(0); push(count - 1);
    [16, 8, 4, 2, 1].forEach(step => { for (let i = 0; i < count; i += step) push(i); });
    const nearest = i => { if (frames[i]) return frames[i]; for (let d = 1; d < count; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; };
    const size = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const r = box.getBoundingClientRect(); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); lastDrawn = -1; draw(true); };
    const draw = (force) => {
      const i = Math.round(cur); const img = nearest(i);
      if (!img || (!force && i === lastDrawn && img.__drawn)) return;
      const cw = cv.width, ch = cv.height, s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      img.__drawn = true; lastDrawn = i;
      if (!cv.classList.contains('ready')) cv.classList.add('ready');
    };
    const progress = () => {
      const r = track.getBoundingClientRect(), vh = window.innerHeight;
      const span = Math.max(1, r.height - vh);
      return Math.min(1, Math.max(0, -r.top / span));
    };
    const loop = () => {
      target = progress() * (count - 1);
      cur += (target - cur) * 0.22;
      if (Math.abs(target - cur) < 0.05) cur = target;
      draw();
      box.dispatchEvent(new CustomEvent('scrub', { detail: cur / (count - 1) }));
      if (running) requestAnimationFrame(loop);
    };
    const load = () => {
      if (started) return; started = true;
      let k = 0; const MAX = 6; let inflight = 0;
      const next = () => {
        while (inflight < MAX && k < order.length) {
          const i = order[k++]; inflight++;
          const im = new Image(); im.decoding = 'async';
          im.onload = () => { frames[i] = im; loaded++; inflight--; bar.firstChild.style.transform = `scaleX(${loaded / count})`; if (loaded === count) bar.classList.add('done'); if (Math.abs(i - Math.round(cur)) < 3 || loaded < 3) draw(true); next(); };
          im.onerror = () => { inflight--; next(); };
          im.src = url(i);
        }
      };
      next();
    };
    if (reduced) { const im = new Image(); im.onload = () => { frames[count - 1] = im; cur = count - 1; size(); }; im.src = url(count - 1); bar.remove(); return; }
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { load(); if (!running) { running = true; size(); requestAnimationFrame(loop); } }
      else running = false;
    }), { rootMargin: '120% 0px' }).observe(track);
    window.addEventListener('resize', size);
  });

  /* captions that follow a scrub's progress: <p data-at="0-0.45"> */
  $$('[data-scrub]').forEach(box => {
    const caps = $$('[data-at]', box.closest('.reveal-s') || box);
    const num = $('[data-scrub-num]', box.closest('.reveal-s') || box);
    if (!caps.length && !num) return;
    box.addEventListener('scrub', e => {
      const p = e.detail;
      caps.forEach(c => { const [a, b] = c.dataset.at.split('-').map(Number); c.classList.toggle('off', !(p >= a && p <= b)); });
      if (num) num.textContent = String(Math.round(p * 100)).padStart(3, '0');
    });
  });


  /* ---------- Tag every stock image / stock sequence as illustrative ---------- */
  const tagIll = (host) => {
    if (!host || $(':scope > .tag-ill', host)) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const t = document.createElement('span'); t.className = 'tag-ill'; t.textContent = 'Illustrative'; host.appendChild(t);
  };
  $$('img[src*="assets/stock/"]').forEach(img => { if (!img.closest('.lb') && !img.closest('[data-scrub]')) tagIll(img.parentElement); });
  $$('[data-scrub]').forEach(box => tagIll(box));

  /* ---------- Fast page changes ---------- */
  const internal = a => a && a.href && a.origin === location.origin && /\.html$|\/$/.test(a.pathname) && a.pathname !== location.pathname && !a.hasAttribute('download') && a.target !== '_blank';
  const pages = [...new Set($$('a[href]').filter(internal).map(a => a.href.split('#')[0]))];
  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const s = document.createElement('script'); s.type = 'speculationrules';
    s.textContent = JSON.stringify({ prerender: [{ urls: pages, eagerness: 'moderate' }] });
    document.head.appendChild(s);
  }
  const got = new Set();
  const pf = h => { h = h.split('#')[0]; if (got.has(h)) return; got.add(h); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = h; document.head.appendChild(l); };
  ['pointerenter', 'touchstart', 'focusin'].forEach(ev => document.addEventListener(ev, e => { const a = e.target.closest && e.target.closest('a[href]'); if (internal(a)) pf(a.href); }, { passive: true, capture: true }));
  if (openBtn) openBtn.addEventListener('click', () => $$('#mn a[href]').filter(internal).forEach(a => pf(a.href)));
  document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (internal(a) && !e.metaKey && !e.ctrlKey && !e.shiftKey) html.classList.add('is-nav'); });
  window.addEventListener('pageshow', () => html.classList.remove('is-nav'));
})();
