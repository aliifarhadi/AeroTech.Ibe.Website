# 07 - PWA, Performance, SEO, Accessibility, and Internationalization

## Performance target

The site must feel fast on mobile networks and low/mid-range devices. Airline booking has high user intent; slow pages directly reduce conversion.

Recommended Core Web Vitals targets:

- LCP: <= 2.5s at p75 per route group and market.
- INP: <= 200ms at p75.
- CLS: <= 0.1 at p75.

Internal stricter engineering budgets:

- Home initial JS: <= 170KB gzip excluding framework/runtime where measurable.
- Booking widget client island: <= 60KB gzip.
- Results page initial interactive JS: <= 220KB gzip.
- Image LCP: optimized, preloaded only when truly LCP.
- API p95 for offer search: target <= 3s where backend allows.
- Seat map p95: target <= 2s.

## Performance architecture

### Server-first rendering

- Render layout, content, and booking shell on server.
- Hydrate only interactive islands.
- Keep calendars, airport autocomplete, filters, seat map, and payment as client components.
- Stream marketing content below primary booking CTA.

### JavaScript reduction

- No heavy date libraries unless tree-shaken.
- Avoid global state libraries for simple state.
- Lazy-load seat map, payment SDK, maps, chatbot, analytics extras.
- Use dynamic imports for non-critical components.
- Do not load chatbot on checkout unless business requires it.

### Images and fonts

- Use Next Image or equivalent optimizer.
- Use responsive images with correct sizes.
- Avoid huge hero images on mobile.
- Use font subsetting.
- Prefer system fallback until brand font loads.
- Prevent layout shift with explicit dimensions.

### Data loading

- Parallelize independent API calls.
- Avoid client-server waterfalls.
- Prefetch next booking step only after current step is valid.
- Cache airport/country/reference data.
- Do not prefetch private order pages.

### Third-party scripts

Third-party scripts are a major airline performance risk. Govern:

- Tag manager.
- Analytics.
- Ads pixels.
- Heatmaps/session replay.
- Chatbot.
- PSP SDK.
- Fraud tools.

Rules:

- Load only by consent and route.
- No heatmap/session replay on passenger, payment, or profile forms unless privacy/legal approves and fields are masked.
- Use Partytown or worker offloading only after testing.
- Measure every script in RUM.

## PWA scope

The PWA should not promise full offline flight booking. It should provide reliability and app-like access.

### PWA v1 features

- Web app manifest.
- Install prompt strategy.
- Offline fallback page.
- Cache app shell.
- Cache static assets.
- Cache safe reference data such as airport list.
- Cache last viewed trip summary only with user consent and without sensitive document/payment data.
- Background retry for safe non-payment requests only.
- App shortcuts: Book, Trips, Check-in, Flight Status.

### PWA later features

- Push notifications for flight status, check-in open, gate changes, disruption.
- Offline boarding pass if legally and operationally supported.
- Wallet pass integration.
- Web share for itinerary.

### Service worker caching rules

Cache first:

- Static assets.
- Icons.
- Fonts.
- Versioned airport reference data.

Stale while revalidate:

- CMS content.
- Destination pages.
- Help articles.

Network first with short timeout:

- Flight status.
- Travel advisories.

Network only:

- Search offers.
- Price offer.
- Passenger validation.
- Order draft.
- Payment.
- Profile.
- Manage booking.

## SEO strategy

SEO matters for route and destination acquisition, not only brand traffic.

### Indexable pages

- Home.
- Destination pages.
- Route pages.
- Offer/campaign pages.
- Baggage and travel information.
- Help articles.
- Loyalty program pages.

### Non-indexable pages

- Search results with live prices unless you intentionally build static fare pages.
- Checkout.
- Manage booking.
- Profile.
- Payment.
- Confirmation.

### Route page pattern

`/flights/[origin]-to-[destination]`

Content blocks:

- SEO title and description.
- Route hero.
- Booking widget prefilled with origin/destination.
- Best time to visit.
- Airport information.
- Fare/product information.
- Baggage snippet.
- FAQ.
- Related destinations.

### Structured data

Consider:

- Organization.
- Airline.
- BreadcrumbList.
- FAQPage for help/route FAQs.
- Product/Offer only where legally and technically accurate.

Do not publish fake static prices as structured data if actual fares are dynamic.

## Accessibility target

Target WCAG 2.2 AA.

Critical airline-specific requirements:

- Booking widget fully keyboard accessible.
- Date picker accessible.
- Airport autocomplete accessible.
- Seat map has list alternative.
- Errors announced to screen readers.
- Focus is moved properly after route/step changes.
- Payment iframes/hosted fields meet accessibility requirements.
- Do not rely on color alone for flight status or seat availability.
- Timers have accessible warning and extension/refresh path.
- Touch targets are large enough.
- Captchas/bot challenges have accessible alternatives.

## Internationalization

### Required support

- Locale-specific routes or negotiation.
- Market and currency separation from language.
- Date formatting by locale.
- Time formatting with local airport timezone.
- Currency formatting by ISO 4217.
- Name fields flexible by market.
- Address fields by country.
- Phone input by country.
- Full bidirectional (RTL and LTR) support as a required capability, not an optional add-on. RTL markets such as Arabic, Hebrew, and Persian are in scope from the start.

### Market model

```ts
export type MarketContext = {
  market: string;             // e.g. DE
  locale: string;             // e.g. en-DE
  currency: string;           // e.g. EUR
  direction: 'ltr' | 'rtl';   // derived from locale; drives the document dir
  salesChannel: 'WEB' | 'PWA';
  timezone?: string;
};
```

### Bidirectional (RTL/LTR) requirements

Treat direction as a property of the locale and propagate it everywhere:

- Set `lang` and `dir` on the `<html>` element per resolved locale so the whole tree inherits direction.
- Build UI with CSS logical properties; do not hard-code physical left/right for directional layout.
- Mirror directional icons, steppers, carousels, drawers, and navigation in RTL; keep universal icons unmirrored.
- Keep airport codes, flight numbers, currency codes, times, and seat numbers in canonical LTR form within RTL text using correct bidi handling.
- Provide RTL-correct font stacks with adequate glyph coverage for Arabic/Hebrew/Persian.
- Include at least one RTL locale in Playwright and visual checks; assert no clipped, overlapping, or misaligned controls.

### URL strategy options

Preferred:

```text
/{locale}-{market}/...
/en-de/book
/de-de/book
/fa-ir/book
```

Alternative:

```text
/{locale}/...
/en/book?market=DE
```

For airline commerce, market affects pricing, legal terms, payment methods, and taxes, so do not treat locale as the only context.

## Analytics and experimentation

### Funnel events

Track booking events listed in `04_booking_engine_flow_state.md`.

### Consent

- Consent banner per market.
- Analytics mode respects consent.
- Marketing pixels disabled until allowed.
- Essential transaction analytics can be privacy-safe and server-side.

### A/B testing

Good candidates:

- Homepage booking widget layout.
- Fare family card labels.
- Ancillary sequencing.
- Login prompt timing.
- Flexible date calendar.

Do not test without guardrails:

- Payment security.
- Accessibility-critical behavior.
- Fare/tax transparency.

## Performance CI gates

Use these in CI/CD:

- Type check.
- Unit tests.
- Component accessibility tests.
- Playwright smoke flows.
- Lighthouse CI for representative pages.
- Bundle size check.
- Source map upload to monitoring.
- Web Vitals RUM alert thresholds.

Representative pages:

- Home.
- Route SEO page.
- Search results with mock data.
- Passenger form.
- Seat map.
- Payment shell.
- Manage booking retrieval.
