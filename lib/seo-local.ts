/**
 * Local / regional SEO constants aligned with Google Search guidance:
 * - Clear entity (name, address, phone)
 * - Service area for Ghana + West Africa
 * - en-GH language/region targeting
 *
 * Note: Ranking for "study abroad" near a user in Accra is driven by Google
 * (relevance + proximity + prominence). The site must emit strong local signals;
 * a Google Business Profile is also required off-site.
 */

export const BUSINESS_ENTITY = {
  legalName: 'Center for Admission and Travels',
  brandNames: [
    'Center for Admission and Travels',
    'CA Travels',
    'CA Travels Ghana',
    'CFAAT',
    'Center for Admission & Travels',
  ] as const,
  shortName: 'CFAAT',
  country: 'GH',
  countryName: 'Ghana',
  city: 'Accra',
  region: 'Greater Accra',
  locale: 'en_GH',
  htmlLang: 'en-GH',
  hreflang: 'en-GH',
  timezone: 'Africa/Accra',
  currencyDefault: 'GHS',
  priceRange: '$$',
  /** Typical office hours — adjust if admin later stores real hours */
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '17:30' },
    { days: ['Saturday'], opens: '09:00', closes: '14:00' },
  ],
}

/** Countries we serve / market to (for areaServed + content) */
export const PRIMARY_SERVICE_COUNTRY = {
  name: 'Ghana',
  code: 'GH',
  cities: ['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast', 'Tamale'],
}

export const WEST_AFRICA_SERVICE_AREAS = [
  { name: 'Ghana', code: 'GH' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Côte d\'Ivoire', code: 'CI' },
  { name: 'Togo', code: 'TG' },
  { name: 'Benin', code: 'BJ' },
  { name: 'Senegal', code: 'SN' },
  { name: 'Liberia', code: 'LR' },
  { name: 'Sierra Leone', code: 'SL' },
  { name: 'Gambia', code: 'GM' },
  { name: 'Burkina Faso', code: 'BF' },
] as const

export const CORE_SERVICES = [
  {
    name: 'Study Abroad from Ghana',
    path: '/study-abroad',
    type: 'EducationalCounseling',
    keywords: ['study abroad Ghana', 'study abroad from Ghana', 'university admission Ghana'],
  },
  {
    name: 'Work Abroad from Ghana',
    path: '/work-abroad',
    type: 'CareerCounseling',
    keywords: ['work abroad Ghana', 'work abroad from Ghana', 'jobs abroad Ghana'],
  },
  {
    name: 'Travel Abroad & Tours',
    path: '/travel-tours',
    type: 'TravelAgency',
    keywords: ['travel abroad Ghana', 'travel packages Ghana', 'tours from Ghana'],
  },
  {
    name: 'Visa Guidance',
    path: '/contact',
    type: 'ProfessionalService',
    keywords: ['visa assistance Ghana', 'travel visa Ghana'],
  },
] as const

export const LOCAL_KEYWORDS = [
  'study abroad from Ghana',
  'travel abroad from Ghana',
  'work abroad from Ghana',
  'travel agency Accra',
  'travel agency Ghana',
  'study abroad Accra',
  'CA Travels Ghana',
  'CFAAT Ghana',
  'Center for Admission and Travels Accra',
  'international education Ghana',
  'Dubai tour from Ghana',
  'Europe tour from Ghana',
  'visa support Accra',
  'West Africa travel agency',
]

/** Schema.org OpeningHoursSpecification from BUSINESS_ENTITY.openingHours */
export function buildOpeningHoursSpec() {
  const dayMap: Record<string, string> = {
    Monday: 'https://schema.org/Monday',
    Tuesday: 'https://schema.org/Tuesday',
    Wednesday: 'https://schema.org/Wednesday',
    Thursday: 'https://schema.org/Thursday',
    Friday: 'https://schema.org/Friday',
    Saturday: 'https://schema.org/Saturday',
    Sunday: 'https://schema.org/Sunday',
  }

  return BUSINESS_ENTITY.openingHours.flatMap((block) =>
    block.days.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[day] || day,
      opens: block.opens,
      closes: block.closes,
    }))
  )
}

export function buildAreaServedSchema() {
  return [
    {
      '@type': 'Country',
      name: 'Ghana',
      sameAs: 'https://www.wikidata.org/wiki/Q117',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Greater Accra Region',
    },
    {
      '@type': 'City',
      name: 'Accra',
    },
    {
      '@type': 'Place',
      name: 'West Africa',
    },
    ...WEST_AFRICA_SERVICE_AREAS.filter((c) => c.code !== 'GH').map((c) => ({
      '@type': 'Country' as const,
      name: c.name,
    })),
  ]
}
