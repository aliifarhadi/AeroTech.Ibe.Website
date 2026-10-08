# جایگزینی طراحی و ساخت دیزاین‌سیستم — نقشه‌ی اجرا

این سند می‌گوید طراحی نسخه‌ی ۶ چطور وارد ریپو شود و دیزاین‌سیستم چطور ساخته شود. پرامپت‌ها انگلیسی‌اند تا مستقیم به Claude Code داده شوند.

## وضعیت اجرا

| مرحله                        | وضعیت                                               |
| ---------------------------- | --------------------------------------------------- |
| ۱. پایه                      | انجام شد (شاخه‌ی `claude/design-system-foundation`) |
| ۲. کامپوننت‌های پایه         | بعدی                                                |
| ۳. صفحه‌ی خانه               | —                                                   |
| ۴. نتایج جستجو و حساب کاربری | —                                                   |
| ۵. سوییچ و پاک‌سازی          | —                                                   |

**تفاوت مرحله‌ی ۱ با متن پایین:** به‌جای خاموش کردن پالت پیش‌فرض برای کل سایت و نگه داشتن کلاس‌های قدیمی در `legacy.css`، طرح جدید یک root layout جدا دارد (`app/(next)`) با استایل‌شیت خودش (`next.css`). سایت فعلی به `app/(site)` منتقل شد و استایل‌شیتش دست نخورد؛ این دو هیچ‌وقت در یک سند بار نمی‌شوند. نتیجه: صفحه‌های فعلی پیکسل‌به‌پیکسل همان‌اند و `legacy.css` لازم نیست. Storybook به مرحله‌ی ۲ رفت؛ فعلاً صفحه‌ی `/[locale]/next/design-system` مرجع زنده‌ی توکن‌هاست.

## وضعیت فعلی ریپو (اندازه‌گیری‌شده روی commit `524771f`)

| موضوع                                                      | وضعیت                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/ui`                                              | خالی است؛ فقط تابع `cn` دارد                                                                    |
| کامپوننت‌های پایه                                          | چهار فایل در `apps/web/src/components/ui`                                                       |
| توکن‌ها                                                    | داخل `apps/web/src/app/globals.css` (۳۶۲ خط، تم روشن، ۱۲ keyframe پراکنده)                      |
| کلاس‌های رنگ خام Tailwind (`bg-neutral-100`، `bg-white` …) | ۵۲۱ مورد (کل پروژه ۴۴ فایل `tsx` دارد)                                                          |
| مقدارهای دلخواه (`h-[3.25rem]`، `rounded-[var(--…)]`)      | ۱۳۸ مورد                                                                                        |
| کلاس‌های فیزیکی (`ml-`، `pl-`، `left-`)                    | صفر — این بخش سالم است                                                                          |
| ویجت رزرو                                                  | چهار فایل دست‌ساز، ۱۱۳۳ خط (`date-range-picker` به‌تنهایی ۳۸۴ خط)                               |
| صفحه‌ی خانه                                                | دو نسخه (`features/home` و `features/home-v2`)؛ مسیر `/` و `/v2` هر دو `HomeV2` را نشان می‌دهند |
| تست، Storybook، Playwright                                 | وجود ندارد                                                                                      |

نتیجه: مشکل اصلی نبودِ توکن نیست؛ این است که هیچ‌چیز استفاده از توکن را اجباری نمی‌کند.

## اصل‌ها

1. **پروتوتایپ مشخصات است، نه کد.** `docs/design/reference/prototype-v9.html` را تبدیل نکنید. Claude Code آن را در مرورگر باز می‌کند، رفتار و اندازه‌ها را می‌خواند و با کامپوننت‌های دیزاین‌سیستم از نو می‌سازد. نام کلاس‌های پروتوتایپ دورریختنی‌اند.
2. **یک منبع حقیقت.** توکن‌ها و کامپوننت‌های پایه فقط در `packages/ui`. `apps/web` فقط مصرف می‌کند.
3. **سه لایه‌ی توکن.** خام (`--p-*`) ← معنایی (`bg-surface-2`، `text-muted`) ← کامپوننت. کامپوننت‌ها فقط لایه‌ی معنایی را می‌بینند. فایل `tokens.css` همین را پیاده کرده و پالت پیش‌فرض Tailwind را خاموش می‌کند؛ یعنی `bg-neutral-100` دیگر اصلاً ساخته نمی‌شود.
4. **رفتار را نسازید، بگیرید.** تقویم، کمبوباکس، تب، پاپ‌اور و دیالوگ از React Aria Components می‌آیند: تقویم شمسی، RTL، کیبورد و صفحه‌خوان را آماده دارد و جای ۱۱۳۳ خط کد دست‌ساز را می‌گیرد.
5. **قانون با ابزار، نه با قرارداد.** lint و تست باید خطا بدهند؛ «یادمان باشد» کافی نیست.
6. **مهاجرت مسیر‌به‌مسیر.** طرح جدید کنار طرح قدیم ساخته می‌شود و هر صفحه جداگانه سوییچ می‌شود. بازنویسی یک‌جا نکنید.

## درباره‌ی «استاندارد»

- **فرمت توکن:** منبع فعلاً همان CSS است (`@theme` در Tailwind v4). فرمت DTCG (JSON) با Style Dictionary فقط وقتی ارزش دارد که مصرف‌کننده‌ی دوم داشته باشید (اپ موبایل، همگام‌سازی با Figma). آن روز، همین نام‌ها بدون تغییر به JSON منتقل می‌شوند.
- **دسترس‌پذیری:** WCAG 2.2 سطح AA. کنتراست متن ۴٫۵:۱، هدف لمسی ۴۴ پیکسل (کف ۳۸ برای کنترل‌های فشرده)، کار کامل با کیبورد، `prefers-reduced-motion`.
- **دوجهته:** فقط ویژگی‌های منطقی (`ps-`، `ms-`، `start-`). هر کامپوننت در هر چهار زبان تست می‌شود.
- **تم:** طرح فقط تیره است، ولی چون کامپوننت‌ها فقط توکن معنایی می‌بینند، تم روشن بعداً با بازتعریف همان توکن‌ها زیر `[data-theme=light]` اضافه می‌شود.

## مرحله‌ها

هر مرحله یک merge request جدا است. تا مرحله‌ای سبز نشده، بعدی شروع نشود.

### ۰. آماده‌سازی

فایل‌های این بسته را در ریپو بگذارید:

```text
docs/design/design-direction.md
docs/design/design-system-plan.md
docs/design/reference/prototype-v9.html
docs/design/prototype-v9.test.py
packages/ui/src/styles/tokens.css
```

```text
Read docs/design/design-direction.md (section "v6") and docs/design/design-system-plan.md.
Open docs/design/reference/prototype-v9.html with the Playwright MCP browser at 1440x900 and 390x844,
click through every control of the booking card, and write docs/design/inventory.md:
a table of every distinct UI element on the page (name, variants, states, where it appears).
Do not write any component code yet. Stop and show me the inventory.
```

فهرست را خودتان بازبینی کنید. این فهرست، دامنه‌ی دیزاین‌سیستم است.

### ۱. پایه: توکن و قفل‌ها

```text
Foundation only, no visual work on pages yet.
1. packages/ui: export "./styles/tokens.css" in package.json. In apps/web/src/app/globals.css
   keep the @font-face rules, import '@aerotech/ui/styles/tokens.css', add
   @source '../../../../packages/ui/src', and delete the old @theme block.
   Move every keyframe that is still used into the component that uses it; delete the rest.
2. The app will now fail to style most pages because the default palette is off. That is
   expected. Do NOT re-enable it. Add a temporary file apps/web/src/app/legacy.css that maps
   only the old classes still in use, list them in docs/design/legacy-classes.md with a count
   per file, and import it last. This file shrinks to zero during migration.
3. ESLint (packages/config/eslint): fail on Tailwind arbitrary values in className
   (/-\[[^\]]+\]/), on raw hex or rgb() in tsx/ts, and on physical classes
   (ml-, mr-, pl-, pr-, left-, right-, text-left, text-right, rounded-l-, rounded-r-, border-l-, border-r-).
   Scope: packages/ui and any file under a "next" folder; legacy files are exempt by path.
4. Stylelint: no hex or rgb() outside packages/ui/src/styles/tokens.css.
5. Add Storybook 9 (react-vite) to packages/ui with addon-a11y and a toolbar that switches
   locale and dir between fa-ir, ar-ae, en-de, de-de. Add @playwright/test and
   @axe-core/playwright to apps/web.
6. One story, "Foundations/Tokens", that renders every colour, type size, radius, shadow and
   spacing token from tokens.css with its name and computed value.
Run lint, typecheck and build. Show me the Tokens story in fa-ir and en-de.
```

### ۲. کامپوننت‌های پایه (`packages/ui`)

به ترتیب وابستگی، هر دسته یک merge request:

| دسته | کامپوننت‌ها                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------- |
| الف  | `Button`، `IconButton`، `Link`، `Icon`، `Badge`، `Spinner`                                                |
| ب    | `TextField`، `Field` (برچسب + مقدار، همان خانه‌ی فرم رزرو)، `SegmentedControl`، `ToggleChip`، `Stepper`   |
| ج    | `Tabs`، `Popover`، `Sheet`، `ResponsiveOverlay` (پاپ‌اور در دسکتاپ، شیت زیر ۷۰۱ پیکسل)، `Dialog`، `Toast` |
| د    | `ListBox`، `ComboBox`، `Calendar`، `RangeCalendar` (شمسی برای fa، میلادی برای بقیه)                       |
| ه    | `Card`، `SectionHeader`، `Skeleton`، `Reveal`                                                             |

```text
Build batch <X> of packages/ui from docs/design/inventory.md.
Rules for every component:
- Behaviour from React Aria Components; styling with tailwind-variants; semantic tokens only.
- Props: variant, size, and state via data attributes. No className escape hatch on primitives
  except for layout (margin, grid placement) through a `className` that is lint-checked.
- Logical properties only. Works in all four locales without per-locale code.
- States covered: default, hover, focus-visible, pressed, selected, disabled, invalid, loading.
- A story per variant and state, plus one "RTL/LTR matrix" story.
- A Vitest + Testing Library test for keyboard interaction and aria attributes.
- No `next/*` imports, no data fetching, no feature knowledge.
Match the reference: open docs/design/reference/prototype-v9.html next to the story with the
Playwright MCP browser and compare size, radius, colour and spacing. Report any difference
larger than 1px or any colour that is not a token.
Definition of done: lint, typecheck, unit tests and the Storybook a11y check all pass.
```

### ۳. الگوها و صفحه‌ی خانه (`apps/web`)

الگوها کامپوننت‌هایی‌اند که از دامنه خبر دارند و در `apps/web/src/features` می‌مانند: `BookingWidget` (با `AirportField`، `DateRangeField`، `PassengerField`)، `SiteHeader`، `MobileNav`، `SiteFooter`، `RouteExplorer`، `AssistantDemo`، `TripTools`، `InfoCards`.

```text
Build the v6 home page at /[locale]/next, beside the current home. Do not touch features/home
or features/home-v2.
- Server components by default. Client islands only for: BookingWidget, RouteExplorer (canvas),
  AssistantDemo, the trip-tool tiles, MobileNav.
- Booking state in the URL (nuqs or searchParams): from, to, depart, return, adults, children,
  infants, cabin, trip. Rules from design-direction.md "Booking card" go to packages/domain
  with unit tests (one end is always Tehran; infants <= adults; max 9; IKA for Istanbul).
- All copy in apps/web/messages/*.json for the four locales. No string literals in components.
- Only packages/ui primitives. If something is missing, stop and add it to packages/ui first.
Port docs/design/prototype-v9.test.py to apps/web/e2e/home.spec.ts and results.spec.ts with @playwright/test, same
viewports and same assertions, plus an axe scan, and run it for fa-ir and en-de.
Add visual snapshots of the page at 1440x900 and 390x844 for both locales.
```

### ۴. سوییچ و پاک‌سازی

```text
Make /[locale] render the new home. Delete /[locale]/v2, /[locale]/next, features/home,
features/home-v2, the old features/booking-widget and apps/web/src/components/ui.
Remove their classes from legacy.css and update docs/design/legacy-classes.md.
Run knip (or ts-prune) and delete anything it reports as unused. Full test suite must pass.
```

### ۵. بقیه‌ی صفحه‌ها

ترتیب پیشنهادی بر اساس مسیر پول: نتایج جستجو ← مسافران ← پرداخت و تأیید ← مدیریت رزرو، پذیرش، وضعیت پرواز ← صفحه‌های محتوایی. برای هر صفحه اول طرح (مثل همین صفحه‌ی خانه) تأیید می‌شود، بعد همان پرامپت مرحله‌ی ۳ اجرا می‌شود. وقتی `legacy.css` خالی شد، خودش و استثناهای lint حذف می‌شوند.

## تعریف «تمام‌شده» برای هر merge request

- [ ] هیچ رنگ، اندازه یا سایه‌ای خارج از `tokens.css` تعریف نشده
- [ ] lint، typecheck، تست واحد و e2e سبز
- [ ] استوری برای هر حالت؛ بررسی a11y بدون خطا
- [ ] بررسی دیداری در fa-ir و en-de، دسکتاپ و موبایل
- [ ] `prefers-reduced-motion` محتوا را پنهان نمی‌کند
- [ ] شمارنده‌ی `legacy-classes.md` بالا نرفته

## تصمیم‌هایی که با شماست

1. **فونت لاتین:** Graphik مجوز می‌خواهد و فایل‌هایش در ریپو نیست. تا آن موقع نسخه‌ی انگلیسی و آلمانی با Alibaba رندر می‌شود. یا مجوز بگیرید یا یک فونت آزاد (مثلاً Geist یا Inter) را رسمی کنید.
2. **قاعده‌ی شبکه:** «یک سر مسیر همیشه تهران است» فرض پروتوتایپ است. اگر پرواز بین دو شهر دیگر دارید، قبل از مرحله‌ی ۳ اصلاح شود.
3. **Chromatic یا snapshot محلی:** برای مقایسه‌ی دیداری، Playwright snapshot رایگان است ولی به سیستم‌عامل حساس است (باید در Docker اجرا شود). Chromatic پولی و بی‌دردسرتر است.
