import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * The home page (`/[locale]`), in a right-to-left and a left-to-right locale, on
 * the desktop and phone projects of playwright.config.ts.
 */

const COPY = {
  'en-de': {
    dir: 'ltr',
    to: 'To',
    from: 'From',
    depart: 'Depart',
    returnLabel: 'Return',
    addReturn: 'Add return',
    passengers: 'Passengers',
    search: 'Search flights',
    oneWay: 'One way',
    swap: 'Swap origin and destination',
    swapFirst: 'Choose a destination first.',
    shiraz: 'Shiraz',
    tehran: 'Tehran',
    mashhad: 'Mashhad',
    kish: 'Kish',
    moreAdults: 'More: Adults',
    moreInfants: 'More: Infants',
    done: 'Done',
    manageTab: /Manage/,
    manageNav: 'Manage booking',
    trips: 'Trips',
    findBooking: 'Find booking',
    reference: 'Booking reference or ticket number',
    lastName: 'Last name',
    required: 'Enter: Booking reference or ticket number.',
    notConnected: 'This service is not connected yet in this preview build.',
    destinationSet: 'Destination set to Kish.',
    flyTo: 'Fly to Kish',
    year: /20\d\d/,
  },
  'fa-ir': {
    dir: 'rtl',
    to: 'مقصد',
    from: 'مبدأ',
    depart: 'رفت',
    returnLabel: 'برگشت',
    addReturn: 'افزودن برگشت',
    passengers: 'مسافران',
    search: 'جستجوی پرواز',
    oneWay: 'یک‌طرفه',
    swap: 'جابه‌جایی مبدأ و مقصد',
    swapFirst: 'ابتدا مقصد را انتخاب کنید.',
    shiraz: 'شیراز',
    tehran: 'تهران',
    mashhad: 'مشهد',
    kish: 'کیش',
    moreAdults: 'اضافه کردن بزرگسال',
    moreInfants: 'اضافه کردن نوزاد',
    done: 'تأیید',
    manageTab: /مدیریت/,
    manageNav: 'مدیریت رزرو',
    trips: 'سفرها',
    findBooking: 'نمایش رزرو',
    reference: 'کد رزرو یا شماره بلیت',
    lastName: 'نام خانوادگی',
    required: 'کد رزرو یا شماره بلیت را وارد کنید.',
    notConnected: 'این سرویس در این نسخه‌ی پیش‌نمایش هنوز وصل نشده است.',
    destinationSet: 'مقصد روی «کیش» تنظیم شد.',
    flyTo: 'پرواز به کیش',
    year: /۱[۴۵][۰-۹]{2}/,
  },
} as const;

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

/** Local calendar date `days` from today, as the booking form computes it. */
const isoFromToday = (page: Page, days: number) =>
  page.evaluate((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, days);

/** The page is static HTML; the form is ready once the dates have been filled in on the client. */
async function openHome(page: Page, locale: string) {
  await page.goto(`/${locale}`);
  await expect(page.locator('#book [data-cell="dates"] button').first()).toContainText(/\d|[۰-۹]/);
}

const card = (page: Page) => page.locator('#book');
const field = (page: Page, label: string) =>
  card(page).getByRole('button', { name: new RegExp(`^${label}(\\s|$)`) });

for (const locale of ['fa-ir', 'en-de'] as const) {
  const t = COPY[locale];

  test.describe(`home ${locale}`, () => {
    test('renders in the right direction, fits the viewport and passes axe', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      page.on('console', (message) => {
        // The Latin font files are not in the repository yet; that 404 is known.
        if (message.type() === 'error' && !/404/.test(message.text())) errors.push(message.text());
      });
      await openHome(page, locale);
      await expect(page.locator('html')).toHaveAttribute('dir', t.dir);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);

      // Mirroring: the brand sits at the reading start of the header.
      const brand = await page.locator('header a').first().boundingBox();
      const width = page.viewportSize()?.width ?? 0;
      expect(brand).not.toBeNull();
      if (brand) expect(brand.x + brand.width / 2 > width / 2).toBe(t.dir === 'rtl');

      // Entrance animations fade text in; contrast is only meaningful once they have finished.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished),
        ),
      );
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 120)).join(' | ')}`,
        ),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });

    test('the search form is reachable without scrolling', async ({ page }) => {
      await openHome(page, locale);
      const height = page.viewportSize()?.height ?? 0;
      const from = await field(page, t.from).boundingBox();
      expect(from).not.toBeNull();
      if (from) expect(from.y + from.height).toBeLessThan(height);
    });

    test('shows no prices anywhere', async ({ page }) => {
      await openHome(page, locale);
      const text = await page.locator('main').innerText();
      expect(text).not.toMatch(/[€$£]|تومان|ریال|\bIRR\b|\bEUR\b|\bUSD\b/);
    });

    test('searching without a destination asks for one', async ({ page }) => {
      await openHome(page, locale);
      await card(page).getByRole('button', { name: t.search }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('option').first()).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/${locale}`));
    });

    test('a complete search opens the results with the right query', async ({ page }) => {
      await openHome(page, locale);
      await field(page, t.to).click();
      await page
        .getByRole('dialog')
        .getByRole('option', { name: new RegExp(t.shiraz) })
        .click();
      await expect(field(page, t.to)).toContainText('SYZ');

      await card(page).getByRole('button', { name: t.search }).click();
      await page.waitForURL(/\/book\/search\?/);
      const url = new URL(page.url());
      expect(url.pathname).toBe(`/${locale}/book/search`);
      expect(Object.fromEntries(url.searchParams)).toEqual({
        tripType: 'ROUND_TRIP',
        from: 'THR',
        to: 'SYZ',
        depart: await isoFromToday(page, 7),
        return: await isoFromToday(page, 10),
        adults: '1',
        cabin: 'ECONOMY',
      });
    });

    test('the destination can be changed after it was chosen', async ({ page }) => {
      await openHome(page, locale);
      await field(page, t.to).click();
      await page
        .getByRole('dialog')
        .getByRole('option', { name: new RegExp(t.shiraz) })
        .click();
      await expect(field(page, t.to)).toContainText('SYZ');
      await field(page, t.to).click();
      await page
        .getByRole('dialog')
        .getByRole('option', { name: new RegExp(t.mashhad) })
        .click();
      await expect(field(page, t.to)).toContainText('MHD');
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    test('one way drops the return date', async ({ page }) => {
      await openHome(page, locale);
      await card(page).getByRole('radio', { name: t.oneWay }).click();
      await expect(field(page, t.returnLabel)).toContainText(t.addReturn);
      await field(page, t.to).click();
      await page
        .getByRole('dialog')
        .getByRole('option', { name: new RegExp(t.mashhad) })
        .click();
      await card(page).getByRole('button', { name: t.search }).click();
      await page.waitForURL(/\/book\/search\?/);
      const params = new URL(page.url()).searchParams;
      expect(params.get('tripType')).toBe('ONE_WAY');
      expect(params.has('return')).toBe(false);
    });

    test('any city can be the origin, and the other end stays free', async ({ page }) => {
      await openHome(page, locale);
      await field(page, t.from).click();
      await page
        .getByRole('dialog')
        .getByRole('option', { name: new RegExp(t.shiraz) })
        .click();
      await expect(field(page, t.from)).toContainText('SYZ');
      await field(page, t.to).click();
      const options = page.getByRole('dialog').getByRole('option');
      await expect(options.filter({ hasText: t.shiraz })).toHaveCount(0);
      await options.filter({ hasText: t.mashhad }).click();
      await expect(field(page, t.to)).toContainText('MHD');
    });

    test('swap needs a destination first', async ({ page }) => {
      await openHome(page, locale);
      await card(page).getByRole('button', { name: t.swap }).click();
      await expect(page.getByRole('status').filter({ hasText: t.swapFirst })).toBeVisible();
    });

    test('infants never outnumber adults', async ({ page }) => {
      await openHome(page, locale);
      await field(page, t.passengers).click();
      const dialog = page.getByRole('dialog');
      const moreInfants = dialog.getByRole('button', { name: t.moreInfants });
      await moreInfants.click();
      await expect(moreInfants).toBeDisabled();
      await dialog.getByRole('button', { name: t.moreAdults }).click();
      await expect(moreInfants).toBeEnabled();
    });

    test('the calendar follows the locale', async ({ page }) => {
      await openHome(page, locale);
      await field(page, t.depart).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('[aria-hidden]', { hasText: t.year }).first()).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
      const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });

    test('manage booking validates, then says the service is not connected', async ({ page }) => {
      await openHome(page, locale);
      await card(page).getByRole('tab', { name: t.manageTab }).click();
      const panel = card(page).getByRole('tabpanel');
      await panel.getByRole('button', { name: t.findBooking }).click();
      await expect(panel.getByRole('status')).toHaveText(t.required);
      await panel.getByLabel(t.reference).fill('ABC123');
      await panel.getByLabel(t.lastName).fill('Test');
      await panel.getByRole('button', { name: t.findBooking }).click();
      await expect(panel.getByRole('status')).toHaveText(t.notConnected);
    });

    test('a destination tile fills the form', async ({ page }) => {
      await openHome(page, locale);
      await page.getByRole('button', { name: new RegExp(`KIH.*${t.kish}`) }).click();
      await expect(field(page, t.to)).toContainText('KIH');
      await expect(page.getByRole('status').filter({ hasText: t.destinationSet })).toBeVisible();
    });

    test('the network list drives the route details', async ({ page }) => {
      await openHome(page, locale);
      const routes = page.locator('#routes');
      await routes.scrollIntoViewIfNeeded();
      await routes.getByRole('button', { name: new RegExp(`^${t.kish}`) }).click();
      await expect(routes.getByRole('button', { name: t.flyTo })).toBeVisible();
      await expect(routes.getByText('THR → KIH')).toBeVisible();
      await routes.getByRole('button', { name: t.flyTo }).click();
      await expect(field(page, t.to)).toContainText('KIH');
    });

    test('navigation switches the booking card tab', async ({ page, isMobile, viewport }) => {
      await openHome(page, locale);
      const phone = isMobile || (viewport?.width ?? 0) < 701;
      const link = phone
        ? page.getByRole('navigation').last().getByRole('link', { name: t.trips })
        : page.getByRole('banner').getByRole('link', { name: t.manageNav });
      await link.click();
      await expect(card(page).getByRole('tab', { name: t.manageTab })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    });
  });
}

for (const locale of ['de-de', 'ar-ae'] as const) {
  test(`home ${locale} renders every message and fits the viewport`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error' && !/404/.test(message.text())) errors.push(message.text());
    });
    await openHome(page, locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('with reduced motion the hero still paints one settled frame', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await openHome(page, 'fa-ir');
  const colours = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const cx = canvas?.getContext('2d');
    if (!canvas || !cx) return 0;
    const seen = new Set<string>();
    for (let x = 0.1; x < 1; x += 0.2) {
      const [r, g, b] = cx.getImageData(
        Math.floor(canvas.width * x),
        Math.floor(canvas.height * 0.2),
        1,
        1,
      ).data;
      seen.add(`${r},${g},${b}`);
    }
    return seen.size;
  });
  expect(colours).toBeGreaterThan(1);
  await context.close();
});
