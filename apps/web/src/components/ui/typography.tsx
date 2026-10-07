import type { ElementType, ReactNode } from 'react';
import { cn } from '@aerotech/ui';

/**
 * Canonical type scale for the app. Use these instead of ad-hoc `text-*` classes so
 * headings stay consistent across sections and pages.
 *
 *   display  — hero headline (one per page)
 *   section  — section heading (h2)
 *   card     — card / tile title (h3)
 */
// Lighter weights (Qatar-style). With the Alibaba fallback, font-medium renders as the elegant
// Regular; with Graphik installed it renders true medium/semibold.
const HEADING = {
  display:
    'text-[2.2rem] font-normal leading-[1.07] tracking-[-0.02em] sm:text-[3.1rem] lg:text-[3.3rem] lg:leading-[1.04]',
  section: 'text-[1.7rem] font-normal leading-[1.12] tracking-[-0.015em] sm:text-[2.15rem]',
  card: 'text-lg font-semibold leading-snug sm:text-xl',
} as const;

const DEFAULT_TAG: Record<keyof typeof HEADING, ElementType> = {
  display: 'h1',
  section: 'h2',
  card: 'h3',
};

export function Heading({
  variant = 'section',
  as,
  className,
  children,
}: {
  variant?: keyof typeof HEADING;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as ?? DEFAULT_TAG[variant];
  return <Tag className={cn(HEADING[variant], className)}>{children}</Tag>;
}

/** Small uppercase label that sits above a section heading. */
export function Eyebrow({
  children,
  onDark,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]',
        onDark ? 'text-brand-400' : 'text-brand-700',
        className,
      )}
    >
      <span className="h-px w-6 bg-current opacity-60" />
      {children}
    </span>
  );
}

/** Muted supporting copy under a heading. */
export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-base leading-relaxed text-neutral-600 sm:text-[1.05rem]', className)}>
      {children}
    </p>
  );
}
