import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand-logo';
import { SearchIcon, UserIcon } from '@/components/icons';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Link } from '@/i18n/navigation';

const NAV = [
  { key: 'explore', href: '/destinations' },
  { key: 'book', href: '/book/search' },
  { key: 'experience', href: '/about' },
  { key: 'club', href: '/loyalty' },
  { key: 'offers', href: '/offers' },
] as const;

export async function SiteHeader() {
  const nav = await getTranslations('Nav');
  const brand = await getTranslations('Brand');

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 text-black shadow-[0_4px_18px_-14px_rgba(0,0,0,0.28)] backdrop-blur-md">
      {/* Top utility bar */}
      <div className="hidden border-b border-neutral-100 bg-neutral-50/70 lg:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-6 px-4 text-xs font-medium text-neutral-500">
          <Link href="/offers" className="transition-colors hover:text-brand-700">
            {nav('offers')}
          </Link>
          <Link href="/help" className="transition-colors hover:text-brand-700">
            {nav('help')}
          </Link>
          <Link href="/signup" className="transition-colors hover:text-brand-700">
            {nav('signup')}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-5 px-4 lg:gap-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label={brand('name')}
          className="group flex items-center gap-2 text-black"
        >
          <BrandLogo name={brand('name')} textClassName="text-lg sm:text-xl" />
        </Link>

        {/* Primary nav */}
        <nav aria-label="primary" className="hidden items-center gap-5 lg:flex xl:gap-7">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="whitespace-nowrap text-sm font-semibold transition-colors hover:text-brand-700 xl:text-[15px]"
            >
              {nav(item.key)}
            </Link>
          ))}
        </nav>

        {/* Utilities */}
        <div className="ms-auto hidden items-center gap-2 lg:flex xl:gap-3">
          <Link
            href="/flight-status"
            className="whitespace-nowrap px-2 text-sm font-semibold transition-colors hover:text-brand-700"
          >
            {nav('flightStatus')}
          </Link>
          <Link
            href="/book/search"
            aria-label={nav('search')}
            className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <SearchIcon className="size-5" />
          </Link>
          <LocaleSwitcher />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:text-brand-700"
          >
            <UserIcon className="size-5" />
            {nav('login')}
          </Link>
        </div>

        {/* Mobile */}
        <details className="relative ms-auto lg:hidden">
          <summary
            aria-label={nav('menu')}
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-black/20 [&::-webkit-details-marker]:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute end-0 mt-2 w-60 rounded-xl border border-neutral-200 bg-white p-3 text-black shadow-xl">
            <nav aria-label="mobile" className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-md px-2 py-2 text-[15px] font-semibold hover:bg-neutral-100"
                >
                  {nav(item.key)}
                </Link>
              ))}
              <Link
                href="/help"
                className="rounded-md px-2 py-2 text-[15px] font-semibold hover:bg-neutral-100"
              >
                {nav('help')}
              </Link>
              <div className="my-2 h-px bg-neutral-200" />
              <div className="px-2 py-1">
                <LocaleSwitcher />
              </div>
              <Link
                href="/login"
                className="rounded-md px-2 py-2 text-[15px] font-semibold text-brand-700 hover:bg-neutral-100"
              >
                {nav('login')} | {nav('signup')}
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
