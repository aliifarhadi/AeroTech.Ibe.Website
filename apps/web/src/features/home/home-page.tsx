import { getTranslations } from 'next-intl/server';
import { MobileNav } from '../shell/mobile-nav';
import { SiteFooter } from '../shell/site-footer';
import { SiteHeader } from '../shell/site-header';
import { SkipLink } from '../shell/skip-link';
import { AssistantSection } from './assistant-section';
import { ClubSection } from './club-section';
import { GuideSection } from './guide-section';
import { Hero } from './hero';
import { HomeProvider } from './home-context';
import { NetworkSection } from './network/network-section';
import { ToolsSection } from './tools/tools-section';

export async function HomePage() {
  const t = await getTranslations();
  return (
    <HomeProvider>
      <SkipLink label={t('skip')} />
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
