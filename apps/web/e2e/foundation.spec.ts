import { expect, test, type Page } from '@playwright/test';

/**
 * Foundation checks for the redesign:
 * - the redesigned routes use the design tokens and nothing from the default Tailwind palette;
 * - the current site keeps its own stylesheet and is not affected;
 * - both directions render without horizontal overflow.
 */

const bodyBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

const cssVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

for (const { locale, dir } of [
  { locale: 'fa-ir', dir: 'rtl' },
  { locale: 'en-de', dir: 'ltr' },
] as const) {
  test.describe(locale, () => {
    test('redesigned routes use the design tokens', async ({ page }) => {
      await page.goto(`/${locale}/next/design-system`);
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await bodyBackground(page)).toBe('rgb(19, 17, 18)');
      expect(await cssVar(page, '--color-canvas')).not.toBe('');
      // The default palette is switched off here, so its variables do not exist.
      expect(await cssVar(page, '--color-neutral-100')).toBe('');
      expect(await cssVar(page, '--color-red-500')).toBe('');
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test('current site keeps its own stylesheet', async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
      expect(await bodyBackground(page)).toBe('rgb(255, 255, 255)');
      expect(await cssVar(page, '--color-neutral-100')).not.toBe('');
      // Design tokens of the redesign must not leak into the current site.
      expect(await cssVar(page, '--color-canvas')).toBe('');
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });
}

test('every swatch on the token page resolves to a colour', async ({ page }) => {
  await page.goto('/en-de/next/design-system');
  const transparent = await page.evaluate(
    () =>
      [...document.querySelectorAll('main li > span:first-child')].filter((el) => {
        const s = getComputedStyle(el);
        return el.className.includes('bg-') && s.backgroundColor === 'rgba(0, 0, 0, 0)';
      }).length,
  );
  expect(transparent).toBe(0);
});
