// Curated city list with French labels — Intl.supportedValuesOf('timeZone') only
// returns raw IANA identifiers (English city names, no country), which made
// searching by country name (e.g. "Espagne", "Portugal") fail.
export const TIMEZONE_CITIES = [
  { city: 'Paris', country: 'France', timeZone: 'Europe/Paris' },
  { city: 'Londres', country: 'Royaume-Uni', timeZone: 'Europe/London' },
  { city: 'Madrid', country: 'Espagne', timeZone: 'Europe/Madrid' },
  { city: 'Lisbonne', country: 'Portugal', timeZone: 'Europe/Lisbon' },
  { city: 'Berlin', country: 'Allemagne', timeZone: 'Europe/Berlin' },
  { city: 'Rome', country: 'Italie', timeZone: 'Europe/Rome' },
  { city: 'Bruxelles', country: 'Belgique', timeZone: 'Europe/Brussels' },
  { city: 'Amsterdam', country: 'Pays-Bas', timeZone: 'Europe/Amsterdam' },
  { city: 'Zurich', country: 'Suisse', timeZone: 'Europe/Zurich' },
  { city: 'Vienne', country: 'Autriche', timeZone: 'Europe/Vienna' },
  { city: 'Dublin', country: 'Irlande', timeZone: 'Europe/Dublin' },
  { city: 'Stockholm', country: 'Suède', timeZone: 'Europe/Stockholm' },
  { city: 'Copenhague', country: 'Danemark', timeZone: 'Europe/Copenhagen' },
  { city: 'Oslo', country: 'Norvège', timeZone: 'Europe/Oslo' },
  { city: 'Helsinki', country: 'Finlande', timeZone: 'Europe/Helsinki' },
  { city: 'Varsovie', country: 'Pologne', timeZone: 'Europe/Warsaw' },
  { city: 'Athènes', country: 'Grèce', timeZone: 'Europe/Athens' },
  { city: 'Istanbul', country: 'Turquie', timeZone: 'Europe/Istanbul' },
  { city: 'Moscou', country: 'Russie', timeZone: 'Europe/Moscow' },
  { city: 'Reykjavik', country: 'Islande', timeZone: 'Atlantic/Reykjavik' },
  { city: 'Casablanca', country: 'Maroc', timeZone: 'Africa/Casablanca' },
  { city: 'Alger', country: 'Algérie', timeZone: 'Africa/Algiers' },
  { city: 'Tunis', country: 'Tunisie', timeZone: 'Africa/Tunis' },
  { city: 'Le Caire', country: 'Égypte', timeZone: 'Africa/Cairo' },
  { city: 'Lagos', country: 'Nigeria', timeZone: 'Africa/Lagos' },
  { city: 'Nairobi', country: 'Kenya', timeZone: 'Africa/Nairobi' },
  { city: 'Johannesburg', country: 'Afrique du Sud', timeZone: 'Africa/Johannesburg' },
  { city: 'Dubaï', country: 'Émirats arabes unis', timeZone: 'Asia/Dubai' },
  { city: 'Riyad', country: 'Arabie saoudite', timeZone: 'Asia/Riyadh' },
  { city: 'Doha', country: 'Qatar', timeZone: 'Asia/Qatar' },
  { city: 'Tel Aviv', country: 'Israël', timeZone: 'Asia/Tel_Aviv' },
  { city: 'Téhéran', country: 'Iran', timeZone: 'Asia/Tehran' },
  { city: 'New Delhi', country: 'Inde', timeZone: 'Asia/Kolkata' },
  { city: 'Mumbai', country: 'Inde', timeZone: 'Asia/Kolkata' },
  { city: 'Karachi', country: 'Pakistan', timeZone: 'Asia/Karachi' },
  { city: 'Dhaka', country: 'Bangladesh', timeZone: 'Asia/Dhaka' },
  { city: 'Bangkok', country: 'Thaïlande', timeZone: 'Asia/Bangkok' },
  { city: 'Jakarta', country: 'Indonésie', timeZone: 'Asia/Jakarta' },
  { city: 'Kuala Lumpur', country: 'Malaisie', timeZone: 'Asia/Kuala_Lumpur' },
  { city: 'Singapour', country: 'Singapour', timeZone: 'Asia/Singapore' },
  { city: 'Manille', country: 'Philippines', timeZone: 'Asia/Manila' },
  { city: 'Hong Kong', country: 'Chine', timeZone: 'Asia/Hong_Kong' },
  { city: 'Shanghai', country: 'Chine', timeZone: 'Asia/Shanghai' },
  { city: 'Pékin', country: 'Chine', timeZone: 'Asia/Shanghai' },
  { city: 'Taipei', country: 'Taïwan', timeZone: 'Asia/Taipei' },
  { city: 'Séoul', country: 'Corée du Sud', timeZone: 'Asia/Seoul' },
  { city: 'Tokyo', country: 'Japon', timeZone: 'Asia/Tokyo' },
  { city: 'Sydney', country: 'Australie', timeZone: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australie', timeZone: 'Australia/Melbourne' },
  { city: 'Perth', country: 'Australie', timeZone: 'Australia/Perth' },
  { city: 'Auckland', country: 'Nouvelle-Zélande', timeZone: 'Pacific/Auckland' },
  { city: 'Honolulu', country: 'États-Unis', timeZone: 'Pacific/Honolulu' },
  { city: 'Anchorage', country: 'États-Unis', timeZone: 'America/Anchorage' },
  { city: 'Los Angeles', country: 'États-Unis', timeZone: 'America/Los_Angeles' },
  { city: 'San Francisco', country: 'États-Unis', timeZone: 'America/Los_Angeles' },
  { city: 'Denver', country: 'États-Unis', timeZone: 'America/Denver' },
  { city: 'Chicago', country: 'États-Unis', timeZone: 'America/Chicago' },
  { city: 'New York', country: 'États-Unis', timeZone: 'America/New_York' },
  { city: 'Miami', country: 'États-Unis', timeZone: 'America/New_York' },
  { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto' },
  { city: 'Montréal', country: 'Canada', timeZone: 'America/Toronto' },
  { city: 'Vancouver', country: 'Canada', timeZone: 'America/Vancouver' },
  { city: 'Mexico', country: 'Mexique', timeZone: 'America/Mexico_City' },
  { city: 'Bogota', country: 'Colombie', timeZone: 'America/Bogota' },
  { city: 'Lima', country: 'Pérou', timeZone: 'America/Lima' },
  { city: 'Santiago', country: 'Chili', timeZone: 'America/Santiago' },
  { city: 'Buenos Aires', country: 'Argentine', timeZone: 'America/Argentina/Buenos_Aires' },
  { city: 'São Paulo', country: 'Brésil', timeZone: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brésil', timeZone: 'America/Sao_Paulo' },
]

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function searchTimezones(query, excludeTimeZones = []) {
  const q = normalize(query.trim())
  if (!q) return []
  return TIMEZONE_CITIES.filter(
    (c) => !excludeTimeZones.includes(c.timeZone) && (normalize(c.city).includes(q) || normalize(c.country).includes(q)),
  ).slice(0, 8)
}

export function getUtcOffsetLabel(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(date)
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
    return tzPart.replace('GMT', 'UTC')
  } catch {
    return ''
  }
}
