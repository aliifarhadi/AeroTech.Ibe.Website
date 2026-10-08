import { getLanguage } from '@aerotech/domain';
import { ComponentsGallery } from '@/features/next/design-system/components-gallery';

/** Living reference for the primitives in packages/ui. Internal page, not indexed. */
export default async function ComponentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = getLanguage(locale);
  return <ComponentsGallery sample={language === 'fa' || language === 'ar' ? 'fa' : 'en'} />;
}
