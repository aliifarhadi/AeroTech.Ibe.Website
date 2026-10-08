import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Behaviour of the design-system primitives, exercised on the reference page in both directions
 * and on both viewports (see playwright.config.ts): keyboard, focus, overlays, calendars, and an
 * automated accessibility scan of the page at rest and with each overlay open.
 */

const COPY = {
  'en-de': {
    dir: 'ltr',
    tabs: ['Book a flight', 'Manage booking'],
    tabsShort: ['Book', 'Manage'],
    round: 'Round trip',
    oneWay: 'One way',
    to: 'To',
    cityPlaceholder: 'City or airport code',
    query: 'shi',
    city: 'Shiraz',
    noCity: 'No city with this name.',
    dates: 'Dates',
    done: 'Done',
    pax: 'Passengers',
    moreAdults: 'More: Adults',
    fewerAdults: 'Fewer: Adults',
    moreChildren: 'More: Children',
    paxValue: (n: number) => `${n} passenger${n === 1 ? '' : 's'}`,
    openModal: 'Open dialog',
    modalTitle: 'Log in or sign up',
    toast: 'Show a toast',
    toastText: 'Destination set to Shiraz.',
    year: /20\d\d/,
  },
  'fa-ir': {
    dir: 'rtl',
    tabs: ['رزرو پرواز', 'مدیریت رزرو'],
    tabsShort: ['رزرو', 'مدیریت'],
    round: 'رفت و برگشت',
    oneWay: 'یک‌طرفه',
    to: 'مقصد',
    cityPlaceholder: 'نام شهر یا کد فرودگاه',
    query: 'شیر',
    city: 'شیراز',
    noCity: 'شهری با این نام نیست.',
    dates: 'تاریخ سفر',
    done: 'تأیید',
    pax: 'مسافران',
    moreAdults: 'بیشتر: بزرگسال',
    fewerAdults: 'کمتر: بزرگسال',
    moreChildren: 'بیشتر: کودک',
    paxValue: (n: number) => `${n.toLocaleString('fa-IR')} مسافر`,
    openModal: 'باز کردن پنجره',
    modalTitle: 'ورود یا ثبت‌نام',
    toast: 'نمایش پیام',
    toastText: 'مقصد روی «شیراز» تنظیم شد.',
    // Persian calendar years, in Persian digits (۱۴۰۵, …).
    year: /۱[۴۵][۰-۹]{2}/,
  },
} as const;

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

/**
 * `overlayOpen`: React Aria portals overlays to the end of <body>, outside the page landmarks by
 * design, so the best-practice `region` rule does not apply while one is open.
 */
const expectNoViolations = async (page: Page, { overlayOpen = false } = {}) => {
  const results = await new AxeBuilder({ page })
    .disableRules(overlayOpen ? ['region'] : [])
    .analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
  ).toEqual([]);
};

for (const locale of ['fa-ir', 'en-de'] as const) {
  const t = COPY[locale];

  test.describe(`components ${locale}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/design-system/components`);
      await expect(page.locator('html')).toHaveAttribute('dir', t.dir);
      // Wait for hydration, otherwise an early key press reaches markup without handlers.
      await page.waitForFunction(() => {
        const tab = document.querySelector('[role="tab"]');
        return !!tab && Object.keys(tab).some((key) => key.startsWith('__reactFiber'));
      });
    });

    test('page is accessible, fits the viewport and logs no errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
      await expectNoViolations(page);
      expect(errors).toEqual([]);
    });

    test('tabs follow the arrow keys in reading direction', async ({ page }) => {
      const tabs = page.getByRole('tab');
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(0)).toHaveText(new RegExp(`${t.tabs[0]}|${t.tabsShort[0]}`));
      await tabs.nth(0).focus();
      await page.keyboard.press(t.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toContainText(t.tabs[1]);
    });

    test('segmented control keeps exactly one option selected', async ({ page }) => {
      const round = page.getByRole('radio', { name: t.round });
      const oneWay = page.getByRole('radio', { name: t.oneWay });
      await expect(round).toBeChecked();
      await oneWay.click();
      await expect(oneWay).toBeChecked();
      await expect(round).not.toBeChecked();
      await oneWay.click();
      await expect(oneWay).toBeChecked();
    });

    test('destination list filters, selects and closes', async ({ page }) => {
      const field = page.getByRole('button', { name: new RegExp(`^${t.to}\\s`) });
      await field.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expectNoViolations(page, { overlayOpen: true });

      const search = dialog.getByPlaceholder(t.cityPlaceholder);
      await search.fill('zzzz');
      await expect(dialog.getByText(t.noCity)).toBeVisible();
      await search.fill(t.query);
      await expect(dialog.getByRole('option')).toHaveCount(1);
      await dialog.getByRole('option', { name: new RegExp(t.city) }).click();

      await expect(dialog).toBeHidden();
      await expect(field).toContainText(t.city);
      await expect(field).toContainText('SYZ');
    });

    test('range calendar uses the calendar of the locale and selects a range', async ({
      page,
      viewport,
    }) => {
      const field = page.getByRole('button', { name: new RegExp(`^${t.dates}`) });
      await field.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      // One title per visible month, in the calendar of the locale.
      const titles = dialog.locator('[aria-hidden]', { hasText: t.year });
      await expect(titles).toHaveCount(viewport && viewport.width > 700 ? 2 : 1);
      expect(await hasHorizontalOverflow(page)).toBe(false);
      await expectNoViolations(page, { overlayOpen: true });

      const days = dialog.locator('[role="gridcell"] [role="button"]:not([aria-disabled="true"])');
      await days.nth(1).click();
      await days.nth(4).click();
      await expect(dialog.locator('[data-selected]')).toHaveCount(4);
      await dialog.getByRole('button', { name: t.done }).click();
      await expect(dialog).toBeHidden();
      await expect(field).toContainText('–');
    });

    test('passenger steppers respect their bounds', async ({ page }) => {
      const field = page.getByRole('button', { name: new RegExp(`^${t.pax}`) });
      await field.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('button', { name: t.fewerAdults })).toBeDisabled();

      const moreAdults = dialog.getByRole('button', { name: t.moreAdults });
      for (let i = 0; i < 8; i++) await moreAdults.click();
      await expect(moreAdults).toBeDisabled();
      // Nine travellers in total: no room left for a child.
      await expect(dialog.getByRole('button', { name: t.moreChildren })).toBeDisabled();

      await dialog.getByRole('button', { name: t.done }).click();
      await expect(field).toContainText(t.paxValue(9));
    });

    test('dialog traps focus, closes on Escape and returns focus', async ({ page }) => {
      const trigger = page.getByRole('button', { name: t.openModal });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: t.modalTitle });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('textbox')).toBeFocused();
      await expectNoViolations(page, { overlayOpen: true });

      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('toast is announced politely', async ({ page }) => {
      await page.getByRole('button', { name: t.toast }).click();
      const status = page.getByRole('status');
      await expect(status).toContainText(t.toastText);
      await expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });
}
