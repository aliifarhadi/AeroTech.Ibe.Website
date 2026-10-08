/** The hero sky follows the hour in Tehran, the airline's home. */
export type Mood = 'dawn' | 'day' | 'dusk' | 'night';
export type Greeting = 'morning' | 'afternoon' | 'evening' | 'night';

export const MOODS: readonly Mood[] = ['dawn', 'day', 'dusk', 'night'];

export function moodForHour(hour: number): Mood {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 16) return 'day';
  if (hour >= 16 && hour < 20) return 'dusk';
  return 'night';
}

export function greetingForHour(hour: number): Greeting {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function nextMood(mood: Mood): Mood {
  return MOODS[(MOODS.indexOf(mood) + 1) % MOODS.length] ?? 'dawn';
}

const hourFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tehran',
  hour: '2-digit',
  hour12: false,
});

export function tehranHour(now: Date = new Date()): number {
  return Number(hourFormat.format(now)) % 24;
}

/** HH:MM in Tehran, in the digits of `locale`. */
export function tehranClock(locale: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}
