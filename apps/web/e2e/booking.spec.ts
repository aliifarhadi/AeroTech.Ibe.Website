import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Search results (fares, seats, flight details, trip summary) and the account flows. */

const COPY = {
  'en-de': {
    details: 'Flight details',
    terminal: 'Terminal 4',
    flex: 'Choose Flex',
    selected: 'Selected',
    select: 'Select this flight',
    outboundDone: 'Outbound selected. Now choose your return flight.',
    continue: /^Continue/,
    nextStep: 'Passenger details are the next step and are not built yet.',
    invalid: 'We could not read this search',
    childExit: 'Children cannot sit in an emergency exit row. Choose another seat.',
    child: 'Child 1',
    login: 'Log in',
    code: 'Send me a code',
    wrong: 'That code is not right. Try again.',
    create: 'Create account',
    first: 'First name',
    last: 'Last name',
    terms: 'I accept the terms of use and the privacy policy.',
    name: 'Sara',
    account: /^Account: Sara/,
    profile: 'My profile',
    setPassword: 'Set password',
    newPassword: 'New password',
    repeat: 'Repeat password',
    save: 'Save password',
    logout: 'Log out',
    passwordTab: 'Password',
    identifier: 'Mobile number or email',
  },
  'fa-ir': {
    details: 'جزئیات پرواز',
    terminal: 'ترمینال ۴',
    flex: 'انتخاب منعطف',
    selected: 'انتخاب شد',
    select: 'انتخاب این پرواز',
    outboundDone: 'پرواز رفت انتخاب شد. حالا پرواز برگشت را انتخاب کنید.',
    continue: /^ادامه/,
    nextStep: 'صفحه‌ی اطلاعات مسافران قدم بعدی است و هنوز ساخته نشده.',
    invalid: 'این جستجو خوانده نشد',
    childExit: 'کودکان نمی‌توانند در ردیف خروج اضطراری بنشینند. صندلی دیگری انتخاب کنید.',
    child: 'کودک ۱',
    login: 'ورود',
    code: 'دریافت کد تأیید',
    wrong: 'کد نادرست است. دوباره تلاش کنید.',
    create: 'ساخت حساب',
    first: 'نام',
    last: 'نام خانوادگی',
    terms: 'شرایط استفاده و سیاست حریم خصوصی را می‌پذیرم.',
    name: 'سارا',
    account: /^حساب کاربری: سارا/,
    profile: 'پروفایل من',
    setPassword: 'تنظیم رمز',
    newPassword: 'رمز عبور جدید',
    repeat: 'تکرار رمز عبور',
    save: 'ذخیره‌ی رمز عبور',
    logout: 'خروج',
    passwordTab: 'رمز عبور',
    identifier: 'شماره موبایل یا ایمیل',
  },
} as const;

const iso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const search = (extra = '') =>
  `tripType=ROUND_TRIP&from=THR&to=MHD&depart=${iso(7)}&return=${iso(10)}&adults=1&children=1&cabin=ECONOMY${extra}`;

async function openResults(page: Page, locale: string, query = search()) {
  await page.goto(`/${locale}/book/search?${query}`);
  await expect(page.locator('article').first()).toBeVisible();
}

/** The one visible primary action: in the summary on desktop, in the bottom bar on phones. */
const action = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name }).filter({ visible: true }).last();

for (const locale of ['fa-ir', 'en-de'] as const) {
  const t = COPY[locale];

  test.describe(`results ${locale}`, () => {
    test('lists flights, fits the viewport and passes axe', async ({ page }) => {
      await openResults(page, locale);
      expect(await page.locator('article').count()).toBeGreaterThanOrEqual(5);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      ).toBe(false);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 120)).join(' | ')}`,
        ),
      ).toEqual([]);
    });

    test('an unreadable search says so', async ({ page }) => {
      await page.goto(`/${locale}/book/search?from=THR&to=THR`);
      await expect(page.getByRole('heading', { name: t.invalid })).toBeVisible();
    });

    test('flight details show airports and terminals', async ({ page }) => {
      await openResults(page, locale);
      const card = page.locator('article').first();
      await card.getByRole('button', { name: t.details }).click();
      await expect(card.locator('.fl-timeline')).toContainText(t.terminal);
      await expect(card.locator('.fl-timeline')).toContainText('MHD');
    });

    test('fares, seats and both legs lead to a total and the next step', async ({ page }) => {
      await openResults(page, locale);
      const card = page.locator('article').first();
      await card.locator('.fl-row > button').first().click();
      await expect(card.getByRole('button', { name: t.selected })).toBeVisible();
      await expect(card.locator('.fl-fares > div')).toHaveCount(3);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      ).toBe(false);
      const scan = await new AxeBuilder({ page }).analyze();
      expect(
        scan.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 120)).join(' | ')}`,
        ),
      ).toEqual([]);

      await card.getByRole('button', { name: t.flex }).click();
      await expect(card.getByRole('button', { name: t.selected })).toHaveCount(1);

      // The aircraft has doors, wings and an exit row; a seat takes the active traveller's number.
      await expect(card.locator('.fl-door')).toHaveCount(8);
      await expect(card.locator('.fl-wing')).toHaveCount(2);
      const seat = card.locator('.fl-seat:not(:disabled)').first();
      await seat.click();
      await expect(seat).toHaveAttribute('aria-pressed', 'true');
      await expect(seat).toHaveText('1');

      await action(page, t.select).click();
      await expect(page.getByRole('status').filter({ hasText: t.outboundDone })).toBeVisible();

      const back = page.locator('article').first();
      await back.locator('.fl-row > button').first().click();
      await action(page, t.select).click();
      await action(page, t.continue).click();
      await expect(page.getByRole('status').filter({ hasText: t.nextStep })).toBeVisible();
    });

    test('children cannot take an exit-row seat', async ({ page }) => {
      await openResults(page, locale);
      const cards = page.locator('article');
      for (let i = 0; i < (await cards.count()); i++) {
        const card = cards.nth(i);
        await card.locator('.fl-row > button').first().click();
        const exit = card.locator(
          '.fl-seat[data-seat^="11"]:not(:disabled), .fl-seat[data-seat^="12"]:not(:disabled)',
        );
        if ((await exit.count()) === 0) continue;
        await card.getByRole('button', { name: new RegExp(t.child) }).click();
        await exit.first().click();
        await expect(card.getByRole('alert')).toHaveText(t.childExit);
        await expect(exit.first()).toHaveAttribute('aria-pressed', 'false');
        return;
      }
      test.skip(true, 'No free exit-row seat in the sample data for this date.');
    });

    test('another day in the ribbon updates the address', async ({ page }) => {
      await openResults(page, locale);
      const next = page.locator('.home-rail [aria-pressed="true"] + button').first();
      await next.click();
      await expect(page).toHaveURL(new RegExp(`depart=${iso(8)}`));
    });
  });

  test.describe(`account ${locale}`, () => {
    test('sign up with a code, set a password, log out and log in with it', async ({
      page,
      viewport,
    }) => {
      const phone = (viewport?.width ?? 0) < 701;
      await page.goto(`/${locale}`);
      const open = phone
        ? page.getByRole('navigation').last().getByRole('button')
        : page.getByRole('banner').getByRole('button', { name: t.login });
      await open.click();
      const dialog = page.getByRole('dialog');

      // A wrong code is rejected, then any other code is accepted in this build.
      await dialog.getByLabel(t.identifier).fill('09123456789');
      await dialog.getByRole('button', { name: t.code }).click();
      await page.keyboard.type('00000');
      await expect(dialog.getByRole('alert')).toHaveText(t.wrong);
      await page.keyboard.type('12345');

      await dialog.getByLabel(t.first, { exact: true }).fill(t.name);
      await dialog.getByLabel(t.last, { exact: true }).fill('Test');
      await dialog.getByText(t.terms).click();
      const scan = await new AxeBuilder({ page }).disableRules(['region']).analyze();
      expect(scan.violations.map((v) => v.id)).toEqual([]);
      await dialog.getByRole('button', { name: t.create }).click();
      await expect(dialog).toBeHidden();

      if (!phone) {
        await page.getByRole('banner').getByRole('button', { name: t.account }).click();
        await page.getByRole('link', { name: t.profile }).click();
      }
      await expect(page).toHaveURL(new RegExp(`/${locale}/account$`));
      await expect(page.getByRole('heading', { level: 1 })).toContainText(t.name);

      await page.getByRole('button', { name: t.setPassword }).click();
      await dialog.getByLabel(t.newPassword).fill('secret123');
      await dialog.getByLabel(t.repeat).fill('secret123');
      await dialog.getByRole('button', { name: t.save }).click();
      await expect(dialog).toBeHidden();

      await page.getByRole('main').getByRole('button', { name: t.logout }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));

      await open.click();
      await dialog.getByRole('radio', { name: t.passwordTab }).click();
      await dialog.getByLabel(t.identifier).fill('0912 345 6789');
      await dialog.getByLabel(t.passwordTab, { exact: true }).fill('secret123');
      await dialog.getByRole('button', { name: t.login, exact: true }).click();
      await expect(dialog).toBeHidden();
      if (!phone)
        await expect(
          page.getByRole('banner').getByRole('button', { name: t.account }),
        ).toBeVisible();
    });
  });
}

test('pages that are not built yet say so, and unknown pages are 404', async ({ page }) => {
  await page.goto('/en-de/baggage');
  await expect(page.getByRole('heading', { name: 'This page is on its way' })).toBeVisible();
  const missing = await page.goto('/en-de/no-such-page');
  expect(missing?.status()).toBe(404);
});
