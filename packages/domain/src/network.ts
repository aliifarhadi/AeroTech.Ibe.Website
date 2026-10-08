/**
 * The dot air route network for the V1 mocked build.
 *
 * Assumption to confirm with the business: every route has Tehran at one end, so choosing any
 * other origin fixes the destination to Tehran. Distances and bearings are computed from airport
 * coordinates; block times are approximate and are shown as such in the UI.
 */

export const HUB_CODE = 'THR';

export type NetworkRoute = {
  /** City code of the non-hub end. */
  code: string;
  distanceKm: number;
  /** Initial bearing from Tehran, in degrees clockwise from north. */
  bearing: number;
  /** Approximate block time in minutes. */
  minutes: number;
  international: boolean;
};

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

export const NETWORK_CODES: readonly string[] = [HUB_CODE, ...NETWORK_ROUTES.map((r) => r.code)];

export function findRoute(code: string): NetworkRoute | undefined {
  return NETWORK_ROUTES.find((route) => route.code === code);
}

export function isNetworkCode(code: string): boolean {
  return NETWORK_CODES.includes(code);
}

/** Cities that can be reached from `origin`. */
export function destinationsFrom(origin: string): string[] {
  if (origin === HUB_CODE) return NETWORK_ROUTES.map((route) => route.code);
  return isNetworkCode(origin) ? [HUB_CODE] : [];
}

/**
 * The airport code a city is sold under on a given route. Tehran is THR (Mehrabad) on domestic
 * routes and IKA (Imam Khomeini) on international ones.
 */
export function ticketedAirportCode(code: string, otherEnd: string | null): string {
  if (code !== HUB_CODE || !otherEnd) return code;
  return findRoute(otherEnd)?.international ? 'IKA' : code;
}

/** Splits minutes into whole hours and remaining minutes, for display. */
export function splitDuration(totalMinutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
