'use client';

import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  composeRenderProps,
  Link as AriaLink,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';
import { Spinner } from './spinner';

export const focusRing =
  'outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-focus';

const button = tv({
  base: [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control font-bold',
    'transition duration-(--duration-fast) ease-out-soft data-pressed:scale-97 data-disabled:cursor-not-allowed',
    focusRing,
  ],
  variants: {
    variant: {
      primary:
        'bg-action text-on-action data-hovered:bg-action-hover data-hovered:shadow-action data-pressed:bg-action-pressed data-disabled:bg-surface-3 data-disabled:text-faint data-disabled:shadow-none',
      secondary:
        'border border-strong-line text-default data-hovered:border-hover-line data-hovered:bg-surface-hover data-disabled:text-disabled',
      ghost:
        'text-soft data-hovered:bg-surface-hover data-hovered:text-strong data-disabled:text-disabled',
    },
    size: {
      sm: 'h-10 px-4 text-small',
      md: 'h-12 px-5 text-body',
      lg: 'h-14 px-7 text-field',
    },
    fullWidth: { true: 'w-full' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export type ButtonProps = Omit<AriaButtonProps, 'children' | 'className'> &
  VariantProps<typeof button> & {
    children: ReactNode;
    /** Layout-only classes (margin, grid placement). Visual styling comes from variants. */
    className?: string;
  };

export function Button({ variant, size, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <AriaButton {...props} className={button({ variant, size, fullWidth, className })}>
      {composeRenderProps(children, (content, { isPending }) =>
        isPending ? <Spinner /> : content,
      )}
    </AriaButton>
  );
}

export type ButtonLinkProps = Omit<AriaLinkProps, 'children' | 'className'> &
  VariantProps<typeof button> & { children: ReactNode; className?: string };

/** A link that looks like a button. Use it when the action is navigation. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <AriaLink {...props} className={button({ variant, size, fullWidth, className })}>
      {children}
    </AriaLink>
  );
}

const iconButton = tv({
  base: [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-chip transition duration-(--duration-fast)',
    'data-disabled:cursor-not-allowed data-disabled:text-disabled',
    focusRing,
  ],
  variants: {
    variant: {
      outline:
        'border border-strong-line text-default data-hovered:border-action data-hovered:text-action',
      soft: 'bg-surface-hover text-default data-hovered:text-strong',
      ghost: 'text-soft data-hovered:bg-surface-hover data-hovered:text-strong',
    },
    size: { sm: 'size-9', md: 'size-10', lg: 'size-11' },
  },
  defaultVariants: { variant: 'outline', size: 'md' },
});

export type IconButtonProps = Omit<AriaButtonProps, 'children' | 'className'> &
  VariantProps<typeof iconButton> & {
    /** Required: icon-only buttons have no visible text. */
    'aria-label': string;
    children: ReactNode;
    className?: string;
  };

export function IconButton({ variant, size, className, children, ...props }: IconButtonProps) {
  return (
    <AriaButton {...props} className={iconButton({ variant, size, className })}>
      {children}
    </AriaButton>
  );
}
