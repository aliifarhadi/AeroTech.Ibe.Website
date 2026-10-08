'use client';

import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  DateFormatter,
  DialogTrigger,
  FieldButton,
  Icon,
  ICON_NAMES,
  IconButton,
  Modal,
  RangeCalendar,
  ResponsiveOverlay,
  SearchList,
  SegmentedControl,
  Skeleton,
  Stepper,
  Switch,
  TabList,
  TabPanel,
  Tabs,
  TextField,
  ToggleChip,
  getLocalTimeZone,
  today,
  useIsDesktop,
  useLocale,
  useToast,
  type DateValue,
} from '@aerotech/ui';

/**
 * Sample copy for this internal page only. Product copy lives in apps/web/messages.
 * Persian is used for fa and ar so that right-to-left rendering is exercised with real text.
 */
const COPY = {
  en: {
    search: 'Search flights',
    secondary: 'Manage booking',
    ghost: 'Edit search',
    tabs: ['Book a flight', 'Manage booking', 'Check-in', 'Flight status'],
    tabsShort: ['Book', 'Manage', 'Check-in', 'Status'],
    panel: 'Panel for',
    trip: 'Trip type',
    round: 'Round trip',
    oneWay: 'One way',
    promo: 'I have a promo code',
    points: 'Pay with points',
    email: 'Email',
    emailBad: 'That email is not valid.',
    ref: 'Booking reference',
    refHint: 'Six letters or digits, on your ticket.',
    terms: 'I accept the terms of use.',
    sms: 'SMS alerts',
    to: 'To',
    whereTo: 'Where to?',
    dates: 'Dates',
    chooseDates: 'Choose dates',
    pax: 'Passengers',
    paxValue: (n: number) => `${n} passenger${n === 1 ? '' : 's'}`,
    adults: ['Adults', '12 years and over'],
    children: ['Children', '2 to 11 years'],
    fewer: 'Fewer',
    more: 'More',
    cityPlaceholder: 'City or airport code',
    noCity: 'No city with this name.',
    close: 'Close',
    done: 'Done',
    previous: 'Previous month',
    next: 'Next month',
    openModal: 'Open dialog',
    modalTitle: 'Log in or sign up',
    modalBody: 'A dialog is centred on desktop and becomes a bottom sheet on phones.',
    toast: 'Show a toast',
    toastText: 'Destination set to Shiraz.',
    badges: ['Nonstop', 'Recommended', '3 seats left', 'On'],
    cities: [
      ['MHD', 'Mashhad', 'Shahid Hasheminejad Airport'],
      ['SYZ', 'Shiraz', 'Shahid Dastgheib Airport'],
      ['IFN', 'Isfahan', 'Shahid Beheshti Airport'],
      ['KIH', 'Kish', 'Kish International Airport'],
      ['IST', 'Istanbul', 'Istanbul Airport'],
    ],
  },
  fa: {
    search: 'جستجوی پرواز',
    secondary: 'مدیریت رزرو',
    ghost: 'تغییر جستجو',
    tabs: ['رزرو پرواز', 'مدیریت رزرو', 'پذیرش آنلاین', 'وضعیت پرواز'],
    tabsShort: ['رزرو', 'مدیریت', 'پذیرش', 'وضعیت'],
    panel: 'محتوای تب',
    trip: 'نوع سفر',
    round: 'رفت و برگشت',
    oneWay: 'یک‌طرفه',
    promo: 'کد تخفیف دارم',
    points: 'خرید با امتیاز',
    email: 'ایمیل',
    emailBad: 'ایمیل معتبر نیست.',
    ref: 'کد رزرو',
    refHint: 'شش حرف یا رقم، روی بلیت شما.',
    terms: 'شرایط استفاده را می‌پذیرم.',
    sms: 'اعلان پیامکی',
    to: 'مقصد',
    whereTo: 'انتخاب مقصد',
    dates: 'تاریخ سفر',
    chooseDates: 'انتخاب تاریخ',
    pax: 'مسافران',
    paxValue: (n: number) => `${n.toLocaleString('fa-IR')} مسافر`,
    adults: ['بزرگسال', '۱۲ سال به بالا'],
    children: ['کودک', '۲ تا ۱۱ سال'],
    fewer: 'کمتر',
    more: 'بیشتر',
    cityPlaceholder: 'نام شهر یا کد فرودگاه',
    noCity: 'شهری با این نام نیست.',
    close: 'بستن',
    done: 'تأیید',
    previous: 'ماه قبل',
    next: 'ماه بعد',
    openModal: 'باز کردن پنجره',
    modalTitle: 'ورود یا ثبت‌نام',
    modalBody: 'پنجره در دسکتاپ وسط صفحه است و در موبایل از پایین باز می‌شود.',
    toast: 'نمایش پیام',
    toastText: 'مقصد روی «شیراز» تنظیم شد.',
    badges: ['مستقیم', 'پیشنهاد دات', '۳ صندلی مانده', 'فعال'],
    cities: [
      ['MHD', 'مشهد', 'فرودگاه شهید هاشمی‌نژاد'],
      ['SYZ', 'شیراز', 'فرودگاه شهید دستغیب'],
      ['IFN', 'اصفهان', 'فرودگاه شهید بهشتی'],
      ['KIH', 'کیش', 'فرودگاه بین‌المللی کیش'],
      ['IST', 'استانبول', 'فرودگاه استانبول'],
    ],
  },
} as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-block={title} className="border-t border-hairline py-8">
      <h2 dir="ltr" lang="en" className="text-start font-mono text-small text-muted">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ComponentsGallery({ sample }: { sample: 'en' | 'fa' }) {
  const t = COPY[sample];
  const { locale } = useLocale();
  const desktop = useIsDesktop();
  const toast = useToast();
  const [trip, setTrip] = useState<'round' | 'one'>('round');
  const [dest, setDest] = useState<string | null>(null);
  const [destOpen, setDestOpen] = useState(false);
  const [range, setRange] = useState<{ start: DateValue; end: DateValue } | null>(null);
  const [day, setDay] = useState<DateValue | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [email, setEmail] = useState('not-an-email');

  const zone = getLocalTimeZone();
  const short = new DateFormatter(locale, { day: 'numeric', month: 'short' });
  const digits = (n: number) => n.toLocaleString(locale);
  const city = t.cities.find((c) => c[0] === dest);
  const tabIds = ['book', 'manage', 'checkin', 'status'] as const;
  const tabIcons = ['plane', 'bag', 'check-in', 'clock'] as const;

  return (
    <main className="mx-auto max-w-page px-gutter pb-section pt-10">
      <p dir="ltr" lang="en" className="text-start text-small font-bold text-action">
        dot air design system
      </p>
      <h1 dir="ltr" lang="en" className="mt-2 text-start text-heading font-bold text-strong">
        Components
      </h1>

      <div className="mt-8">
        <Block title="Button">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              {t.search}
              <Icon name="arrow" />
            </Button>
            <Button>{t.search}</Button>
            <Button size="sm">{t.search}</Button>
            <Button variant="secondary">{t.secondary}</Button>
            <Button variant="ghost">{t.ghost}</Button>
            <Button isPending aria-label={t.search}>
              {t.search}
            </Button>
            <Button isDisabled>{t.search}</Button>
            <IconButton aria-label={t.close}>
              <Icon name="close" size={18} />
            </IconButton>
          </div>
        </Block>

        <Block title="Icon">
          <ul className="flex flex-wrap gap-3 text-soft">
            {ICON_NAMES.map((name) => (
              <li
                key={name}
                title={name}
                className="flex size-11 items-center justify-center rounded-control border border-hairline"
              >
                <Icon name={name} />
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>{t.badges[0]}</Badge>
            <Badge tone="action">{t.badges[1]}</Badge>
            <Badge tone="danger">{t.badges[2]}</Badge>
            <Badge tone="success">{t.badges[3]}</Badge>
          </div>
        </Block>

        <Block title="Tabs">
          <Card surface="raised" padding="none" className="p-2.5">
            <Tabs>
              <TabList
                aria-label={t.tabs[0]}
                items={tabIds.map((id, i) => ({
                  id,
                  label: t.tabs[i] ?? id,
                  shortLabel: t.tabsShort[i],
                  icon: <Icon name={tabIcons[i] ?? 'plane'} size={18} />,
                }))}
              />
              {tabIds.map((id, i) => (
                <TabPanel key={id} id={id} className="px-2 pb-2 pt-4 text-small text-muted">
                  {t.panel} «{t.tabs[i]}»
                </TabPanel>
              ))}
            </Tabs>
          </Card>
        </Block>

        <Block title="SegmentedControl · ToggleChip">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              aria-label={t.trip}
              value={trip}
              onChange={setTrip}
              options={[
                { id: 'round', label: t.round },
                { id: 'one', label: t.oneWay },
              ]}
            />
            <ToggleChip>{t.promo}</ToggleChip>
            <ToggleChip defaultSelected>{t.points}</ToggleChip>
          </div>
        </Block>

        <Block title="TextField · Checkbox · Switch">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label={t.email}
              code
              value={email}
              onChange={setEmail}
              isInvalid={!email.includes('@')}
              errorMessage={t.emailBad}
            />
            <TextField label={t.ref} description={t.refHint} placeholder="ABC123" code />
            <Checkbox>{t.terms}</Checkbox>
            <Switch defaultSelected>{t.sms}</Switch>
          </div>
        </Block>

        <Block title="FieldButton · ResponsiveOverlay · SearchList · RangeCalendar · Stepper">
          <Card
            surface={1}
            padding="none"
            className="flex flex-col divide-y divide-hairline md:flex-row md:divide-x md:divide-y-0 rtl:md:divide-x-reverse"
          >
            <DialogTrigger isOpen={destOpen} onOpenChange={setDestOpen}>
              <FieldButton
                label={t.to}
                placeholder={t.whereTo}
                value={
                  city ? (
                    <>
                      <span>{city[1]}</span>
                      <span dir="ltr" className="font-mono text-caption font-normal text-muted">
                        {city[0]}
                      </span>
                    </>
                  ) : undefined
                }
              />
              <ResponsiveOverlay title={t.to} closeLabel={t.close} className="w-95">
                <SearchList
                  aria-label={t.to}
                  placeholder={t.cityPlaceholder}
                  emptyMessage={t.noCity}
                  autoFocus={desktop}
                  selectedId={dest}
                  onSelect={(id) => {
                    setDest(id);
                    setDestOpen(false);
                  }}
                  items={t.cities.map(([code, name, airport]) => ({
                    id: code,
                    title: name,
                    description: airport,
                    code,
                    keywords: code,
                    icon: <Icon name="pin" size={18} />,
                  }))}
                />
              </ResponsiveOverlay>
            </DialogTrigger>

            <DialogTrigger>
              <FieldButton
                label={t.dates}
                placeholder={t.chooseDates}
                value={
                  range
                    ? `${short.format(range.start.toDate(zone))} – ${short.format(range.end.toDate(zone))}`
                    : undefined
                }
              />
              <ResponsiveOverlay title={t.dates} closeLabel={t.close}>
                {(close) => (
                  <div className="flex flex-col items-center gap-4">
                    <RangeCalendar
                      aria-label={t.dates}
                      months={desktop ? 2 : 1}
                      minValue={today(zone)}
                      value={range}
                      onChange={setRange}
                      previousLabel={t.previous}
                      nextLabel={t.next}
                    />
                    <Button size="sm" onPress={close} className="self-end">
                      {t.done}
                    </Button>
                  </div>
                )}
              </ResponsiveOverlay>
            </DialogTrigger>

            <DialogTrigger>
              <FieldButton label={t.pax} value={t.paxValue(adults + children)} />
              <ResponsiveOverlay
                title={t.pax}
                closeLabel={t.close}
                className="w-90"
                placement="bottom end"
              >
                {(close) => (
                  <div className="flex flex-col">
                    <Stepper
                      label={t.adults[0]}
                      description={t.adults[1]}
                      value={adults}
                      onChange={setAdults}
                      min={1}
                      max={9 - children}
                      decrementLabel={`${t.fewer}: ${t.adults[0]}`}
                      incrementLabel={`${t.more}: ${t.adults[0]}`}
                      format={digits}
                    />
                    <Stepper
                      label={t.children[0]}
                      description={t.children[1]}
                      value={children}
                      onChange={setChildren}
                      max={9 - adults}
                      decrementLabel={`${t.fewer}: ${t.children[0]}`}
                      incrementLabel={`${t.more}: ${t.children[0]}`}
                      format={digits}
                    />
                    <Button size="sm" onPress={close} className="mt-3 self-end">
                      {t.done}
                    </Button>
                  </div>
                )}
              </ResponsiveOverlay>
            </DialogTrigger>
          </Card>
        </Block>

        <Block title="Calendar">
          <Card className="w-fit">
            <Calendar
              aria-label={t.dates}
              minValue={today(zone)}
              value={day}
              onChange={setDay}
              previousLabel={t.previous}
              nextLabel={t.next}
            />
          </Card>
        </Block>

        <Block title="Modal · Toast">
          <div className="flex flex-wrap gap-3">
            <DialogTrigger>
              <Button variant="secondary">{t.openModal}</Button>
              <Modal title={t.modalTitle} closeLabel={t.close}>
                {(close) => (
                  <>
                    <p className="text-small text-muted">{t.modalBody}</p>
                    <TextField label={t.email} code autoFocus />
                    <Button fullWidth onPress={close}>
                      {t.done}
                    </Button>
                  </>
                )}
              </Modal>
            </DialogTrigger>
            <Button variant="secondary" onPress={() => toast.show(t.toastText)}>
              {t.toast}
            </Button>
          </div>
        </Block>

        <Block title="Card · Skeleton">
          <div className="grid gap-4 md:grid-cols-3">
            <Card surface={1}>surface 1</Card>
            <Card>surface 2</Card>
            <Card surface="raised" className="flex flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </Card>
          </div>
        </Block>
      </div>
    </main>
  );
}
