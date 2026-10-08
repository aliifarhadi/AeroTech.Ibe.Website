'use client';

import { useEffect, useRef } from 'react';
import { BOOKING_ID, useHome } from './home-context';
import { createHeroScene, type HeroScene as Scene } from './hero-scene.art';

/** A still frame far enough into the timeline that the scene has settled. */
const STILL_FRAME_MS = 9000;

/** Canvas backdrop of the hero. Decorative: hidden from assistive technology. */
export function HeroScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const still = useRef(false);
  const { mood } = useHome();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const instance = createHeroScene(canvas);
    if (!instance) return;
    scene.current = instance;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    still.current = reduced.matches;
    let visible = true;
    let frame = 0;
    const started = performance.now();

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const card = document.getElementById(BOOKING_ID)?.getBoundingClientRect();
      instance.resize({
        width: box.width,
        height: box.height,
        cardTop: card ? card.top - box.top : 240,
        cardBottom: card ? card.bottom - box.top : 520,
        rtl: getComputedStyle(canvas).direction === 'rtl',
      });
      if (still.current) instance.draw(STILL_FRAME_MS);
    };
    const tick = (now: number) => {
      if (visible) instance.draw(now - started);
      frame = requestAnimationFrame(tick);
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const seen = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    });
    seen.observe(canvas);
    void document.fonts?.ready.then(measure);

    const onPointer = (event: PointerEvent) =>
      instance.setPointer(
        event.clientX / window.innerWidth - 0.5,
        event.clientY / window.innerHeight - 0.5,
      );
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!still.current) {
      frame = requestAnimationFrame(tick);
      if (fine) host.addEventListener('pointermove', onPointer);
    }

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      seen.disconnect();
      host.removeEventListener('pointermove', onPointer);
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mood || !scene.current) return;
    scene.current.setMood(mood);
    if (still.current) scene.current.draw(STILL_FRAME_MS);
  }, [mood]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
