import type { SVGProps } from 'react';

/**
 * Line icons drawn on a 24px grid with `currentColor`. Directional icons (arrow, chevrons) point
 * "forward" in the reading direction and mirror themselves in RTL.
 */
const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  'chevron-forward': 'M9 6l6 6-6 6',
  'chevron-back': 'M15 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  plane: 'M3 13l18-8-6 16-3-7z',
  bag: 'M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  'check-in': 'M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM8 12l3 3 5-6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 20c1.5-4 14.5-4 16 0',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18',
  swap: 'M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4',
  close: 'M6 6l12 12M18 6L6 18',
  pin: 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  logout: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h9',
  info: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 11v5M12 7.6v.2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  menu: 'M4 8h16M4 16h16',
  refund: 'M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  document: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4',
  chat: 'M4 5h16v11H9l-5 4z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4',
  instagram:
    'M8.5 3.5h7a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-7a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17 6.9v.2',
  telegram: 'M20.5 4.5L3.5 11l5.5 2 2 6 3-4 4.5 3.5zM9 13l8-6',
  x: 'M4.5 4.5l15 15M19.5 4.5l-15 15',
  linkedin:
    'M6.5 3.5h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3zM8 10.5V16M8 7.6v.1M12 16v-3a2 2 0 0 1 4 0v3M12 10.5V16',
  youtube:
    'M6.5 5.5h11a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-11a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4zM10.5 9.5l4 2.5-4 2.5z',
  aparat:
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM9 7.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM15 7.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM9 12.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM15 12.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z',
} as const;

export type IconName = keyof typeof PATHS;

const DIRECTIONAL: ReadonlySet<IconName> = new Set([
  'arrow',
  'chevron-forward',
  'chevron-back',
  'logout',
]);

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  /** Rendered size in pixels. Defaults to 20. */
  size?: number;
};

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[DIRECTIONAL.has(name) ? 'rtl:-scale-x-100' : '', 'shrink-0', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
