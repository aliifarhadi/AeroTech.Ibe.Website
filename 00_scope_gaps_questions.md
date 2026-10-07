# 00 - Scope, Gaps, Assumptions, and Open Questions

This document captures what is intentionally in scope, what is deferred, the assumptions the build proceeds on, and the open questions that need business or backend answers. It is the companion to the rest of the pack: when a later document states a requirement, the assumptions and questions behind it live here.

Keep this file updated as decisions are made. When an open question is answered, move it into "Resolved decisions" with a date.

## Scope for V1

V1 is a production-grade frontend skeleton with a fully mocked backend (MSW). It proves the architecture and the first booking vertical slice end to end without any real third-party integration.

In scope for V1:

- Next.js App Router monorepo (pnpm + Turborepo), TypeScript strict.
- Design token foundation and accessible base components.
- Homepage booking widget: Book, Manage, Check-in, Flight status tabs.
- Booking funnel: search results, fare selection, passengers, seats, ancillaries, payment shell, confirmation.
- Manage booking retrieval and order detail.
- Flight status search.
- Mocked BFF for every contract in `05_api_contracts.md`, including failure cases.
- Multi-language with full LTR and RTL support wired in from the start.
- PWA shell: manifest, offline fallback, safe caching.
- Web Vitals reporting, unit tests, component tests, Playwright smoke + accessibility checks.

Explicitly deferred (later versions):

- Real PSS, pricing, order, inventory, seat, and ancillary services.
- Real PSP (Adyen/Stripe/other) integration and PCI work.
- Real OIDC/identity provider and account features beyond mocked flows.
- Real CMS integration (content is mocked/stubbed).
- Multi-city / stopover, low-fare calendar, native check-in, loyalty dashboard, chatbot, push notifications.
- Production deployment target (Azure vs Vercel vs Cloudflare).

## Working assumptions

These are the assumptions the build proceeds on unless a stakeholder overrides them.

1. **V1 is fully mocked.** Next.js route handlers + MSW act as the BFF. An ASP.NET Core BFF is introduced later if/when the PSS is .NET (per `03_frontend_architecture.md`).
2. **Brand tokens are placeholders.** Neutral CSS-variable tokens now; real brand colors, typography, and logo come later.
3. **Multi-language and bidirectional are first-class.** Both LTR and RTL are required from V1. At least one RTL locale (e.g. `fa-IR` or `ar-AE`) is included in tests. Direction is derived from locale and propagated via the document `dir` attribute and CSS logical properties.
4. **i18n routing strategy:** `/{locale}-{market}/...` (e.g. `/en-de/book`, `/fa-ir/book`). Market affects pricing, legal terms, payment methods, and taxes, so locale alone is not sufficient context.
5. **Money is always a decimal string + ISO 4217 currency.** No floating-point arithmetic anywhere.
6. **No real card data** ever touches the frontend or mock BFF. The payment step uses a clearly mocked PSP adapter.
7. **No passenger PII, passport data, payment data, or tokens in localStorage.** Sensitive draft state stays server-side or in memory.
8. **Deployment target is undecided** and irrelevant to the V1 scaffold.

## Known scope gaps (features referenced but not yet fully specified)

- **Currencies and markets list:** which markets, currencies, and locales ship in V1 vs later.
- **Promo code semantics:** validation rules, stacking, and display beyond client-side format checks.
- **Award / miles search:** the `awardSearch` flag exists in contracts but the redemption flow is unspecified.
- **Multi-city / stopover offer shape:** results UI and offer model for more than two slices.
- **Seat map edge cases:** bassinet rows, exit-row eligibility rules, group/family seating constraints.
- **Refund / change / cancel flows:** fare-rule-driven servicing is marked Basic→Later; exact UX undefined.
- **Loyalty:** tier model, earn/burn display math, and member-only pricing rules.
- **Check-in:** native vs handoff boundary and what data the handoff carries.
- **Disruption handling:** rebooking and irregular-operations UX.
- **Legal/consent content:** terms versions, cookie consent per market, privacy notices.

## Open questions

### Commerce and pricing

- Which markets, currencies, and locales are in V1? Which are RTL?
- Is the offer model single-fare-per-flight or fare-family-per-flight (contracts assume fare families)?
- How long are shopping sessions and price quotes valid? What TTLs drive the session timer?
- Are taxes/fees ever payment-method dependent (affecting the final total)?

### Internationalization and content

- Confirmed RTL launch locales: Arabic (`ar`), Hebrew (`he`), Persian (`fa`) — which ship in V1?
- Translation source of truth: CMS, TMS (e.g. Phrase/Lokalise), or in-repo message catalogs?
- Per-market legal/regulatory copy ownership and review process.
- Brand font(s) and their RTL glyph coverage.

### Identity and accounts

- Which OIDC provider, and are passkeys/WebAuthn in scope?
- Is guest checkout always allowed, or are some markets account-required?
- Step-up authentication policy for sensitive servicing actions.

### Payments

- Which PSP(s) per market, and hosted fields vs redirect vs wallet?
- 3DS/SCA scope by market; saved-card tokenization in V1.1 or later?
- Who owns payment/order reconciliation (webhooks) and the pending-state job?

### Backend / PSS integration

- Is the PSS .NET (drives the ASP.NET Core BFF recommendation)?
- Are OpenAPI specs available to generate typed clients, or do we hand-author from `05_api_contracts.md`?
- Real correlation-ID and idempotency-key conventions across PSS services.

### Operations and platform

- Deployment target and private-connectivity constraints to PSS.
- CMS product choice and content modeling ownership.
- Observability stack: Sentry vs alternative; OTel collector ownership.
- Bot/abuse protection vendor and CAPTCHA accessibility approach.

## Resolved decisions

| Date | Decision | Notes |
|---|---|---|
| 2026-06-30 | Stack locked: Next.js App Router, React, TS strict, Tailwind, Zod, RHF, TanStack Query, XState, Serwist, Vitest, Playwright, MSW, OTel/Sentry. | See README and `03`/`09`. |
| 2026-06-30 | Multi-language with first-class LTR + RTL support is a non-negotiable requirement from V1. | See README, `02`, `06`, `07`, AGENTS.md. |
| 2026-07-01 | V1 backend is fully mocked via MSW; ASP.NET Core BFF deferred. | Revisit when PSS contracts are available. |
