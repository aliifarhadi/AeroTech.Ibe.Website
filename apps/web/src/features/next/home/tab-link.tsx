'use client';

import type { ReactNode } from 'react';
import { Button, Icon, type ButtonProps } from '@aerotech/ui';
import { useHome, type BookingTab } from './home-context';

type TabLinkProps = Pick<ButtonProps, 'variant' | 'size' | 'className'> & {
  tab: BookingTab;
  withArrow?: boolean;
  children: ReactNode;
};

/** A button that brings the booking card into view on a given tab. */
export function TabLink({ tab, withArrow, children, ...props }: TabLinkProps) {
  const { focusBooking } = useHome();
  return (
    <Button {...props} onPress={() => focusBooking(tab)}>
      {children}
      {withArrow ? <Icon name="arrow" size={16} /> : null}
    </Button>
  );
}
