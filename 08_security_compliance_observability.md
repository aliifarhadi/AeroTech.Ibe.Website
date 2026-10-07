# 08 - Security, Compliance, and Observability

## Security principles

1. Keep secrets server-side.
2. Keep tokens out of localStorage.
3. Do not store raw card data.
4. Minimize passenger PII in browser storage.
5. Require idempotency for every mutation.
6. Use explicit authorization checks for manage booking and profile actions.
7. Treat booking reference plus surname as sensitive access.
8. Rate-limit shopping, retrieval, login, and payment.
9. Log safely with correlation IDs, not PII.
10. Fail safely when transaction status is uncertain.

## Authentication and session

Recommended:

- OIDC/OAuth 2.1 compatible identity provider.
- Authorization Code Flow with PKCE.
- HTTP-only, Secure, SameSite cookies for web session.
- Refresh token rotation server-side if needed.
- Passkeys/WebAuthn as optional modern login.
- MFA or risk-based step-up for sensitive actions.

Sensitive actions:

- Change password/email/phone.
- Add or remove saved payment method.
- Refund/cancel/change booking.
- View full passenger details for retrieved booking.
- Add high-risk SSRs.

Avoid:

- Long-lived JWT in localStorage.
- Client-only authorization decisions.
- Exposing internal service URLs.

## Manage booking retrieval security

Booking reference plus surname is convenient but risky.

Controls:

- Rate limit by IP, device, and reference attempts.
- Bot protection after suspicious attempts.
- Do not reveal whether reference or surname was wrong.
- Mask sensitive passenger/contact details until verified if required.
- Require step-up for change/cancel/refund if user is not logged in.
- Audit retrieval and servicing actions.

## Payment compliance

Recommended approach:

- Use PSP hosted fields, payment components, or redirect.
- Tokenize saved cards through PSP only.
- Keep website and BFF out of raw PAN handling.
- Use 3DS/SCA where required.
- Use webhooks for final payment truth.
- Reconcile payment and order asynchronously.

Do not:

- Log card data.
- Send card data through analytics.
- Store CVV.
- Retry payment automatically without customer action.

## PII handling

PII examples:

- Passenger name.
- Date of birth.
- Passport/document data.
- Email and phone.
- Loyalty number.
- Payment token.
- Booking reference can be sensitive when combined with surname.

Rules:

- Mask PII in logs.
- Redact PII in session replay.
- Store only necessary draft data.
- Expire abandoned booking drafts.
- Encrypt sensitive server-side storage.
- Define data retention by market/legal policy.

## Security headers

Use:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Content-Security-Policy: default-src 'self'; ...
```

CSP must be designed with PSP, tag manager, analytics, and CMS image domains. Start strict and add only required sources.

## Bot and abuse protection

Protect:

- Offer search.
- Low-fare calendar.
- Login.
- Signup.
- Manage booking retrieval.
- Payment session creation.
- Promo code validation.

Signals:

- Rate limits.
- Device fingerprinting if legally approved.
- Behavioral anomaly.
- CAPTCHA only when needed and accessible.
- Server-side fraud scoring for payment.

## Idempotency

Every mutation must include idempotency.

Required for:

- Price acceptance.
- Passenger validation if it creates a draft.
- Seat selection.
- Ancillary selection.
- Order draft.
- Payment session.
- Payment confirm.
- Order commit.
- Manage booking change/cancel/refund.

Idempotency behavior:

- Same key and same payload returns same result.
- Same key and different payload returns conflict.
- Keys expire after defined TTL.
- Store correlation and customer/session context.

## Observability

### Correlation

Generate one `correlationId` at journey start and propagate through:

- Browser logs.
- Next.js server.
- BFF.
- PSS services.
- Payment service.
- Order service.
- Notification service.

### Frontend monitoring

Track:

- Web Vitals.
- JS errors.
- API errors.
- Route transitions.
- Long tasks.
- Resource timing.
- Checkout abandonment.
- Rage clicks or repeated errors, if privacy-approved.

### Backend monitoring

Track:

- API latency p50/p95/p99.
- Error rate by endpoint and code.
- Search-to-order conversion.
- Payment authorization success.
- Order commit pending rate.
- PSP webhook delays.
- Queue lag.
- Downstream service health.

### Business observability

Dashboards:

- Booking funnel.
- Revenue and AOV.
- Ancillary attach rate.
- Search no-availability rate.
- Price change rate.
- Payment failure reasons.
- Manage booking action completion.
- Flight status/check-in usage.

## Logging rules

Allowed:

- Correlation ID.
- Session ID hash.
- Market/locale.
- Route.
- Endpoint.
- Error code.
- Timing.
- Offer ID/order ID if policy allows.

Not allowed:

- Full passenger name.
- Passport number.
- Email/phone raw.
- Card data.
- CVV.
- Full address.
- Access tokens.
- Refresh tokens.

## Incident scenarios to design for

### Payment approved, order failed

Response:

- Show pending confirmation.
- Do not ask customer to pay again.
- Backend reconciles with PSP and order service.
- Notify customer when resolved.
- Provide support reference.

### Search service degraded

Response:

- Show friendly outage/degraded message.
- Offer flight status/help pages.
- Avoid showing stale fares as bookable.

### Seat map unavailable

Response:

- Allow continue without seat selection.
- Explain seat can be assigned later/at check-in.

### CMS unavailable

Response:

- Serve cached content.
- Keep booking widget functional.

### Auth provider unavailable

Response:

- Allow anonymous shopping if possible.
- Disable profile/manage-by-login and allow booking reference retrieval if safe.

## Compliance checklist

- GDPR/privacy notice.
- Cookie consent by market.
- PCI scope assessment.
- PSD2/SCA for applicable payments.
- Accessibility WCAG 2.2 AA.
- Data residency requirements.
- Terms and conditions versioning.
- Audit logs for order servicing.
- Retention policy for abandoned carts/drafts.
- DPA/vendor review for PSP, analytics, CMS, monitoring, chatbot.
