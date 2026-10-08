import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from '@aerotech/ui';
import { ClubActions } from './club-actions';
import { Reveal } from '../shared/reveal';
import { TiltPanel } from './member-card';
import { RoleTicker } from './role-ticker';

const panel =
  'relative flex h-full min-h-80 flex-col gap-6 overflow-hidden rounded-card border border-hairline bg-surface-1 p-6 md:p-9';

/** The loyalty club and the team behind the airline, side by side. */
export async function ClubSection() {
  const t = await getTranslations();

  return (
    <section id="club" className="relative border-y border-hairline bg-surface-1 py-section">
      <div className="mx-auto grid max-w-page gap-4 px-gutter lg:grid-cols-2">
        <Reveal>
          <TiltPanel className={`${panel} bg-surface-2`}>
            <div aria-hidden="true" className="home-member-stage">
              <div className="home-member-card">
                <span className="flex items-center gap-2 text-caption font-bold">
                  <Image src="/brand/logo.png" alt="" width={22} height={22} />
                  {t('brand')}
                </span>
                <span>
                  <span className="block font-mono text-caption tracking-wide text-muted">
                    {t('club.member')}
                  </span>
                  <span className="text-small">{t('club.yourName')}</span>
                </span>
              </div>
            </div>
            <div className="md:max-w-1/2">
              <p className="flex items-center gap-2 text-small font-bold text-action">
                <span className="size-2 rounded-chip bg-action" />
                {t('club.kicker')}
              </p>
              <h2 className="mt-2 text-subheading font-bold text-balance text-strong">
                {t('club.title')}
              </h2>
              <p className="mt-2 text-muted">{t('club.lead')}</p>
            </div>
            <ClubActions />
          </TiltPanel>
        </Reveal>

        <Reveal delay={80}>
          <div className={`${panel} bg-surface-2`}>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-small font-bold text-action">
                  <span className="size-2 rounded-chip bg-action" />
                  {t('club.teamKicker')}
                </p>
                <span className="inline-flex h-7 items-center gap-2 rounded-chip border border-hairline px-2.5 text-caption whitespace-nowrap text-soft">
                  <span className="size-1.5 animate-beat rounded-chip bg-success" />
                  {t('club.hiring')}
                </span>
              </div>
              <h2 className="mt-2 text-subheading font-bold text-balance text-strong">
                {t('club.teamTitle')}
              </h2>
              <p className="mt-2 max-w-prose text-muted">{t('club.teamLead')}</p>
              <div className="mt-4">
                <RoleTicker
                  roles={(['designer', 'frontend', 'ml', 'network'] as const).map((role) =>
                    t(`club.roles.${role}`),
                  )}
                />
              </div>
            </div>
            <div className="mt-auto">
              <Link
                href="/about"
                className="inline-flex h-12 items-center gap-2 rounded-control border border-strong-line px-5 font-bold transition-colors duration-(--duration-fast) hover:border-hover-line hover:bg-surface-hover"
              >
                {t('club.careers')}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
