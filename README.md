# Modern Airline B2C Website - Build Specification Pack

Date: 2026-06-30
Owner: Airline digital commerce / PSS team
Primary frontend: React via Next.js App Router
Target channels: Web, mobile web, installable PWA
Primary business flows: search to checkout, login, profile, manage bookings, landing pages

## Purpose

This pack is written so Claude Code, Codex, or a human engineering team can generate the first production-grade structure for a modern airline direct channel. It is not only a landing-page brief. It covers customer journeys, booking-engine state, frontend architecture, API contracts, design system, PWA, performance, security, observability, and delivery plan.

## Source benchmarks checked

Use these as experience benchmarks, not as designs to copy:

- Singapore Airlines: book trip, manage booking, check-in, flight status, flight schedule, KrisFlyer login, multi-city/stopovers, promo code, redeem flights.
- Korean Air: book/manage, award tickets, My Trips, online check-in, app promotion, mileage/loyalty, service information, notices, AI chatbot references.
- Qatar Airways: book, manage booking, Privilege Club login, AI assistant, real-time trip notifications, add-ons, check-in, seat/meal/upgrades.
- Emirates: book flights, manage booking, online check-in, Skywards loyalty, hotels/car hire, baggage and preference add-ons.

## Recommended build decision

Build this as a Next.js application, not a pure client-side React SPA. It is still React, but gives the airline better SEO, first paint, server rendering, streaming, route-level caching, and cleaner composition with a backend-for-frontend layer.

Recommended high-level stack:

- Next.js latest stable App Router.
- React latest stable.
- TypeScript strict mode.
- Tailwind CSS v4 plus Radix UI/Ariakit primitives for accessible components.
- Zod for schemas and form validation.
- next-intl (or equivalent) for internationalization with first-class LTR/RTL support.
- React Hook Form for passenger/payment/profile forms.
- TanStack Query for client-side server state where live refresh is needed.
- XState or a typed reducer for the booking checkout state machine.
- Serwist or Workbox for PWA service worker.
- Playwright for end-to-end tests.
- Vitest and Testing Library for unit/component tests.
- MSW for API mocks.
- OpenTelemetry plus Sentry or equivalent for observability.

## Files in this pack

1. `00_scope_gaps_questions.md` - Missing features, assumptions, and open questions.
2. `01_product_capability_map.md` - Product modules and customer journeys.
3. `02_ux_ia_routes.md` - Information architecture, route map, and page-level requirements.
4. `03_frontend_architecture.md` - Technical architecture, rendering strategy, state, security boundaries.
5. `04_booking_engine_flow_state.md` - Search-to-checkout flow, state machine, domain objects, error cases.
6. `05_api_contracts.md` - API/BFF contracts for PSS integration.
7. `06_design_system_components.md` - Design tokens, components, responsive patterns.
8. `07_pwa_performance_seo_a11y.md` - PWA, Core Web Vitals, SEO, accessibility, i18n.
9. `08_security_compliance_observability.md` - Security, privacy, payments, monitoring, audit.
10. `09_project_structure_and_agent_prompts.md` - Repo structure and tasks/prompts for Claude Code/Codex.
11. `AGENTS.md` - Coding-agent rules and definition of done.

## Suggested first implementation order

1. Scaffold monorepo and CI.
2. Implement design tokens and shell layout.
3. Implement mock BFF and typed API client.
4. Build homepage booking widget and offer search page with mocks.
5. Build fare selection, passenger forms, ancillaries, seats, payment placeholder, confirmation.
6. Build manage booking retrieval and order detail.
7. Add PWA shell, observability, analytics, and performance budgets.
8. Replace mocks with real PSS APIs gradually.

## Local development (scaffold)

The Phase 0 monorepo scaffold is in place: a pnpm + Turborepo workspace with `apps/web`
(Next.js App Router) and `packages/{domain,api-client,ui,config,test-utils}`. Internationalization
with first-class LTR/RTL support is wired in from the start (next-intl + a locale-driven `dir`).

Prerequisites: Node 20+ and pnpm 9+ (`npm install -g pnpm` if not present).

```bash
pnpm install            # install workspace dependencies
pnpm --filter @aerotech/web dev     # run the web app at http://localhost:3000
pnpm --filter @aerotech/domain test # unit tests (money + i18n/direction helpers)
pnpm --filter @aerotech/web build   # production build (typecheck + lint included)
```

Do not run `build` while the development server is still running: both commands use
`apps/web/.next`, and mixing their generated chunks can cause errors such as missing `./543.js`
or `vendor-chunks/zod@3.25.76.js`.

If Next.js reports a missing generated module, stop the running dev server first, clear only the
generated app output, and restart the requested command:

```bash
pnpm --filter @aerotech/web run clean
pnpm --filter @aerotech/web dev
```

Locales live under `/{locale}-{market}` — e.g. `/en-de` (LTR), `/de-de` (LTR), `/fa-ir` (RTL),
`/ar-ae` (RTL). The homepage includes a locale switcher that flips the document direction live.

Workspace scripts (`pnpm typecheck`, `pnpm lint`, `pnpm test`) are wired through Turborepo. If the
`turbo` binary fails to launch on a given machine, run the per-package scripts directly as a fallback,
e.g. `pnpm -r run typecheck` and `pnpm -r run lint`.

## Non-negotiable principles

- Mobile-first: every booking step must be usable with one hand on a 360px wide viewport.
- Performance-first: the booking widget and offer results must not be blocked by marketing content.
- Order-centric: align frontend domain language with Offer, Order, Payment, and Servicing, not only PNR/ticket artifacts.
- Accessibility-first: target WCAG 2.2 AA.
- Multi-language and bidirectional: support both LTR and RTL languages as a first-class design requirement. Every layout, component, and navigation pattern must mirror correctly for RTL markets (e.g. Arabic, Hebrew, Persian) without hard-coded left/right assumptions.
- Failure-tolerant: every live availability, price, seat, payment, and order call must have an explicit recovery path.
- Secure by design: no card data stored in the app; no passenger PII in client logs; all order mutations require idempotency.
