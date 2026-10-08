'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';

/**
 * The membership card tilts towards the pointer anywhere over its panel. Decorative; it stays
 * at its resting angle on touch devices and when motion is reduced (see home.css).
 */
export function TiltPanel({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.style.setProperty('--tilt-y', `${(x - 0.5) * -30}deg`);
    el.style.setProperty('--tilt-x', `${(y - 0.5) * 22}deg`);
    el.style.setProperty('--glare-x', `${x * 100}%`);
    el.style.setProperty('--glare-y', `${y * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.removeProperty('--tilt-y');
    ref.current?.style.removeProperty('--tilt-x');
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={className}>
      {children}
    </div>
  );
}
