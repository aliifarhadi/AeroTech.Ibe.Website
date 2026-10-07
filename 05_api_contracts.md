# 05 - API Contracts and Integration

## API design principles

1. The browser talks to the web app/BFF, not directly to internal PSS services.
2. Every mutation uses an idempotency key.
3. Every response includes a correlation ID.
4. Money amounts are decimal strings, never floats.
5. Dates and times include timezone context.
6. UI-facing APIs return localized message keys and machine-readable error codes.
7. Backend-specific legacy fields are mapped to modern web DTOs.
8. Sensitive operations require session validation and, when needed, step-up authentication.

## Common headers

Request:

```http
X-Correlation-Id: uuid
X-Idempotency-Key: uuid-for-mutations
Accept-Language: en-US
X-Market: DE
X-Currency: EUR
X-Channel: WEB
X-Device-Class: mobile|desktop|tablet
```

Response:

```http
X-Correlation-Id: uuid
Cache-Control: no-store | private, no-store | public, max-age=...
```

## Common response envelope

```ts
export type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  warnings?: ApiWarning[];
  meta: {
    correlationId: string;
    serverTime: string;
  };
};

export type ApiError = {
  code: string;
  messageKey: string;
  userMessage?: string;
  fieldErrors?: Record<string, string[]>;
  supportReference?: string;
  retryable: boolean;
  nextAction?: 'retry' | 'refreshSearch' | 'contactSupport' | 'login' | 'acceptPriceChange';
};
```

## Shopping APIs

### POST `/api/shopping/search-offers`

Request:

```json
{
  "tripType": "ROUND_TRIP",
  "origin": "IKA",
  "destination": "DXB",
  "departureDate": "2026-09-12",
  "returnDate": "2026-09-20",
  "passengers": [
    { "type": "ADT", "count": 1 }
  ],
  "cabin": "ECONOMY",
  "promoCode": null,
  "awardSearch": false
}
```

Response:

```json
{
  "data": {
    "shoppingSessionId": "ssn_123",
    "offerSetId": "ofs_456",
    "expiresAt": "2026-06-30T12:20:00Z",
    "currency": "EUR",
    "offers": [
      {
        "offerId": "off_1",
        "total": { "amount": "425.30", "currency": "EUR" },
        "slices": [
          {
            "sliceId": "outbound",
            "segments": [
              {
                "segmentId": "seg_1",
                "marketingCarrier": "XX",
                "operatingCarrier": "XX",
                "flightNumber": "123",
                "origin": "IKA",
                "destination": "DXB",
                "departureDateTimeLocal": "2026-09-12T09:20:00+03:30",
                "arrivalDateTimeLocal": "2026-09-12T12:00:00+04:00",
                "durationMinutes": 130
              }
            ]
          }
        ],
        "fareFamilies": [
          {
            "fareFamilyId": "eco-flex",
            "name": "Economy Flex",
            "includedServices": ["1 checked bag", "standard seat"],
            "changePolicySummary": "Changes allowed with fee",
            "refundPolicySummary": "Refundable with fee",
            "priceDifference": { "amount": "75.00", "currency": "EUR" }
          }
        ]
      }
    ]
  },
  "meta": { "correlationId": "...", "serverTime": "..." }
}
```

### POST `/api/shopping/price-offer`

Request:

```json
{
  "shoppingSessionId": "ssn_123",
  "offerId": "off_1",
  "selectedFareFamilyId": "eco-flex",
  "selectedOfferItemIds": ["item_air_1"]
}
```

Response:

```json
{
  "data": {
    "priceQuoteId": "pq_789",
    "expiresAt": "2026-06-30T12:35:00Z",
    "total": { "amount": "500.30", "currency": "EUR" },
    "breakdown": [
      { "type": "FARE", "label": "Base fare", "amount": { "amount": "340.00", "currency": "EUR" } },
      { "type": "TAX", "label": "Taxes", "amount": { "amount": "85.30", "currency": "EUR" } },
      { "type": "FARE_FAMILY_UPSELL", "label": "Economy Flex", "amount": { "amount": "75.00", "currency": "EUR" } }
    ],
    "priceChanged": false
  }
}
```

## Passenger validation

### POST `/api/orders/validate-passengers`

Request:

```json
{
  "priceQuoteId": "pq_789",
  "passengers": [
    {
      "passengerId": "pax_1",
      "type": "ADT",
      "givenName": "Sara",
      "familyName": "Ahmadi",
      "dateOfBirth": "1990-03-20",
      "gender": null,
      "loyaltyProgram": "DOT",
      "loyaltyNumber": "123456789"
    }
  ],
  "contact": {
    "email": "customer@example.com",
    "phoneCountryCode": "+49",
    "phoneNumber": "1700000000"
  }
}
```

Response:

```json
{
  "data": {
    "valid": true,
    "normalizedPassengers": []
  }
}
```

## Seats

### GET `/api/shopping/seat-map?priceQuoteId=pq_789&segmentId=seg_1`

Response:

```json
{
  "data": {
    "segmentId": "seg_1",
    "aircraft": "A320",
    "currency": "EUR",
    "cabins": [
      {
        "cabin": "ECONOMY",
        "rows": [
          {
            "rowNumber": 12,
            "seats": [
              {
                "seatNumber": "12A",
                "status": "AVAILABLE",
                "characteristics": ["WINDOW"],
                "price": { "amount": "12.00", "currency": "EUR" },
                "eligiblePassengerIds": ["pax_1"]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### POST `/api/shopping/select-seats`

Request:

```json
{
  "priceQuoteId": "pq_789",
  "selections": [
    { "passengerId": "pax_1", "segmentId": "seg_1", "seatNumber": "12A" }
  ]
}
```

Response:

```json
{
  "data": {
    "selectedSeats": [],
    "total": { "amount": "512.30", "currency": "EUR" }
  }
}
```

## Ancillaries

### GET `/api/shopping/ancillaries?priceQuoteId=pq_789`

Response:

```json
{
  "data": {
    "categories": [
      {
        "category": "BAGGAGE",
        "items": [
          {
            "ancillaryId": "bag_20kg",
            "name": "Extra checked bag 20kg",
            "description": "Add one checked bag up to 20kg.",
            "price": { "amount": "40.00", "currency": "EUR" },
            "applicability": {
              "passengerIds": ["pax_1"],
              "segmentIds": ["seg_1"]
            }
          }
        ]
      }
    ]
  }
}
```

## Order APIs

### POST `/api/orders/draft`

Request:

```json
{
  "priceQuoteId": "pq_789",
  "passengers": [],
  "contact": {},
  "seatSelections": [],
  "ancillarySelections": [],
  "acceptedTermsVersion": "2026-06-01"
}
```

Response:

```json
{
  "data": {
    "orderDraftId": "od_123",
    "expiresAt": "2026-06-30T12:45:00Z",
    "payableTotal": { "amount": "552.30", "currency": "EUR" },
    "status": "READY_FOR_PAYMENT"
  }
}
```

### POST `/api/orders/commit`

Request:

```json
{
  "orderDraftId": "od_123",
  "paymentSessionId": "pay_456"
}
```

Response:

```json
{
  "data": {
    "orderId": "ord_987",
    "bookingReference": "ABC123",
    "status": "CONFIRMED",
    "ticketingStatus": "PENDING_OR_ISSUED",
    "createdAt": "2026-06-30T12:44:10Z"
  }
}
```

### GET `/api/orders/{orderId}`

Used for confirmation, manage booking, and polling uncertain states.

## Payment APIs

### POST `/api/payments/session`

Request:

```json
{
  "orderDraftId": "od_123",
  "paymentMethodType": "CARD",
  "returnUrl": "https://www.airline.com/book/payment/return"
}
```

Response:

```json
{
  "data": {
    "paymentSessionId": "pay_456",
    "provider": "ADYEN_OR_STRIPE_OR_OTHER",
    "clientSecret": "provider_owned_secret_if_safe_for_client",
    "redirectUrl": null,
    "requiresAction": false,
    "amount": { "amount": "552.30", "currency": "EUR" }
  }
}
```

### POST `/api/payments/confirm`

Response statuses:

- `AUTHORIZED`
- `DECLINED`
- `ACTION_REQUIRED`
- `PENDING`
- `FAILED`

## Manage booking APIs

### POST `/api/manage/retrieve`

Request:

```json
{
  "retrievalType": "BOOKING_REFERENCE",
  "reference": "ABC123",
  "familyName": "Ahmadi"
}
```

Response:

```json
{
  "data": {
    "orderId": "ord_987",
    "bookingReference": "ABC123",
    "summary": {
      "origin": "IKA",
      "destination": "DXB",
      "departureDate": "2026-09-12",
      "status": "CONFIRMED"
    }
  }
}
```

### GET `/api/manage/{orderId}/actions`

Returns allowed servicing actions:

```json
{
  "data": {
    "actions": [
      { "type": "ADD_BAG", "enabled": true },
      { "type": "CHANGE_FLIGHT", "enabled": true },
      { "type": "CANCEL_REFUND", "enabled": false, "reasonCode": "FARE_NOT_REFUNDABLE" }
    ]
  }
}
```

## Flight status APIs

### GET `/api/operations/flight-status?flightNumber=123&date=2026-09-12`

Response:

```json
{
  "data": {
    "flightNumber": "XX123",
    "date": "2026-09-12",
    "origin": "IKA",
    "destination": "DXB",
    "scheduledDepartureLocal": "2026-09-12T09:20:00+03:30",
    "estimatedDepartureLocal": "2026-09-12T09:45:00+03:30",
    "scheduledArrivalLocal": "2026-09-12T12:00:00+04:00",
    "estimatedArrivalLocal": "2026-09-12T12:25:00+04:00",
    "status": "DELAYED",
    "terminal": "1",
    "gate": "B4"
  }
}
```

## CMS APIs

Recommended content types:

- Homepage hero.
- Campaign banner.
- Destination page.
- Route page.
- Offer page.
- Help article.
- Travel advisory.
- Baggage policy.
- Fare family content.
- Legal terms.

API shape:

```json
{
  "slug": "dubai",
  "locale": "en-US",
  "market": "DE",
  "seo": {
    "title": "Flights to Dubai",
    "description": "Book flights to Dubai..."
  },
  "blocks": [
    { "type": "hero", "data": {} },
    { "type": "richText", "data": {} },
    { "type": "offerCarousel", "data": {} }
  ]
}
```

## Error code catalog

Start with this list:

```text
SEARCH_NO_AVAILABILITY
SEARCH_SERVICE_UNAVAILABLE
OFFER_EXPIRED
PRICE_CHANGED
PRICE_QUOTE_EXPIRED
PASSENGER_VALIDATION_FAILED
SEAT_MAP_UNAVAILABLE
SEAT_UNAVAILABLE
ANCILLARY_UNAVAILABLE
ORDER_DRAFT_FAILED
PAYMENT_SESSION_FAILED
PAYMENT_ACTION_REQUIRED
PAYMENT_DECLINED
PAYMENT_TIMEOUT
ORDER_COMMIT_PENDING
ORDER_COMMIT_FAILED
MANAGE_RETRIEVE_FAILED
ACTION_NOT_ALLOWED
AUTH_REQUIRED
AUTH_STEP_UP_REQUIRED
RATE_LIMITED
BOT_CHALLENGE_REQUIRED
```
