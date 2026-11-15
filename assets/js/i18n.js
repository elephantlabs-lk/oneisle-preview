/* One Isle — English / Sinhala switch.
 * Translates navigation, headlines, buttons, labels and form fields.
 * Sinhala copy is a PREVIEW — must be reviewed by a native speaker before launch.
 * To add or correct a phrase, edit SI below (key = the English text; " / " separates headline lines).
 */
(() => {
  'use strict';
  const SI = {
    'Home': 'මුල් පිටුව', 'Developments': 'ව්‍යාපෘති', 'Residences': 'නිවාස', 'Architecture': 'ගෘහ නිර්මාණය',
    'Amenities': 'පහසුකම්', 'Sustainability': 'තිරසාරත්වය', 'Location': 'පිහිටීම', 'Contact': 'සම්බන්ධ වන්න',
    'Menu': 'මෙනුව', 'Close': 'වසන්න', 'Enquire': 'විමසන්න',
    'Responsibly Crafted. / Timeless Elegance.': 'වගකීමෙන් නිර්මිත.<br><em>කාලාතීත අලංකාරය.</em>',
    'Discover a more thoughtful way of living with One Isle Residencies.': 'One Isle Residencies සමඟින් වඩාත් අර්ථවත් ජීවන රටාවක් සොයා ගන්න.',
    'Explore Residences': 'නිවාස ගවේෂණය කරන්න', 'Schedule a Viewing': 'නැරඹීමක් වෙන් කරන්න',
    'The One Isle Blueprint': 'One Isle සැලැස්ම', 'Architecture & Design': 'ගෘහ නිර්මාණය සහ සැලසුම',
    'Residences & Floor Plans': 'නිවාස සහ බිම් සැලසුම්', 'Amenities & Lifestyle': 'පහසුකම් සහ ජීවන රටාව',
    'Sustainable Living': 'තිරසාර ජීවනය', 'Location & Neighbourhood': 'පිහිටීම සහ අවට පරිසරය', 'Gallery': 'ඡායාරූප',
    'Private Viewings': 'පෞද්ගලික නැරඹීම්', 'Materials & Finishes': 'ද්‍රව්‍ය සහ නිමාව',
    'Explore the Building': 'ගොඩනැගිල්ල ගවේෂණය කරන්න', 'Day to Dusk': 'දහවල සිට සැන්දෑව දක්වා',
    'More Than a Residence. / A Better Way of Living.': 'නිවසකට වඩා වැඩි යමක්.<br><em>වඩා හොඳ ජීවන රටාවක්.</em>',
    'Two addresses. / One standard.': 'ලිපින දෙකක්.<br><em>එකම ප්‍රමිතියක්.</em>',
    'Designed Around / the Way You Live.': 'ඔබේ ජීවන රටාවට<br><em>ගැළපෙන සේ නිර්මිතයි.</em>',
    'Quality you / can feel.': 'ඔබට දැනෙන<br><em>ගුණාත්මකභාවය.</em>',
    'Explore your / future living space.': 'ඔබේ අනාගත නිවස<br><em>ගවේෂණය කරන්න.</em>',
    'Choose your / residence.': 'ඔබේ නිවස<br><em>තෝරා ගන්න.</em>',
    'Elevate your / everyday.': 'ඔබේ එදිනෙදා ජීවිතය<br><em>ඉහළ නංවන්න.</em>',
    'Building a / Greener Future.': 'හරිත අනාගතයක්<br><em>ගොඩනඟමු.</em>',
    'Cool, calm / & connected.': 'සිසිල්, සන්සුන්<br><em>සහ පහසු.</em>',
    'Light, line / & material.': 'ආලෝකය, රේඛාව<br><em>සහ ද්‍රව්‍ය.</em>',
    'Your Next Chapter / Starts Here.': 'ඔබේ නව පරිච්ඡේදය<br><em>මෙතැනින් ඇරඹේ.</em>',
    'Eight floors, / one address.': 'මහල් අටක්,<br><em>එක් ලිපිනයක්.</em>',
    'Explore One Isle II': 'One Isle II ගවේෂණය කරන්න', 'Explore One Isle Loft': 'One Isle Loft ගවේෂණය කරන්න',
    'Register Interest': 'උනන්දුව ලියාපදිංචි කරන්න', 'View Brochure': 'පත්‍රිකාව බලන්න', 'Compare all': 'සියල්ල සසඳන්න',
    'Schedule a Private Viewing': 'පෞද්ගලික නැරඹීමක් වෙන් කරන්න', 'Our story': 'අපේ කතාව',
    'Starting from': 'ආරම්භක මිල', 'Floors': 'මහල්', 'Parking spots': 'වාහන නැවතුම්', 'Vehicle parking': 'වාහන නැවතුම්',
    'Backup power': 'උපස්ථ විදුලිය', 'Sq ft': 'වර්ග අඩි', 'Bedrooms': 'නිදන කාමර', 'Bathrooms': 'නාන කාමර', 'Balcony views': 'බැල්කනි',
    'Full name *': 'සම්පූර්ණ නම *', 'Phone number *': 'දුරකථන අංකය *', 'Email': 'විද්‍යුත් තැපෑල',
    'Preferred development': 'කැමති ව්‍යාපෘතිය', 'Preferred configuration': 'කැමති නිවාස වර්ගය',
    'Preferred viewing date': 'නැරඹීමට කැමති දිනය', 'Preferred time': 'කැමති වේලාව', 'Message': 'පණිවිඩය',
    'Company': 'සමාගම', 'Visit': 'අප වෙත පැමිණෙන්න', 'Newsletter': 'පුවත් ලිපිය'
  };
  const SEL = '.menu__list a, .menu-trigger .label, .menu-close > span:last-child, .btn .label, .link, .eyebrow, .lines, .hero__row p, .field label, .footer h4, .stat__label, .res__specs span, .dev__price small, .res__price small';
  const html = document.documentElement;
  const clean = s => s.replace(/\s+/g, ' ').trim();
  const keyOf = el => {
    if (el.classList.contains('lines')) return Array.from(el.querySelectorAll('.line')).map(l => clean(l.textContent)).join(' / ');
    const c = el.cloneNode(true);
    c.querySelectorAll('.num, .arrow, .sr-only').forEach(n => n.remove());
    return clean(c.textContent);
  };
  const setLines = (el, h) => { el.innerHTML = h.split(/<br\s*\/?>/i).map(p => `<span class="line"><span>${p.trim()}</span></span>`).join(''); };

  let fontsLoaded = false;
  const loadFonts = () => {
    if (fontsLoaded) return; fontsLoaded = true;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600&family=Noto+Serif+Sinhala:wght@300;400&display=swap';
    document.head.appendChild(l);
  };

  function apply(lang) {
    if (lang === 'si') loadFonts();
    html.lang = lang;
    document.querySelectorAll(SEL).forEach(el => {
      if (!el.dataset.en) { el.dataset.en = el.innerHTML; el.dataset.key = keyOf(el); }
      if (lang === 'en') { el.innerHTML = el.dataset.en; return; }
      const t = SI[el.dataset.key];
      if (!t) return;
      if (el.classList.contains('lines')) setLines(el, t);
      else if (el.querySelector('.num')) el.innerHTML = el.querySelector('.num').outerHTML + ' ' + t;
      else el.innerHTML = t;
    });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    try { localStorage.setItem('oi-lang', lang); } catch (_) {}
    window.dispatchEvent(new Event('resize')); // re-measure toggles etc.
  }

  // preview notice
  const note = document.createElement('div');
  note.className = 'i18n-note'; note.setAttribute('role', 'note'); note.lang = 'en';
  note.innerHTML = 'Sinhala preview — translation pending native-speaker review. <button type="button" style="margin-left:8px;text-decoration:underline">OK</button>';
  note.querySelector('button').addEventListener('click', () => note.remove());
  document.body.appendChild(note);

  document.addEventListener('click', e => { const b = e.target.closest('.lang button'); if (b) apply(b.dataset.lang); });
  if (html.lang === 'si') apply('si');
})();
