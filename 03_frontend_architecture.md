# 03 - Frontend Architecture

## Architecture decision

Use Next.js App Router with React Server Components for the airline website. This gives:

- Server-rendered pages for SEO and fast first paint.
- Route-level layouts for booking, account, and marketing.
- Streaming and Suspense for progressive loading.
- Server-side access to secure BFF calls without exposing backend secrets.
- Strong separation between server and client components.
- Good fit for edge/CDN caching of content pages.

Do not build the booking engine as a pure SPA unless there is a hard hosting constraint. A pure SPA increases JavaScript weight, weakens SEO for route/destination pages, and makes performance harder on low-end mobile devices.

## Logical architecture

```text
Browser / PWA
  |
  | HTTPS
  v
Next.js Web App
  |-- Server Components: page composition, SEO, content, initial data
  |-- Client Components: forms, calendars, seat map, filters, payment interactions
  |-- Route Handlers / Server Actions: thin BFF only where safe
  |
  v
Web BFF / API Gateway
  |-- Auth/session
  |-- API composition
  |-- anti-corruption mapping from PSS to web DTOs
  |-- idempotency
  |-- rate limiting and bot protection
  |
  v
Airline Backend Services
  |-- Offer/Search
  |-- Pricing
  |-- Order
  |-- Inventory
  |-- Seat/Ancillary
  |-- Payment
  |-- Customer/Profile
  |-- Loyalty
  |-- CMS
  |-- Notification
  |-- Operations/Flight Status
```

## Recommended BFF choice

Best enterprise option for your context:

- Use an ASP.NET Core BFF/API Gateway if the rest of the PSS is .NET and the organization wants one backend governance model.
- Keep Next.js route handlers as a thin frontend server layer for content fetching, session helper endpoints, health checks, and proxying only where appropriate.

Alternative:

- Use Next.js as the BFF for v1 speed, then extract to ASP.NET Core BFF when complexity grows.

Avoid:

- Browser directly calling internal PSS microservices.
- Storing access tokens in localStorage.
- Placing PSP or backend secrets in client-side code.

## Rendering strategy by page type

| Page type | Rendering | Caching | Notes |
|---|---|---|---|
| Home shell | SSR/RSC | short CDN cache by market | Booking widget must render fast. |
| Marketing pages | SSG/ISR or CMS cached SSR | CDN cache | Great for SEO. |
| Route SEO pages | SSG/ISR if route list known | CDN cache | `/flights/IKA-to-DXB`. |
| Search results | Dynamic SSR shell + client fetch | no shared cache for personalized data | Results depend on live inventory/pricing. |
| Checkout steps | Dynamic | no shared cache | Sensitive and session-bound. |
| Confirmation | Dynamic | private no-store | Contains PII/order data. |
| Manage booking | Dynamic | private no-store | Auth/retrieval required. |
| Profile | Dynamic | private no-store | Auth required. |
| Flight status | Dynamic with short cache | 15-60 sec possible | Operational feed dependent. |

## Client state strategy

### Server state

Use TanStack Query only for client-side data that changes after hydration or needs refetching:

- Offer results refresh.
- Seat map.
- Ancillary catalog.
- Flight status polling.
- Manage booking actions.

Use server components for:

- CMS content.
- Static layout.
- Initial page data.
- SEO metadata.

### Booking state

Use a typed state machine or reducer, not scattered component state.

State categories:

- Search criteria.
- Shopping session.
- Offer selection.
- Passenger details.
- Ancillary selections.
- Seat selections.
- Payment session.
- Order result.

Persistence:

- Keep sensitive state server-side in a draft/order session when possible.
- Browser sessionStorage may store non-sensitive search criteria and UI progress.
- Never store passport, payment, token, or full passenger PII in localStorage.

### UI state

Use local component state for:

- Open/close panels.
- Selected tab.
- Sort/filter UI before applying.
- Calendar hover/preview.

Use URL query params for:

- Search criteria that are safe to share.
- Results filters and sorting.
- Locale/market where relevant.

## Folder strategy

Use feature-first structure inside the Next.js app.

```text
apps/web/src
├── app
│   ├── (marketing)
│   ├── (booking)
│   ├── (manage)
│   ├── (account)
│   ├── api
│   ├── layout.tsx
│   └── globals.css
├── features
│   ├── booking-search
│   ├── offer-results
│   ├── fare-family
│   ├── passengers
│   ├── seats
│   ├── ancillaries
│   ├── payment
│   ├── confirmation
│   ├── manage-booking
│   ├── flight-status
│   ├── auth
│   ├── profile
│   └── cms
├── shared
│   ├── api
│   ├── config
│   ├── i18n
│   ├── analytics
│   ├── auth
│   ├── errors
│   ├── forms
│   ├── hooks
│   ├── lib
│   └── ui
└── test
    ├── mocks
    ├── factories
    └── fixtures
```

## Type strategy

- Use generated OpenAPI clients where backend contracts exist.
- Use Zod schemas at the boundary when data is not generated or comes from CMS.
- Keep backend DTOs separate from UI view models.
- Use domain types in `packages/domain` for Offer, Order, Passenger, Payment, Segment, Ancillary.

Example:

```ts
export type Money = {
  amount: string;      // decimal string, never floating point
  currency: string;    // ISO 4217
};

export type FlightSegment = {
  segmentId: string;
  marketingCarrier: string;
  operatingCarrier?: string;
  flightNumber: string;
  origin: AirportCode;
  destination: AirportCode;
  departureDateTimeLocal: string;
  arrivalDateTimeLocal: string;
  durationMinutes: number;
};
```

## Error handling architecture

Use typed errors at API boundaries.

Error classes:

- `ValidationError`: user input issue.
- `OfferExpiredError`: offer/session no longer valid.
- `PriceChangedError`: repricing returned different total.
- `PaymentRequiredActionError`: 3DS or redirect needed.
- `PaymentDeclinedError`: payment failed.
- `OrderPendingError`: order status uncertain.
- `ServiceUnavailableError`: backend degraded.
- `UnauthorizedError`: login/session issue.

Every mutation must return:

- machine-readable code.
- localized user message key.
- support reference/correlation ID.
- safe retry flag.
- next recommended action.

## Caching strategy

### Cache aggressively

- Static assets.
- Fonts.
- Icons.
- CMS images.
- Destination content.
- Airport list with versioning.
- Country/phone prefix data.

### Cache carefully

- Flight status: short TTL.
- Ancillary catalog: short/medium TTL, by market/cabin/route.
- Seat map: very short TTL or no shared cache.

### Do not shared-cache

- Search results tied to session/pricing.
- Passenger data.
- Order data.
- Payment data.
- Profile data.

## Security boundaries

Client can handle:

- UI rendering.
- Search form criteria.
- Public content.
- Non-sensitive preferences.

Server/BFF must handle:

- Access tokens.
- Refresh tokens.
- Order mutation authorization.
- Payment session creation.
- PSP webhooks.
- PII logging rules.
- Idempotency enforcement.
- Anti-fraud signals.

## Deployment options

### Option A: Vercel Enterprise + .NET APIs

Pros:

- Best Next.js platform integration.
- Strong edge/CDN performance.
- Fast deployment previews.

Cons:

- Enterprise security/networking review required.
- May complicate private connectivity to PSS services.

### Option B: Azure Front Door + containerized Next.js + AKS/App Service

Pros:

- Fits .NET/Azure enterprise stack.
- Private networking easier.
- Central governance.

Cons:

- Team owns more Next.js runtime operations.

### Option C: Cloudflare Workers/Pages + API gateway

Pros:

- Strong edge story.
- Good static and edge performance.

Cons:

- Some Next.js features may require adaptation.

## Recommended for your likely context

Use Azure Front Door/CDN plus containerized Next.js and ASP.NET Core BFF if your PSS microservices are .NET and enterprise-controlled. Use Vercel Enterprise if speed of frontend delivery and Next-native capabilities are the priority and security approves it.
