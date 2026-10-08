import { getTranslations } from 'next-intl/server';
import { BookingCard } from './booking/booking-card';
import { Greeting } from './greeting';
import { HeroScene } from './hero-scene';
import { InspireRail } from './inspire-rail';

/** First screen: greeting, headline, the booking card high on the page, then destination tiles. */
export async function Hero() {
  const t = await getTranslations('hero');
  return (
    <div className="relative z-10 overflow-hidden bg-canvas pt-(--header-height)">
      <HeroScene />
      <div className="relative mx-auto max-w-page px-gutter">
        <div className="flex flex-col items-start gap-1 pt-1.5 md:pt-4">
          <Greeting />
          <h1 className="animate-fade-up text-display font-bold whitespace-nowrap text-strong text-shadow-scene-strong">
            {t('title')}
            <span className="ms-1 inline-block size-2 rounded-chip bg-action md:size-2.5" />
          </h1>
          <p
            style={{ animationDelay: '80ms' }}
            className="animate-fade-up pe-24 text-small text-on-scene text-shadow-scene md:pe-0 md:text-field"
          >
            {t('subtitle')}
          </p>
        </div>
        <div
          style={{ animationDelay: '160ms' }}
          className="relative mt-3 animate-fade-up pb-5 md:mt-6 md:pb-8"
        >
          <BookingCard />
        </div>
        <InspireRail />
      </div>
    </div>
  );
}
