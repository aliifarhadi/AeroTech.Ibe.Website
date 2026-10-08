'use client';

import { useTranslations } from 'next-intl';
import { Icon, TabList, TabPanel, Tabs, type IconName } from '@aerotech/ui';
import { BOOKING_ID, useHome, type BookingTab } from '../home-context';
import { LookupForm } from './lookup-form';
import { SearchForm } from './search-form';

const TABS: ReadonlyArray<{ id: BookingTab; icon: IconName }> = [
  { id: 'book', icon: 'plane' },
  { id: 'manage', icon: 'bag' },
  { id: 'checkIn', icon: 'check-in' },
  { id: 'status', icon: 'clock' },
];

/** The glass card on the hero: search, manage, check-in and flight status in one place. */
export function BookingCard() {
  const t = useTranslations('Next.booking');
  const { tab, setTab } = useHome();

  return (
    <div
      id={BOOKING_ID}
      className="relative rounded-card border border-strong-line bg-surface-2/80 p-2 shadow-raised backdrop-blur-2xl backdrop-saturate-150 md:p-2.5"
    >
      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(key as BookingTab)}>
        <TabList
          aria-label={t('tabsAria')}
          items={TABS.map(({ id, icon }) => ({
            id,
            label: t(`tabs.${id}`),
            shortLabel: t(`tabsShort.${id}`),
            icon: <Icon name={icon} size={18} />,
          }))}
        />
        <TabPanel id="book" className="px-0.5 pt-2.5 pb-0.5">
          <SearchForm />
        </TabPanel>
        <TabPanel id="manage" className="px-0.5 pt-3 pb-0.5">
          <LookupForm kind="manage" />
        </TabPanel>
        <TabPanel id="checkIn" className="px-0.5 pt-3 pb-0.5">
          <LookupForm kind="checkIn" />
        </TabPanel>
        <TabPanel id="status" className="px-0.5 pt-3 pb-0.5">
          <LookupForm kind="status" />
        </TabPanel>
      </Tabs>
    </div>
  );
}
