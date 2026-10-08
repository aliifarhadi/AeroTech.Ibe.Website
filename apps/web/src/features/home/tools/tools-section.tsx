import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../shared/reveal';
import { TabLink } from '../tab-link';
import { AlertStack } from './alert-stack';
import { FareBars } from './fare-bars';
import { FlightTracker } from './flight-tracker';
import { SeatPicker } from './seat-picker';

function Tile({
  title,
  body,
  wide,
  delay,
  children,
}: {
  title: string;
  body: string;
  wide?: boolean;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
      <article className="relative flex h-full flex-col gap-4 overflow-hidden rounded-card border border-hairline bg-surface-2 p-5 transition-colors duration-(--duration-base) hover:border-strong-line md:min-h-84 md:p-6">
        {children}
        <div className="mt-auto">
          <h3 className="text-title font-bold text-strong">{title}</h3>
          <p className="mt-1 text-small text-muted">{body}</p>
        </div>
      </article>
    </Reveal>
  );
}

/** What happens after buying: four small, live-feeling tiles. */
export async function ToolsSection() {
  const t = await getTranslations('tools');
  return (
    <section id="tools" className="relative border-y border-hairline bg-surface-1 py-section">
      <div className="mx-auto max-w-page px-gutter">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="flex items-center gap-2 text-small font-bold text-action">
              <span className="size-2 rounded-chip bg-action" />
              {t('kicker')}
            </p>
            <h2 className="mt-2 text-heading font-bold text-balance text-strong">{t('title')}</h2>
            <p className="mt-2 max-w-prose text-muted">{t('lead')}</p>
          </div>
          <TabLink tab="manage" variant="secondary" size="sm" withArrow>
            {t('cta')}
          </TabLink>
        </Reveal>
        <div className="mt-9 grid gap-4 lg:grid-cols-12">
          <Tile wide title={t('statusTitle')} body={t('statusBody')}>
            <FlightTracker />
          </Tile>
          <Tile delay={60} title={t('seatTitle')} body={t('seatBody')}>
            <SeatPicker />
          </Tile>
          <Tile title={t('fareTitle')} body={t('fareBody')}>
            <FareBars />
          </Tile>
          <Tile wide delay={60} title={t('alertsTitle')} body={t('alertsBody')}>
            <AlertStack />
          </Tile>
        </div>
      </div>
    </section>
  );
}
