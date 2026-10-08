import { HomeV2 } from '@/features/home-v2/home-v2';

// New Korean Air-structured homepage (DotAir brand). The previous homepage is
// archived in `@/features/home/sections` (Hero/TrustStrip/Destinations/Offers/…)
// and can be restored by swapping the import back.
export default function HomePage() {
  return <HomeV2 />;
}
