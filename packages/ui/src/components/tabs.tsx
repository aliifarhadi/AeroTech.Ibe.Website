'use client';

import type { ReactNode } from 'react';
import {
  SelectionIndicator,
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabPanelProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { focusRing } from './button';

export type TabsProps = Omit<AriaTabsProps, 'className'> & { className?: string };

export function Tabs({ className, ...props }: TabsProps) {
  return <AriaTabs {...props} className={['flex flex-col', className].filter(Boolean).join(' ')} />;
}

/** `shortLabel` replaces `label` below the md breakpoint, where four tabs share a phone's width. */
export type TabItem = { id: string; label: string; shortLabel?: string; icon?: ReactNode };

/** A pill track with a thumb that slides to the selected tab. */
export function TabList({
  items,
  'aria-label': ariaLabel,
}: {
  items: TabItem[];
  'aria-label': string;
}) {
  return (
    <AriaTabList aria-label={ariaLabel} className="flex gap-1 rounded-group bg-canvas p-1">
      {items.map((item) => (
        <AriaTab
          key={item.id}
          id={item.id}
          className={[
            'relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control px-2',
            'text-small font-bold text-muted transition-colors duration-(--duration-base)',
            'data-hovered:text-default data-selected:text-strong',
            focusRing,
          ].join(' ')}
        >
          <SelectionIndicator className="absolute inset-0 rounded-control bg-surface-3 shadow-raised transition-all duration-(--duration-slow) ease-out-soft" />
          <span className="relative hidden shrink-0 md:inline-flex">{item.icon}</span>
          {item.shortLabel ? (
            <>
              <span className="relative truncate md:hidden">{item.shortLabel}</span>
              <span className="relative hidden truncate md:inline">{item.label}</span>
            </>
          ) : (
            <span className="relative truncate">{item.label}</span>
          )}
        </AriaTab>
      ))}
    </AriaTabList>
  );
}

export function TabPanel({
  className,
  ...props
}: Omit<TabPanelProps, 'className'> & { className?: string }) {
  return (
    <AriaTabPanel {...props} className={['outline-none', className].filter(Boolean).join(' ')} />
  );
}
