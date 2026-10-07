import Image from 'next/image';
import { cn } from '@aerotech/ui';

/*
 * Decorative "sign" shape used for the brand PATTERN (tonal background motif), not as the logo.
 * The actual logo uses the official asset in BrandLogo below.
 */
const BLADE = 'M46 12 h8 v12 h5 l-9 12 l-9 -12 h5 z';
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function BrandSign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="50" cy="50" r="7" />
      {ANGLES.map((a) => (
        <path key={a} d={BLADE} transform={`rotate(${a} 50 50)`} />
      ))}
    </svg>
  );
}

/**
 * Official DotAir logo lockup: the yellow sign mark (from /public/brand/logo.png) + the localized
 * wordmark. The yellow mark reads on both light and dark surfaces, so the same lockup works in the
 * header and the dark footer; only the wordmark color changes.
 */
export function BrandLogo({
  name,
  className,
  textClassName,
}: {
  name: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image src="/brand/logo.png" alt="" width={32} height={32} className="size-8" priority />
      <span className={cn('text-xl font-black lowercase tracking-tight', textClassName)}>{name}</span>
    </span>
  );
}
