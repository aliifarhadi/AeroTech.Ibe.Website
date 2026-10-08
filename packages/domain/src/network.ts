/**
 * The dot air route network for the V1 mocked build.
 *
 * Until the commercial schedule is connected, every pair of cities in the network is offered.
 * Distances are great-circle distances between airports; block times are approximate and are
 * shown as such in the UI.
 */

export type NetworkCity = {
  code: string;
  latitude: number;
  longitude: number;
  international: boolean;
};

export const NETWORK_CITIES: readonly NetworkCity[] = [
  { code: 'THR', latitude: 35.69, longitude: 51.31, international: false },
  { code: 'MHD', latitude: 36.24, longitude: 59.64, international: false },
  { code: 'SYZ', latitude: 29.54, longitude: 52.59, international: false },
  { code: 'IFN', latitude: 32.75, longitude: 51.86, international: false },
  { code: 'TBZ', latitude: 38.13, longitude: 46.24, international: false },
  { code: 'KIH', latitude: 26.53, longitude: 53.98, international: false },
  { code: 'AWZ', latitude: 31.34, longitude: 48.76, international: false },
  { code: 'BND', latitude: 27.22, longitude: 56.38, international: false },
  { code: 'IST', latitude: 41.26, longitude: 28.74, international: true },
];

/** Where a new search starts from. It is a default, not a constraint. */
export const HUB_CODE = 'THR';

export const NETWORK_CODES: readonly string[] = NETWORK_CITIES.map((city) => city.code);

export type NetworkRoute = {
  /** City code of the far end. */
  code: string;
  distanceKm: number;
  /** Initial bearing from Tehran, in degrees clockwise from north. */
  bearing: number;
  /** Approximate block time in minutes. */
  minutes: number;
  international: boolean;
};

/** The routes out of Tehran, as drawn on the home page map. */
export const NETWORK_ROUTES: readonly NetworkRoute[] = [
  { code: 'MHD', distanceKm: 752, bearing: 83, minutes: 85, international: false },
  { code: 'SYZ', distanceKm: 694, bearing: 170, minutes: 80, international: false },
  { code: 'IFN', distanceKm: 331, bearing: 171, minutes: 60, international: false },
  { code: 'TBZ', distanceKm: 526, bearing: 303, minutes: 70, international: false },
  { code: 'KIH', distanceKm: 1050, bearing: 165, minutes: 110, international: false },
  { code: 'AWZ', distanceKm: 538, bearing: 207, minutes: 75, international: false },
  { code: 'BND', distanceKm: 1057, bearing: 152, minutes: 115, international: false },
  { code: 'IST', distanceKm: 2053, bearing: 294, minutes: 195, international: true },
];

export function findCity(code: string): NetworkCity | undefined {
  return NETWORK_CITIES.find((city) => city.code === code);
}

export function findRoute(code: string): NetworkRoute | undefined {
  return NETWORK_ROUTES.find((route) => route.code === code);
}

export function isNetworkCode(code: string): boolean {
  return NETWORK_CODES.includes(code);
}

/** Cities that can be reached from `origin`: every other city in the network. */
export function destinationsFrom(origin: string): string[] {
  return isNetworkCode(origin) ? NETWORK_CODES.filter((code) => code !== origin) : [];
}

export type RouteFacts = { distanceKm: number; minutes: number; international: boolean };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Distance, approximate block time and market type for any pair of cities. */
export function routeBetween(from: string, to: string): RouteFacts | undefined {
  const a = findCity(from);
  const b = findCity(to);
  if (!a || !b || a === b) return undefined;
  const international = a.international || b.international;
  const table = findRoute(from === HUB_CODE ? to : to === HUB_CODE ? from : '');
  if (table) return { distanceKm: table.distanceKm, minutes: table.minutes, international };

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  const distanceKm = Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
  // 25 minutes for taxi, climb and approach, then cruise at about 750 km/h; to the nearest 5.
  const minutes = Math.round((25 + distanceKm / 12.5) / 5) * 5;
  return { distanceKm, minutes, international };
}

/**
 * The airport code a city is sold under on a given route. Tehran is THR (Mehrabad) on domestic
 * routes and IKA (Imam Khomeini) on international ones.
 */
export function ticketedAirportCode(code: string, otherEnd: string | null): string {
  if (code !== HUB_CODE || !otherEnd) return code;
  return findCity(otherEnd)?.international ? 'IKA' : code;
}

/** The city behind an airport code as it appears on a ticket. */
export function cityOfAirport(code: string): string {
  return code === 'IKA' ? HUB_CODE : code;
}

/** Splits minutes into whole hours and remaining minutes, for display. */
export function splitDuration(totalMinutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
