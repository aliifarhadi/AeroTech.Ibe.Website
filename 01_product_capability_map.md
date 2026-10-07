# 01 - Product Capability Map

## Vision

The website should behave like a modern airline retail store, not like a legacy booking form. The customer should be able to discover, shop, compare, personalize, pay, manage, and receive service through a single direct channel.

## Top-level product areas

```text
Airline B2C Website
├── Discover and inspire
├── Shop flights
├── Compare offers
├── Personalize trip
├── Checkout and pay
├── Account and loyalty
├── Manage booking/order
├── Check-in and travel day
├── Customer support
├── Content and campaigns
└── Platform foundation
```

## Customer journeys

### 1. Anonymous flight shopping

Goal: convert anonymous visitor into an order.

Steps:

1. Visitor lands on home, route page, campaign page, or app link.
2. Visitor enters origin, destination, dates, passengers, cabin, promo code.
3. System returns available offers.
4. Visitor filters/sorts and selects itinerary/fare family.
5. Visitor sees fare rules, baggage, refundability, changeability, and included services.
6. Visitor enters passengers and contacts.
7. Visitor adds seats/bags/ancillaries.
8. Visitor pays.
9. System creates order and sends confirmation.
10. Visitor is invited to create account or attach order to account.

Key product principles:

- Always show total price and currency clearly.
- Never hide mandatory fees until the final step.
- Keep search available in a sticky mobile modify bar.
- Save progress in draft state where privacy allows.

### 2. Logged-in shopping

Goal: reduce friction and increase revenue per passenger.

Enhancements:

- Pre-fill contact and saved travelers.
- Apply loyalty tier benefits.
- Show personalized bundles.
- Support miles earning estimate and redemption.
- Use saved payment tokens if allowed.
- Attach order automatically to account.

### 3. Manage booking/order

Goal: service the customer without call-center dependency.

Entry methods:

- Login account.
- Booking reference plus surname.
- E-ticket number plus surname.
- Order ID plus surname, if available.

Capabilities:

- View itinerary and passenger details.
- Add or change seats, bags, meals, and special services.
- Change flight where allowed.
- Cancel/refund where allowed.
- Download receipt/ticket/itinerary.
- Add loyalty number.
- Update contact details.
- View disruption options.

### 4. Travel day

Goal: reduce anxiety and operational load.

Capabilities:

- Flight status.
- Check-in entry.
- Boarding pass handoff/download.
- Airport terminal/gate information.
- Baggage allowance and baggage tracking link if supported.
- Travel document reminders.
- Push/email/SMS notifications.

### 5. Loyalty

Goal: make the direct channel habit-forming.

Capabilities:

- Join loyalty program.
- Login.
- Tier status, miles balance, expiry.
- Earn and burn explanation during shopping.
- Member-only offers.
- Saved travelers and preferences.
- Promotions and partner offers.

## Capability matrix

| Capability | V1 | V1.1 | Later | Notes |
|---|---:|---:|---:|---|
| Homepage booking widget | Yes |  |  | Critical conversion entry point. |
| One-way/round-trip search | Yes |  |  | Required. |
| Multi-city/stopover | Optional | Yes |  | Benchmark carriers support it. |
| Flexible date / low fare calendar | Optional | Yes |  | High revenue impact, needs pricing support. |
| Fare family comparison | Yes |  |  | Essential for modern retailing. |
| Seat map | Yes |  |  | At least standard/paid/free seat selection. |
| Baggage purchase | Yes |  |  | Minimum ancillary. |
| Meal/lounge/Wi-Fi | Optional | Yes |  | Depends on airline product. |
| Payment with 3DS/SCA | Yes |  |  | Depends on PSP and market. |
| Order confirmation | Yes |  |  | Include app/PWA install CTA. |
| Retrieve booking | Yes |  |  | By PNR/e-ticket/order ID. |
| Manage ancillaries | Optional | Yes |  | Post-booking revenue. |
| Change/cancel/refund | Basic | Yes |  | Complex fare-rule integration. |
| Online check-in | Link/handoff | Native |  | Handoff acceptable if check-in service separate. |
| Flight status | Yes |  |  | Operational feed required. |
| Login/signup | Yes |  |  | OIDC recommended. |
| Loyalty dashboard | Basic | Yes |  | If program exists. |
| CMS landing pages | Yes |  |  | SEO and campaigns. |
| Chatbot/help assistant | Optional | Yes |  | Use after foundations are stable. |
| PWA installability | Yes |  |  | Offline fallback, cached trip summary. |
| Push notifications | Optional | Yes |  | Requires consent strategy. |

## Core domain vocabulary

Use these terms consistently in UI, API, and code.

- Offer: priced purchasable proposition returned by shopping.
- Offer item: part of an offer, such as flight, fare family, bag, seat, meal.
- Fare family / brand: bundle of fare conditions and included services.
- Order: customer retail record created after acceptance/payment.
- Order item: item in the order: air, bag, seat, service, fee, tax.
- Passenger: traveler in the order.
- Contact: buyer or travel contact, not always the same as passenger.
- Ancillary: optional paid or included non-air service.
- Payment session: PSP-controlled transaction session.
- Ticket/EMD: legacy fulfillment artifacts, if still used behind the order.
- PNR: legacy reservation locator; still used as a lookup key if needed.

## KPI model

### Commerce KPIs

- Search-to-results success rate.
- Results-to-selection conversion.
- Selection-to-passenger conversion.
- Passenger-to-payment conversion.
- Payment success rate.
- Look-to-book ratio.
- Average order value.
- Ancillary attach rate by type.
- Direct-channel share.
- Abandonment by step and error reason.

### Experience KPIs

- LCP, INP, CLS by route and market.
- Search response time p50/p95/p99.
- Price revalidation failure rate.
- Seat map load time.
- Payment authorization time.
- Error recovery rate.
- Mobile conversion rate.
- Login success rate.

### Operational KPIs

- Manage-booking self-service rate.
- Call-center deflection.
- Check-in start success.
- Refund/change self-service completion.
- Notification delivery success.
