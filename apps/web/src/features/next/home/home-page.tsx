import { getTranslations } from 'next-intl/server';
import { MobileNav } from '../shell/mobile-nav';
import { SiteFooter } from '../shell/site-footer';
import { SiteHeader } from '../shell/site-header';
import { AssistantSection } from './assistant-section';
import { ClubSection } from './club-section';
import { GuideSection } from './guide-section';
import { Hero } from './hero';
import { HomeProvider } from './home-context';
import { NetworkSection } from './network/network-section';
import { ToolsSection } from './tools/tools-section';

export async function HomePage() {
  const t = await getTranslations('Next');
  return (
    <HomeProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-(--z-toast) focus:rounded-control focus:bg-action focus:px-4 focus:py-2 focus:font-bold focus:text-on-action"
      >
        {t('skip')}
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <NetworkSection />
        <AssistantSection />
        <ToolsSection />
        <GuideSection />
        <ClubSection />
      </main>
      <SiteFooter />
      <MobileNav />
    </HomeProvider>
  );
}
