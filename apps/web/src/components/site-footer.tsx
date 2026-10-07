import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand-logo';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/icons';
import { Link } from '@/i18n/navigation';

const COLUMNS = [
  {
    key: 'bookManage',
    links: [
      { k: 'bookFlight', href: '/book/search' },
      { k: 'manage', href: '/manage' },
      { k: 'checkIn', href: '/check-in' },
      { k: 'flightStatus', href: '/flight-status' },
    ],
  },
  {
    key: 'explore',
    links: [
      { k: 'destinations', href: '/destinations' },
      { k: 'offers', href: '/offers' },
      { k: 'experience', href: '/about' },
      { k: 'club', href: '/loyalty' },
    ],
  },
  {
    key: 'help',
    links: [
      { k: 'contact', href: '/contact' },
      { k: 'faqs', href: '/help' },
      { k: 'baggage', href: '/baggage' },
      { k: 'assistance', href: '/help' },
    ],
  },
  {
    key: 'about',
    links: [
      { k: 'aboutUs', href: '/about' },
      { k: 'careers', href: '/about' },
      { k: 'newsroom', href: '/about' },
      { k: 'sustainability', href: '/about' },
    ],
  },
  {
    key: 'business',
    links: [
      { k: 'corporate', href: '/about' },
      { k: 'agents', href: '/about' },
      { k: 'partners', href: '/about' },
    ],
  },
] as const;

const SOCIAL = [
  { Icon: InstagramIcon, label: 'Instagram' },
  { Icon: YoutubeIcon, label: 'YouTube' },
  { Icon: LinkedinIcon, label: 'LinkedIn' },
  { Icon: XIcon, label: 'X' },
  { Icon: FacebookIcon, label: 'Facebook' },
];

export async function SiteFooter() {
  const f = await getTranslations('Footer');
  const brand = await getTranslations('Brand');
  const year = 2026;

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white text-neutral-700">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-2 gap-8 text-start sm:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <h2 className="mb-3 text-sm font-bold text-black">{f(`columns.${col.key}`)}</h2>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.k}>
                    <Link href={l.href} className="text-sm hover:text-brand-700">
                      {f(`links.${l.k}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 sm:col-span-1">
            <h2 className="mb-3.5 text-sm font-bold text-black">{f('stayInTouch')}</h2>
            <div className="flex flex-wrap items-center gap-5">
              {SOCIAL.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-neutral-400 transition hover:text-brand-700"
                >
                  <Icon className="size-[1.35rem]" />
                </a>
              ))}
            </div>

            <p className="mb-2.5 mt-7 text-sm font-bold text-black">{f('getApp')}</p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="#"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-brand-400 hover:text-brand-700"
              >
                App Store
              </a>
              <a
                href="#"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-brand-400 hover:text-brand-700"
              >
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 text-start sm:flex-row sm:items-center">
          <BrandLogo name={brand('name')} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
            <Link href="/about" className="hover:text-brand-700">
              {f('legal.privacy')}
            </Link>
            <Link href="/about" className="hover:text-brand-700">
              {f('legal.terms')}
            </Link>
            <Link href="/about" className="hover:text-brand-700">
              {f('legal.cookies')}
            </Link>
            <span>
              © {year} {brand('name')}. {f('rights')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
