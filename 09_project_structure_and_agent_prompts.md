# 09 - Project Structure and Agent Prompts

## Recommended repository structure

Use a monorepo so UI, domain types, API client, tests, and app code stay consistent.

```text
airline-b2c/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (marketing)/
│       │   │   ├── (booking)/
│       │   │   ├── (manage)/
│       │   │   ├── (account)/
│       │   │   ├── api/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── globals.css
│       │   ├── features/
│       │   │   ├── booking-search/
│       │   │   ├── offer-results/
│       │   │   ├── fare-family/
│       │   │   ├── passengers/
│       │   │   ├── seats/
│       │   │   ├── ancillaries/
│       │   │   ├── payment/
│       │   │   ├── confirmation/
│       │   │   ├── manage-booking/
│       │   │   ├── flight-status/
│       │   │   ├── auth/
│       │   │   ├── profile/
│       │   │   └── cms/
│       │   ├── shared/
│       │   │   ├── api/
│       │   │   ├── analytics/
│       │   │   ├── auth/
│       │   │   ├── config/
│       │   │   ├── errors/
│       │   │   ├── forms/
│       │   │   ├── i18n/
│       │   │   ├── lib/
│       │   │   └── ui/
│       │   └── test/
│       │       ├── factories/
│       │       ├── fixtures/
│       │       └── mocks/
│       ├── public/
│       │   ├── icons/
│       │   ├── manifest.webmanifest
│       │   └── offline.html
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── domain/
│   │   └── src/
│   ├── api-client/
│   │   └── src/
│   ├── ui/
│   │   └── src/
│   ├── config/
│   │   └── src/
│   └── test-utils/
│       └── src/
├── e2e/
│   ├── booking.spec.ts
│   ├── manage-booking.spec.ts
│   └── accessibility.spec.ts
├── docs/
│   └── architecture/
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Package responsibilities

### `apps/web`

- Next.js app.
- Route structure.
- Server/client components.
- PWA manifest and service worker registration.
- Integration with API client.

### `packages/domain`

- Shared TypeScript domain types.
- Zod schemas for domain boundaries.
- Money/date utilities.
- Error codes.

### `packages/api-client`

- Typed BFF client.
- Fetch wrapper with correlation ID.
- Error normalization.
- Mock handlers for MSW.

### `packages/ui`

- Design system components.
- Tokens.
- Accessible primitives wrapping Radix/Ariakit.
- Storybook optional.

### `packages/config`

- ESLint.
- TypeScript.
- Prettier.
- Testing config.

### `packages/test-utils`

- Data factories.
- Render helpers.
- Mock booking flows.

## Initial dependency recommendation

Use current stable versions at implementation time.

Core:

```text
next
react
react-dom
typescript
zod
@tanstack/react-query
react-hook-form
xstate or internal typed reducer
tailwindcss
@radix-ui/react-* or ariakit
lucide-react or custom icons
```

Testing:

```text
vitest
@testing-library/react
@testing-library/user-event
playwright
msw
axe-core or jest-axe/playwright axe
```

Quality:

```text
eslint
prettier
knip
size-limit or bundle analyzer
lighthouse-ci
```

Observability:

```text
@opentelemetry/api
@sentry/nextjs or equivalent
web-vitals
```

PWA:

```text
serwist or workbox-window
```

## Environment variables

```text
NEXT_PUBLIC_APP_ENV=local|dev|test|stage|prod
NEXT_PUBLIC_DEFAULT_LOCALE=en-US
NEXT_PUBLIC_DEFAULT_MARKET=DE
NEXT_PUBLIC_DEFAULT_CURRENCY=EUR
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
WEB_BFF_BASE_URL=http://localhost:5000
CMS_BASE_URL=http://localhost:5001
OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
PAYMENT_PUBLIC_KEY=
SENTRY_DSN=
```

Never expose backend secrets as `NEXT_PUBLIC_*`.

## Claude Code / Codex master prompt

Use this prompt after placing all markdown files in the repo root.

```text
You are building a production-grade modern airline B2C website. Read all markdown files in the repository before coding, especially AGENTS.md and files 00-09.

Goal: scaffold the frontend architecture and implement the first vertical slice of the booking journey with typed mocks.

Tech choices:
- Next.js App Router with React and TypeScript strict mode.
- Feature-first structure under apps/web/src/features.
- Shared domain types in packages/domain.
- Shared API client in packages/api-client.
- Shared accessible UI components in packages/ui.
- Tailwind CSS v4 or current stable Tailwind.
- MSW for mocked BFF responses.
- Playwright for E2E smoke tests.

Deliverables:
1. Monorepo structure with pnpm and turborepo.
2. Next.js web app with route groups for marketing, booking, manage, account, status, check-in.
3. Design token foundation and accessible base components.
4. Homepage with booking widget tabs: Book, Manage, Check-in, Flight Status.
5. Search results page using mock offers.
6. Fare family cards and selected trip summary.
7. Passenger form with React Hook Form and Zod.
8. Placeholder seats, ancillaries, payment, and confirmation routes with typed state handoff.
9. API client with mock implementations for search-offers, price-offer, seat-map, ancillaries, order-draft, payment-session, order-commit, manage-retrieve, flight-status.
10. Unit tests for domain validation and key components.
11. Playwright smoke test for search to confirmation using mocks.
12. PWA manifest and offline fallback.
13. Basic Web Vitals reporting hook.

Rules:
- Do not implement fake payment processing beyond a clearly mocked provider adapter.
- Do not store passenger PII in localStorage.
- Use decimal strings for money.
- Use accessible form labels and error messages.
- Keep client components small.
- Do not use hard-coded English inside reusable components; use message keys or a simple i18n dictionary.
- Every mutation must include an idempotency key in the API client.
- Add TODO comments only for real backend integration points.

After implementation, run typecheck, lint, unit tests, and Playwright smoke tests. Fix all failures.
```

## Task prompts for step-by-step generation

### Task 1 - Scaffold

```text
Read AGENTS.md and all docs. Scaffold the monorepo exactly as specified in 09_project_structure_and_agent_prompts.md. Use Next.js App Router, TypeScript strict, pnpm, and turborepo. Add placeholder packages for domain, api-client, ui, config, and test-utils. Add scripts for dev, build, lint, typecheck, test, test:e2e. Do not implement business UI yet. Ensure the app boots with a simple homepage.
```

### Task 2 - Domain and API mocks

```text
Implement packages/domain and packages/api-client. Define Money, AirportCode, SearchCriteria, Offer, FareFamily, PriceQuote, PassengerInput, ContactInput, SeatMap, Ancillary, OrderDraft, PaymentSession, OrderConfirmation, ApiError, and error codes. Implement a typed fetch wrapper that adds correlation ID and idempotency keys for mutations. Add MSW handlers with realistic airline mock data for the APIs in 05_api_contracts.md. Add unit tests for schemas and money formatting.
```

### Task 3 - Design system foundation

```text
Implement packages/ui with design tokens, Button, TextField, Select, Combobox shell, Tabs, Alert, Drawer/BottomSheet, Card, Badge, Skeleton, ProgressStepper, Price, and ErrorState. Components must be accessible, keyboard usable, and typed. Use Tailwind CSS utilities but keep airline brand values as CSS variables. Add component tests for Button, TextField, Tabs, and Alert.
```

### Task 4 - Homepage booking widget

```text
Implement the homepage and BookingWidget. It must have tabs for Book, Manage, Check-in, Flight Status. Book tab includes trip type, origin, destination, dates, passengers, cabin, promo code, and search CTA. Manage tab retrieves by booking reference and surname. Check-in tab retrieves by booking reference/ticket and surname. Flight status tab supports flight number/date. Use accessible labels and mobile-first layout. On submit, navigate to the correct route with safe query params.
```

### Task 5 - Search results and fare selection

```text
Implement /book/results. Read search criteria from URL, call mocked search-offers API, show loading skeleton, no availability state, and offer results. Build FlightResultCard, FareFamilyCard, FareComparisonTable, SearchSummaryBar, and TripSummaryPanel. Selecting a fare calls price-offer and stores selected booking state safely. Continue navigates to /book/passengers.
```

### Task 6 - Passenger, seats, ancillaries, payment, confirmation vertical slice

```text
Implement the first full booking vertical slice with mocks: passenger details, seat selection placeholder with mock seat map, ancillary selection for baggage, payment shell with mocked PSP adapter, and confirmation. Use idempotency keys for order draft, payment session, and order commit. Do not use real card fields. Add route guards so users cannot skip required previous steps unless mock state exists.
```

### Task 7 - Manage booking and flight status

```text
Implement /manage retrieval and order detail using mocked manage-retrieve and order APIs. Implement /flight-status with flight number/date and route/date search. Include empty, loading, success, and error states. Add Playwright tests for retrieving a booking and checking flight status.
```

### Task 8 - PWA, performance, accessibility

```text
Add manifest.webmanifest, icons placeholders, service worker using Serwist or Workbox, offline route/page, app shortcuts, and safe caching rules. Add Web Vitals reporting. Add Lighthouse CI config for home, results, passenger, and manage pages. Add Playwright accessibility smoke checks with axe. Ensure no private booking/order/payment API is cached by service worker.
```

## Definition of done for first skeleton

- App runs locally.
- All routes compile.
- TypeScript strict passes.
- Lint passes.
- Unit tests pass.
- E2E smoke booking flow passes with mocks.
- Mobile viewport 360px works for homepage and booking steps.
- Basic PWA installability checks pass.
- No raw PII persisted in localStorage.
- API client sends correlation ID and idempotency key for mutations.
- README explains how to run and where to integrate real backend.
