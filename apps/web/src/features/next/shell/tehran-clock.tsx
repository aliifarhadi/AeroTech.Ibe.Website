'use client';

import { useEffect, useState } from 'react';

/** HH:MM in Tehran, in Latin digits to match the monospaced label beside it. */
export function TehranClock() {
  const [time, setTime] = useState('--:--');
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const update = () => setTime(format.format(new Date()));
    update();
    const timer = window.setInterval(update, 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return <span suppressHydrationWarning>{time}</span>;
}
