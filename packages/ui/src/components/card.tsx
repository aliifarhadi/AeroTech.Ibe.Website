import type { ElementType, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants/lite';

const card = tv({
  base: 'rounded-card border',
  variants: {
    surface: {
      1: 'border-hairline bg-surface-1',
      2: 'border-hairline bg-surface-2',
      raised: 'border-strong-line bg-surface-2 shadow-raised',
    },
    padding: { none: '', md: 'p-5', lg: 'p-6 md:p-8' },
  },
  defaultVariants: { surface: 2, padding: 'md' },
});

export type CardProps = VariantProps<typeof card> & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function Card({ as: Tag = 'div', surface, padding, className, children }: CardProps) {
  return <Tag className={card({ surface, padding, className })}>{children}</Tag>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={['animate-pulse rounded-control bg-surface-3', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
