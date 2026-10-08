/*
 * Kept out of the client modules so server components can call it too.
 */

/** Maps an app locale (`fa-ir`) to the BCP 47 tag that formatting and calendars expect (`fa-IR`). */
export function toBcp47(locale: string): string {
  const [language, region] = locale.split('-');
  return region ? `${language?.toLowerCase()}-${region.toUpperCase()}` : locale;
}
