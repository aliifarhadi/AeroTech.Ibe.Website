import { describe, expect, it } from 'vitest';
import { greetingForHour, moodForHour, nextMood, tehranClock, tehranHour } from './scene-mood';

describe('moodForHour', () => {
  it('covers the whole day without gaps', () => {
    const moods = Array.from({ length: 24 }, (_, hour) => moodForHour(hour));
    expect(moods.slice(0, 5).every((mood) => mood === 'night')).toBe(true);
    expect(moods[5]).toBe('dawn');
    expect(moods[9]).toBe('day');
    expect(moods[16]).toBe('dusk');
    expect(moods[20]).toBe('night');
  });
});

describe('greetingForHour', () => {
  it('changes at 5, 11, 17 and 21', () => {
    expect([4, 5, 11, 17, 21].map(greetingForHour)).toEqual([
      'night',
      'morning',
      'afternoon',
      'evening',
      'night',
    ]);
  });
});

describe('nextMood', () => {
  it('cycles through all four moods', () => {
    expect(nextMood('dawn')).toBe('day');
    expect(nextMood('night')).toBe('dawn');
  });
});

describe('Tehran time', () => {
  // Tehran is UTC+03:30 all year.
  const noonUtc = new Date('2026-10-08T12:00:00Z');

  it('reads the hour in Tehran', () => {
    expect(tehranHour(noonUtc)).toBe(15);
    expect(tehranHour(new Date('2026-10-08T20:45:00Z'))).toBe(0);
  });

  it('formats the clock in the digits of the locale', () => {
    expect(tehranClock('en-DE', noonUtc)).toBe('15:30');
    expect(tehranClock('fa-IR', noonUtc)).toBe('۱۵:۳۰');
  });
});
