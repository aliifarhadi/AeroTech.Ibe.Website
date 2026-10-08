'use client';

import { useEffect, useRef } from 'react';
import { NETWORK_ROUTES } from '@aerotech/domain';
import { createNetworkMap, type MapDots, type NetworkMap as Map } from './network-map.art';

type NetworkMapProps = {
  label: string;
  active: number;
  onPick: (index: number) => void;
  /** Reports whether the map is on screen, so the route carousel only runs while it is seen. */
  onVisibilityChange: (visible: boolean) => void;
};

/**
 * Canvas map of the routes. The list beside it offers the same choices to keyboard and
 * screen-reader users, so the canvas is exposed as an image with a label.
 */
export function NetworkMap({ label, active, onPick, onVisibilityChange }: NetworkMapProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const map = useRef<Map | null>(null);
  const still = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const report = useRef(onVisibilityChange);
  report.current = onVisibilityChange;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    let frame = 0;
    let visible = false;
    let cleanup = () => {};
    still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The dot grid is ~80 kB, so it loads as its own chunk once the section is near the screen.
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        void import('./map-dots.json').then((module) => {
          if (cancelled) return;
          const instance = createNetworkMap(
            canvas,
            module.default as MapDots,
            NETWORK_ROUTES.map((route) => route.code),
            NETWORK_ROUTES.map((route) => route.distanceKm),
            getComputedStyle(canvas).fontFamily,
          );
          if (!instance) return;
          map.current = instance;
          instance.setActive(activeRef.current);
          const started = performance.now();

          const fit = () => {
            instance.resize();
            if (still.current) instance.still();
          };
          const tick = (now: number) => {
            if (visible) instance.frame(now - started);
            frame = requestAnimationFrame(tick);
          };
          fit();
          const resize = new ResizeObserver(fit);
          resize.observe(canvas);
          const seen = new IntersectionObserver((items) => {
            visible = items.some((item) => item.isIntersecting);
            report.current(visible);
          });
          seen.observe(canvas);
          if (!still.current) frame = requestAnimationFrame(tick);
          cleanup = () => {
            resize.disconnect();
            seen.disconnect();
          };
        });
      },
      { rootMargin: '600px 0px' },
    );
    near.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      near.disconnect();
      cleanup();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.setActive(active);
    if (still.current) map.current?.still();
  }, [active]);

  const position = (event: { clientX: number; clientY: number }) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? ([event.clientX - box.left, event.clientY - box.top] as const) : null;
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      dir="ltr"
      className="block h-72 w-full cursor-crosshair font-mono md:h-80 lg:h-96 xl:h-108"
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const at = position(event);
        if (at) map.current?.setPointer(at[0], at[1]);
      }}
      onPointerLeave={() => map.current?.setPointer(null, null)}
      onClick={(event) => {
        const at = position(event);
        const index = at && map.current ? map.current.hit(at[0], at[1]) : -1;
        if (index >= 0) onPick(index);
      }}
    />
  );
}
