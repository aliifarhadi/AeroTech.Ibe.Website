import type { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants/lite';

const badge = tv({
  base: 'inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-chip px-2.5 text-caption',
  variants: {
    tone: {
      neutral: 'border border-strong-line text-muted',
      success: 'border border-success text-success',
      action: 'bg-action font-bold text-on-action',
      danger: 'border border-danger text-danger-soft',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type BadgeProps = VariantProps<typeof badge> & { children: ReactNode; className?: string };

export function Badge({ tone, className, children }: BadgeProps) {
  return <span className={badge({ tone, className })}>{children}</span>;
}
