'use client';

import { useEffect, useState } from 'react';
import { BOOKING_ID } from '../home/home-context';

/** True once the booking card has scrolled out of view: the cue to offer a search shortcut. */
export function useBookingAway(): boolean {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const card = document.getElementById(BOOKING_ID);
    if (!card) return;
    const observer = new IntersectionObserver(
      (entries) => setAway(!entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '-80px 0px 0px 0px' },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);
  return away;
}
