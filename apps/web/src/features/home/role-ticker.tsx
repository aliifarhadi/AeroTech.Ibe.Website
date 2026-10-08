'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '../shared/use-media';

/** Rolls through the roles we are hiring for, one line at a time. */
export function RoleTicker({ roles }: { roles: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      setSnap(false);
      setIndex((value) => value + 1);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [reduced]);

  // The first role is repeated at the end; once it has rolled in, jump back to the start unseen.
  useEffect(() => {
    if (index !== roles.length) return;
    const timer = window.setTimeout(() => {
      setSnap(true);
      setIndex(0);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [index, roles.length]);

  return (
    <div
      aria-hidden="true"
      className="h-9 overflow-hidden text-title leading-9 font-bold text-action"
    >
      <div
        style={{ transform: `translateY(${-2.25 * index}rem)` }}
        className={snap ? '' : 'transition-transform duration-700 ease-out-soft'}
      >
        {[...roles, roles[0]].map((role, i) => (
          <div key={i} className="h-9 truncate">
            {role}
          </div>
        ))}
      </div>
    </div>
  );
}
