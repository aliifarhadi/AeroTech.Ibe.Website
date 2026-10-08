'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds. */
  delay?: number;
  /** Called once, when the element first enters the viewport. */
  onReveal?: () => void;
};

/**
 * Fades its content up when it scrolls into view. Server HTML is fully visible: only elements
 * that are below the fold once JavaScript runs are hidden and then revealed, so nothing depends
 * on scripting to be readable. Styles: `[data-reveal]` in home.css.
 */
export function Reveal({ children, className, delay = 0, onReveal }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onReveal);
  callback.current = onReveal;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const below = el.getBoundingClientRect().top > window.innerHeight * 0.95;
    if (below && !reduced) el.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.reveal = 'in';
        observer.disconnect();
        callback.current?.();
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
