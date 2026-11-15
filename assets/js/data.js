/*
 * One Isle — site content & integration config.
 * Every figure here is taken from the live site (oneisle.co, audited 15 Nov 2026).
 * Items marked CLIENT-CONFIRM conflict between pages of the old site or are missing —
 * see CONTENT-AUDIT.md before launch.
 */
window.ONEISLE = {
  contact: {
    phone: '+94 74 334 4389',
    phoneHref: 'tel:+94743344389',
    whatsapp: 'https://wa.me/94743344389',
    email: 'info@oneisle.co',
    address: '86/7C, Kapuwatta Lane, School Road, Nugegoda 10250',
    hours: 'Monday – Saturday, 8 AM – 5 PM · Sunday closed',
    brochure: 'https://online.anyflip.com/exhjb/bpls/mobile/index.html'
  },

  /* Existing Contact Form 7 forms on the WordPress site.
     Posting works when this site is served from oneisle.co (same origin) —
     reCAPTCHA v3 is enabled on the form and its key is locked to that domain. */
  backend: {
    base: 'https://oneisle.co',
    viewingFormId: 1149,     // "Schedule your visit" form
    newsletterFormId: 719,   // footer newsletter form
    recaptchaSiteKey: '6LdahP4qAAAAANR4f4aTmgnI_gAxZTwDVy8dkctC'
  },

  developments: {
    'isle-ii': {
      name: 'One Isle II',
      location: 'Wijerama, Nugegoda 10250',
      startingFrom: 'LKR 35 million++',      // CLIENT-CONFIRM: development page says LKR 32 million++
      residences: [
        { id: 'modern-oasis',     name: 'Modern Oasis',     sqft: 995,  beds: 2, baths: 2, balconies: 1, plan: 'assets/plans/Modern.png' },   // CLIENT-CONFIRM baths (detail copy says 1)
        { id: 'tranquil-comfort', name: 'Tranquil Comfort', sqft: 1305, beds: 3, baths: 2, balconies: 2, plan: 'assets/plans/Tranquil-1.png' }, // CLIENT-CONFIRM beds (detail copy says 2)
        { id: 'solaris-suite',    name: 'Solaris Suite',    sqft: 1405, beds: 3, baths: 3, balconies: 2, plan: 'assets/plans/Solaris.png' }
      ]
    },
    'loft': {
      name: 'One Isle Loft',
      location: '86/7C, Kapuwatta Lane, School Road, Nugegoda 10250',
      startingFrom: 'LKR 27 million++',
      residences: [
        { id: 'modern-oasis',     name: 'Modern Oasis',     sqft: 980,  beds: 2, baths: 1, balconies: 1, plan: null },
        { id: 'tranquil-comfort', name: 'Tranquil Comfort', sqft: 1109, beds: 3, baths: 2, balconies: 2, plan: null }, // CLIENT-CONFIRM beds (detail copy says 2)
        { id: 'solaris-suite',    name: 'Solaris Suite',    sqft: 1262, beds: 3, baths: 3, balconies: 2, plan: null }
      ]
    }
  },

  /* Hero video — CLIENT TO SUPPLY. Set to e.g. { mp4: 'assets/video/hero.mp4', poster: 'assets/img/isle2-exterior-night-1920.jpg' }
     When set, the home hero plays it (desktop, no reduced-motion, no data-saver) instead of the photo slideshow. */
  heroVideo: null,

  /* One Isle II building selector — floor bands traced on assets/img/isle2-facade-portrait (percent of image).
     8 floors per the live site. Per-floor unit schedule & availability are CLIENT-CONFIRM:
     fill `units` like [{ no: '3A', type: 'modern-oasis', status: 'available' | 'reserved' | 'sold' }]. */
  building: {
    'isle-ii': {
      image: 'assets/img/isle2-facade-portrait',
      x: [14.4, 66.4],
      floors: [
        { id: 'roof', label: 'Rooftop',        kind: 'amenity',     y: [16.0, 25.6], note: 'Scenic rooftop with panoramic views.' },
        { id: 'l7',   label: 'Level 7',        kind: 'residential', y: [27.8, 34.4], units: [] },
        { id: 'l6',   label: 'Level 6',        kind: 'residential', y: [34.4, 40.9], units: [] },
        { id: 'l5',   label: 'Level 5',        kind: 'residential', y: [40.9, 47.4], units: [] },
        { id: 'l4',   label: 'Level 4',        kind: 'residential', y: [47.4, 54.2], units: [] },
        { id: 'l3',   label: 'Level 3',        kind: 'residential', y: [54.2, 61.3], units: [] },
        { id: 'l2',   label: 'Level 2',        kind: 'podium',      y: [61.3, 68.4], note: 'Podium level — use to be confirmed.' },
        { id: 'l1',   label: 'Level 1',        kind: 'podium',      y: [68.4, 75.5], note: 'Podium level — use to be confirmed.' },
        { id: 'g',    label: 'Ground',         kind: 'amenity',     y: [75.5, 86.4], note: 'Entrance and dedicated parking, behind an automated security gate.' }
      ]
    }
  },

  /* Neighbourhood — names & coordinates resolved from the Google Maps links on the live site. */
  map: {
    developments: [
      // CLIENT-CONFIRM: exact pins not published on the old site — approximate positions.
      { name: 'One Isle II', sub: 'Wijerama, Nugegoda', lat: 6.8566, lng: 79.9088 },
      { name: 'One Isle Loft', sub: 'Kapuwatta Lane, Nugegoda', lat: 6.8590, lng: 79.9050 }
    ],
    places: [
      { cat: 'Education',  name: 'University of Sri Jayewardenepura', lat: 6.852767,  lng: 79.9035846, url: 'https://maps.app.goo.gl/fgvPFvyLatjX36Fv9' },
      { cat: 'Shopping',   name: 'Keells – Wijerama',                 lat: 6.8575778, lng: 79.9081649, url: 'https://maps.app.goo.gl/jqKLUqvhUPtk6mqz7' },
      { cat: 'Shopping',   name: 'Cargills Food City – Wijerama',     lat: 6.8571459, lng: 79.9100705, url: 'https://maps.app.goo.gl/JYB5ryqvBQuQ6MRM7' },
      { cat: 'Shopping',   name: 'Arpico Super Centre – Nawinna',     lat: 6.8529935, lng: 79.916691,  url: 'https://maps.app.goo.gl/hLCPRPWTDDU62CdB9' },
      { cat: 'Healthcare', name: 'Nawinna Medicare Hospitals',        lat: 6.8551868, lng: 79.9140114, url: 'https://maps.app.goo.gl/JUvdHeJNAGR7LUq98' },
      { cat: 'Dining',     name: 'BOO Café & Restaurant',             lat: 6.8568545, lng: 79.9075723, url: 'https://maps.app.goo.gl/N1smrmUH8kMZ6Kd28' },
      { cat: 'Recreation', name: 'Fingara Club',                      lat: 6.8513875, lng: 79.8991814, url: 'https://maps.app.goo.gl/p1kQmT1cZz7up74n6' },
      { cat: 'Services',   name: "People's Bank",                     lat: 6.8587788, lng: 79.9078789, url: 'https://maps.app.goo.gl/gn2a3YNfVpzcbeck7' }
    ]
  }
};
