# 04 - Booking Engine Flow and State

## Booking engine goals

The booking engine must support a retail-oriented offer/order flow:

1. Search.
2. Offer display.
3. Offer selection.
4. Price validation.
5. Passenger and contact capture.
6. Ancillary and seat selection.
7. Payment.
8. Order creation/confirmation.
9. Post-booking servicing.

## Recommended user flow

```text
Home/Search Widget
  -> Search Results
  -> Fare Family Selection
  -> Trip Review
  -> Passenger Details
  -> Seats
  -> Ancillaries
  -> Payment
  -> Confirmation
```

Some airlines place ancillaries before seats; choose based on revenue strategy. A common high-conversion pattern is:

- Select flight and fare.
- Capture passenger/contact.
- Show seats and bags as contextual add-ons.
- Keep a clear skip option.
- Payment last with a stable total.

## State machine

```text
idle
  -> searching
  -> resultsReady
  -> offerSelected
  -> repricing
  -> priced
  -> passengerCapture
  -> ancillarySelection
  -> seatSelection
  -> orderDrafting
  -> paymentInitiated
  -> paymentActionRequired
  -> paymentAuthorized
  -> orderCommitting
  -> confirmed

error branches:
  searching -> searchFailed
  resultsReady -> noAvailability
  repricing -> priceChanged | offerExpired
  passengerCapture -> validationFailed
  ancillarySelection -> ancillaryUnavailable
  seatSelection -> seatUnavailable
  paymentInitiated -> paymentFailed
  orderCommitting -> orderPending | orderFailed
```

## Core state object

```ts
export type BookingFlowState = {
  step: BookingStep;
  locale: string;
  market: string;
  currency: string;
  searchCriteria?: SearchCriteria;
  shoppingSession?: ShoppingSession;
  selectedOffer?: SelectedOffer;
  priceQuote?: PriceQuote;
  passengers: PassengerInput[];
  contact?: ContactInput;
  selectedSeats: SeatSelection[];
  selectedAncillaries: AncillarySelection[];
  orderDraft?: OrderDraft;
  paymentSession?: PaymentSession;
  confirmation?: OrderConfirmation;
  errors: BookingError[];
};
```

## Important identifiers

Use stable identifiers to avoid duplicate orders and payment ambiguity.

- `correlationId`: trace all calls in one user journey.
- `shoppingSessionId`: live shopping session from offer service.
- `offerSetId`: group of offers returned for a search.
- `offerId`: selected offer.
- `offerItemId`: selected flight/fare/ancillary item.
- `priceQuoteId`: validated quote used for order creation.
- `orderDraftId`: server-side draft before payment/order commit.
- `paymentSessionId`: PSP/BFF payment session.
- `idempotencyKey`: generated for every mutation.
- `orderId`: confirmed order identifier.
- `bookingReference`: PNR/record locator if legacy exists.
- `ticketNumber`: if e-ticket exists.

## Step details

### Step 1: Search

Input:

- Trip type: round-trip, one-way, multi-city.
- Origin and destination.
- Dates.
- Passenger counts.
- Cabin.
- Promo code.
- Award/miles flag if supported.

Validation:

- Origin and destination cannot be same.
- Date must be within airline selling horizon.
- Infant count cannot exceed adult count unless backend supports otherwise.
- Passenger count max based on airline policy.
- Promo code format only, not validity, can be checked client-side.

API:

- `POST /api/shopping/search-offers`

Output:

- `shoppingSessionId`.
- `offerSetId`.
- Offers.
- Warnings.
- Expiry time.

### Step 2: Results

UI responsibilities:

- Show outbound and inbound selection clearly.
- Show fare family options.
- Show total price after selection.
- Show important restrictions: non-refundable, no baggage, operated by partner, airport change.

Data responsibilities:

- Keep raw results in query cache.
- Keep selected offer in booking state.
- Refetch or revalidate if session expires.

### Step 3: Price validation

Why required:

- Flight availability and price can change between search and checkout.
- Ancillary prices can vary.
- Taxes/fees can change by market/payment method.

API:

- `POST /api/shopping/price-offer`

Rules:

- Continue only if backend returns a valid `priceQuoteId`.
- If price changed, show old vs new and require customer acceptance.
- If offer expired, return to results with updated search.

### Step 4: Passenger and contact

Capture only required information for the trip/market.

Do not:

- Force account creation.
- Over-validate names for Western-only assumptions.
- Store passport data in browser persistent storage.

Do:

- Explain that names must match travel document.
- Support saved travelers for logged-in users.
- Use server-side validation before order draft.

### Step 5: Seats

Data dependencies:

- Flight segments.
- Aircraft layout.
- Passenger eligibility.
- Fare family seat rules.
- Loyalty tier benefits.

API:

- `GET /api/shopping/seat-map?priceQuoteId=...`
- `POST /api/shopping/select-seats`

Rules:

- Seat price must be included in total before payment.
- If selected seat becomes unavailable, show alternatives.
- If seat map fails, allow skip.

### Step 6: Ancillaries

API:

- `GET /api/shopping/ancillaries?priceQuoteId=...`
- `POST /api/shopping/select-ancillaries`

Rules:

- Ancillaries can be per passenger, per segment, or per order.
- Show included allowance before upsell.
- If ancillary is unavailable for one passenger/segment, explain why.

### Step 7: Order draft

API:

- `POST /api/orders/draft`

Purpose:

- Validate passengers, contact, selected offer, seats, ancillaries.
- Lock or prepare required backend records if applicable.
- Return payable total and order draft expiry.

Rules:

- Must be idempotent.
- Must not create final confirmed order until payment flow defines status.
- Must return validation errors mapped to fields.

### Step 8: Payment

API:

- `POST /api/payments/session`
- `POST /api/payments/confirm`

Rules:

- Use PSP hosted fields, redirect, or wallet integration.
- Do not handle raw PAN in your frontend or backend unless you intentionally enter PCI scope.
- Payment confirmation must be idempotent.
- If customer refreshes, retrieve payment/order status instead of charging again.

### Step 9: Order commit

API:

- `POST /api/orders/commit`
- `GET /api/orders/{orderId}`

Rules:

- If payment is authorized but order commit is uncertain, show `pending` and support reference.
- Reconcile by backend webhook/job.
- Never show confirmed unless order service confirms.

## Price change pattern

When price changes:

- Show message: "The fare changed while you were booking. Please review the new total."
- Display previous total and new total.
- Explain whether only fare, tax, or ancillary changed.
- Require explicit customer confirmation.
- Keep passenger data if safe.

## Session expiry pattern

When shopping session expires:

- Show message: "Your fare session expired. Search again to get current availability."
- Offer one-click refresh using the same search criteria.
- Preserve non-sensitive passenger input only if policy allows.

## Payment uncertain pattern

When payment/order status is unclear:

- Do not tell the customer to pay again immediately.
- Show: "We are confirming your payment and booking."
- Show support reference.
- Poll backend order status with exponential backoff.
- Send email/SMS when resolved.
- Provide manage booking retrieval once confirmed.

## Booking analytics events

Use these canonical events:

```text
booking_search_submitted
booking_search_results_loaded
booking_search_no_availability
booking_offer_selected
booking_fare_family_opened
booking_price_validated
booking_price_changed
booking_passenger_started
booking_passenger_completed
booking_seat_map_loaded
booking_seat_selected
booking_ancillary_added
booking_payment_started
booking_payment_action_required
booking_payment_failed
booking_order_pending
booking_order_confirmed
booking_abandoned
```

Every event must include:

- correlation ID.
- market.
- locale.
- device category.
- trip type.
- route.
- passenger count.
- cabin.
- step.
- error code if applicable.

Do not include raw passenger names, passport numbers, emails, phone numbers, or card data in analytics events.
