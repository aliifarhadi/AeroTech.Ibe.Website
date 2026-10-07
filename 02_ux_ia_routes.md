# 02 - UX, Information Architecture, and Routes

## UX principles

1. Start with the trip, not the airline.
2. Make mobile the default design, desktop the enhancement.
3. Keep pricing transparent at every step.
4. Avoid dead ends: every error needs a next action.
5. Use progressive disclosure: show enough detail to decide, not every fare rule upfront.
6. Keep the booking context sticky: route, dates, passengers, cabin, total price.
7. Design for slow networks and one-handed use.
8. Make logged-in benefits visible but do not force login before purchase.
9. Treat manage booking as a first-class journey, not a support page.
10. Make accessibility part of component design, not a post-release audit.
11. Design for multiple languages and both reading directions: every screen must work in LTR and RTL, with mirrored layout and direction-aware navigation.

## Recommended top navigation

Desktop:

- Book
- Manage
- Check-in
- Flight status
- Destinations
- Offers
- Help
- Loyalty
- Login/Profile

Mobile bottom/priority actions:

- Book
- Trips
- Check-in
- Status
- Profile

Mobile top:

- Logo
- Market/language/currency
- Login/profile icon
- Menu

## Route map

Use route groups to separate marketing, booking, account, and servicing domains.

```text
/
/(marketing)
  /destinations
  /destinations/[slug]
  /flights/[origin]-to-[destination]
  /offers
  /offers/[slug]
  /experience
  /baggage
  /travel-info
  /help
  /help/[category]
  /about
/(booking)
  /book
  /book/search
  /book/results
  /book/fares
  /book/passengers
  /book/seats
  /book/ancillaries
  /book/payment
  /book/confirmation/[orderId]
/(manage)
  /manage
  /manage/retrieve
  /manage/[orderId]
  /manage/[orderId]/seats
  /manage/[orderId]/bags
  /manage/[orderId]/change
  /manage/[orderId]/cancel
  /manage/[orderId]/receipts
/(check-in)
  /check-in
  /check-in/retrieve
  /check-in/[tripId]
/(status)
  /flight-status
  /flight-status/route
  /flight-status/flight-number
/(account)
  /login
  /signup
  /profile
  /profile/travelers
  /profile/payments
  /profile/preferences
  /profile/security
  /loyalty
  /loyalty/activity
  /loyalty/redeem
/(system)
  /offline
  /maintenance
  /error
```

## Page requirements

### Home page `/`

Purpose: primary conversion entry.

Above the fold:

- Booking widget with tabs: Book flight, Manage booking, Check-in, Flight status.
- Origin/destination autocomplete.
- Trip type: round-trip, one-way, multi-city if supported.
- Dates with mobile-friendly calendar.
- Passengers and cabin.
- Promo code toggle.
- Search CTA.

Below the fold:

- Current offers/campaigns.
- Destination inspiration.
- Loyalty signup/login value proposition.
- Travel updates and notices.
- App/PWA install CTA.
- Help shortcuts.

Rendering strategy:

- Booking widget shell must be server-rendered.
- Airport search can hydrate as a small client island.
- Marketing content can stream below the widget.
- Hero image must be optimized and must not block the form.

### Search results `/book/results`

Primary elements:

- Sticky search summary with modify button.
- Availability list grouped by outbound/inbound segment.
- Fare family cards per flight option.
- Filters: stops, time, airport, fare family, baggage, refundability.
- Sort: recommended, lowest price, shortest duration, departure time.
- Price calendar if supported.
- Loading skeleton and partial result states.

Mobile pattern:

- Use a compact itinerary card.
- Fare family comparison opens as bottom sheet.
- Filters open as full-screen modal.
- Total price and continue CTA sticky at bottom after selection.

Important states:

- No flights found.
- Sold out.
- Price changed.
- Session expired.
- Mixed operating carrier warning.
- Airport change warning.
- Overnight/next-day arrival indicator.

### Fare details `/book/fares`

Required information:

- Fare family name.
- Included baggage.
- Refund/change policy summary.
- Seat selection policy.
- Miles earning.
- Upgrade eligibility.
- Terms and fare rule link.
- Total price breakdown.

### Passenger details `/book/passengers`

Fields:

- Passenger type: adult, child, infant.
- Title if required by market.
- Given name, middle name optional, family name.
- Date of birth for child/infant or all international trips if needed.
- Gender only if required by backend/market.
- Nationality/passport fields only where required at booking.
- Frequent flyer program and number.
- Special assistance request entry.
- Contact email and phone.

Rules:

- Names must match travel documents.
- Validate per market, but do not over-constrain global names.
- Avoid splitting names incorrectly for cultures with single names or multi-part surnames.
- Save traveler option for logged-in users.

### Seats `/book/seats`

Requirements:

- Seat map per flight segment.
- Legend: available, selected, occupied, blocked, extra legroom, preferred, exit row, bassinet.
- Accessibility text alternative for screen readers.
- Rules for infant, child, exit row, SSR restrictions.
- Price per selected seat and total update.
- Skip seat selection option.

Fallback:

- If seat map fails, allow continue and show airport assignment message.

### Ancillaries `/book/ancillaries`

Minimum:

- Bags.
- Meals if supported.
- Lounge/priority if supported.
- Insurance if legally approved by market.
- Carbon offset if business wants it.

Design:

- Show per-passenger and per-segment applicability.
- Display included allowances before selling extras.
- Avoid dark patterns; make skip clear.

### Payment `/book/payment`

Requirements:

- Order summary.
- Passenger summary.
- Contact summary.
- Ancillaries summary.
- Price breakdown: fare, taxes, carrier charges, ancillaries, discounts, total.
- Terms acceptance.
- Payment methods by market.
- Hosted fields or PSP redirect.
- 3DS/SCA handling.
- Idempotent confirm flow.

Failure states:

- Payment declined.
- 3DS failed.
- Price expired.
- Order creation failed after payment approved.
- Duplicate payment attempt.
- Network lost.

### Confirmation `/book/confirmation/[orderId]`

Requirements:

- Confirmation status: confirmed, pending ticketing, pending payment, failed with support reference.
- Order ID/booking reference/e-ticket where applicable.
- Itinerary.
- Passengers.
- Payment receipt.
- Next actions: manage booking, check-in later, add to calendar, download receipt, install PWA, create account.
- Email/SMS confirmation status.

### Manage booking `/manage`

Search options:

- Booking reference plus surname.
- E-ticket plus surname.
- Order ID plus surname.
- Login to see all trips.

Order detail should show:

- Trip timeline.
- Flight status if near departure.
- Passengers.
- Seats and bags.
- Fare conditions.
- Receipts.
- Available actions.
- Support contact if self-service unavailable.

### Flight status `/flight-status`

Search modes:

- Flight number and date.
- Route and date.
- Airport arrivals/departures if supported.

Show:

- Scheduled and estimated times.
- Terminal/gate.
- Status label.
- Delay/cancellation reason if public.
- Local times clearly marked.
- Subscribe to updates.

## Reusable UX patterns

### Sticky trip summary

Use throughout booking:

- Origin/destination.
- Dates.
- Passengers.
- Cabin.
- Selected flights.
- Total price.
- Session timer if needed.

### Bottom sheets for mobile

Use for:

- Fare details.
- Filters.
- Price breakdown.
- Passenger edit summary.
- Ancillary details.

### Alert hierarchy

- Info: helpful context.
- Warning: customer can continue but should notice.
- Error: customer must act.
- Critical: transaction status uncertain; show support reference.

### Loading hierarchy

- Immediate skeleton for page frame.
- Progressive result loading.
- Optimistic UI only for safe non-payment operations.
- Never fake payment/order confirmation.
