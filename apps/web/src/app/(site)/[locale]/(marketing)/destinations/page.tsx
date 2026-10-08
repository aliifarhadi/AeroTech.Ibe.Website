import { getTranslations } from 'next-intl/server';
import { PlaceholderPage } from '@/components/placeholder-page';

export default async function Page() {
  const nav = await getTranslations('Nav');
  return <PlaceholderPage title={nav('destinations')} />;
}
