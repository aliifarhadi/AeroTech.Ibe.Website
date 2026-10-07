# 06 - Design System and Components

## Design direction

The visual direction should feel premium, calm, trustworthy, and operationally clear. Airline customers are often stressed, mobile, time-sensitive, and comparing prices. The UI must balance brand emotion with transactional clarity.

## Design principles

1. Premium but not heavy.
2. Fast to scan.
3. Clear hierarchy of price, time, and restrictions.
4. Accessible contrast and focus states.
5. Mobile-first with large touch targets.
6. Reusable across booking, manage booking, check-in, and content.
7. Localizable: text expansion must not break layouts.
8. Bidirectional: every component must work in both LTR and RTL without redesign; build with logical properties, not physical left/right.
9. Operational states must be visually distinct.

## Token categories

```text
tokens
├── color
│   ├── brand
│   ├── surface
│   ├── text
│   ├── border
│   ├── status
│   └── loyalty-tier
├── typography
├── spacing
├── radius
├── shadow
├── z-index
├── motion
├── breakpoint
└── component
```

## Example token model

```ts
export const tokens = {
  color: {
    brand: {
      primary: 'var(--color-brand-primary)',
      secondary: 'var(--color-brand-secondary)',
      accent: 'var(--color-brand-accent)'
    },
    status: {
      success: 'var(--color-status-success)',
      warning: 'var(--color-status-warning)',
      danger: 'var(--color-status-danger)',
      info: 'var(--color-status-info)'
    }
  },
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem'
  }
};
```

## Required components

### Foundation

- AppShell.
- Header.
- MobileNav.
- Footer.
- Breadcrumb.
- PageContainer.
- Section.
- Grid.
- Stack.
- Divider.
- SkipLink.

### Inputs

- TextField.
- Select.
- Combobox.
- AirportAutocomplete.
- DatePicker.
- DateRangePicker.
- PassengerSelector.
- CabinSelector.
- PromoCodeInput.
- Checkbox.
- RadioGroup.
- Switch.
- PhoneInput.
- PaymentMethodSelector.

### Feedback

- Alert.
- Toast.
- InlineError.
- FieldError.
- LoadingSkeleton.
- ProgressStepper.
- EmptyState.
- ErrorState.
- MaintenanceBanner.
- SessionTimer.

### Overlay

- Modal.
- Drawer.
- BottomSheet.
- Popover.
- Tooltip.
- CommandPalette optional.

### Booking

- BookingWidget.
- TripTypeTabs.
- SearchSummaryBar.
- FlightResultCard.
- FlightSegmentTimeline.
- FareFamilyCard.
- FareComparisonTable.
- PriceBreakdown.
- TripSummaryPanel.
- PassengerForm.
- TravelerPicker.
- SeatMap.
- SeatLegend.
- AncillaryCard.
- PaymentSummary.
- ConfirmationPanel.

### Manage and travel day

- BookingRetrieveForm.
- TripTimeline.
- OrderStatusBadge.
- ManageActionCard.
- ReceiptDownloadCard.
- FlightStatusSearch.
- FlightStatusCard.
- CheckInRetrieveForm.

### Content

- Hero.
- CampaignBanner.
- DestinationCard.
- OfferCard.
- RouteSeoBlock.
- RichText.
- FAQAccordion.
- NoticeBanner.
- HelpSearch.

## Booking widget specification

### Desktop layout

- Tabs at top: Book, Manage, Check-in, Flight status.
- Search controls in one or two rows.
- CTA aligned right.
- Promo code and multi-city as secondary actions.

### Mobile layout

- Tabs as horizontal scroll or segmented control.
- Inputs stacked.
- Airport fields can swap origin/destination.
- Date picker full-screen.
- Passenger selector bottom sheet.
- Search CTA full width and sticky if form is long.

### Accessibility

- Tabs use proper ARIA roles or native patterns.
- Date picker supports keyboard navigation.
- Combobox announces suggestions.
- Errors are linked to fields with `aria-describedby`.
- Search CTA is reachable without gestures.

## Flight result card

Must show:

- Departure time and airport.
- Arrival time and airport.
- Duration.
- Stops.
- Operating carrier if different.
- Aircraft optional.
- Fare family price options.
- Baggage inclusion indicator.
- Carbon/emissions optional.
- Details expandable.

Mobile priority order:

1. Times.
2. Route/stop.
3. Price.
4. Fare family.
5. Restrictions/details.

## Fare family card

Must show:

- Brand name.
- Price or price difference.
- Included checked/cabin bag.
- Seat selection inclusion.
- Change/refund summary.
- Miles earning.
- CTA: Select.

Avoid:

- Long fare-rule text in the card.
- Ambiguous labels like "best" unless rules are defined.

## Seat map component

Requirements:

- Virtualized rendering for large aircraft.
- Zoom or fit mode for mobile.
- Legend always available.
- Screen reader alternate list view.
- Exit-row restrictions.
- Passenger tabs/chips for assigning seats.
- Per-segment navigation.

## Price breakdown component

Display:

- Base fare.
- Taxes.
- Carrier imposed charges if legally shown separately.
- Ancillaries.
- Discounts.
- Payment fee if applicable and legal.
- Total.

Rules:

- Use decimal-safe formatting.
- Currency code visible when market ambiguity exists.
- Do not show a different total in different parts of the page.

## Responsive breakpoints

Use content-based layout, but define these defaults:

```text
xs: 360px
sm: 480px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1440px
```

## Bidirectional and multi-language support

The design system must support both LTR and RTL languages as a core capability, not a retrofit.

### Layout rules

- Use CSS logical properties everywhere: `margin-inline`, `padding-inline`, `inset-inline-start/end`, `text-align: start/end`, `border-inline-*`. Do not use physical `left`/`right`/`margin-left` for directional layout.
- Drive direction from market context by setting `dir="rtl"` or `dir="ltr"` on the document root; components read direction from context, not from hard-coded values.
- Flexbox/grid order must follow logical flow so rows mirror automatically in RTL.
- Sticky bars, drawers, bottom sheets, and steppers must mirror their open/close direction and progress direction in RTL.

### Iconography and direction

- Mirror directional icons in RTL: back/forward arrows, chevrons, breadcrumb separators, progress arrows, and the plane/route direction in flight cards and timelines.
- Do not mirror non-directional or universal icons (logos, baggage, meal, clock, payment marks).

### Text, numerals, and data

- Allow for text expansion/contraction across languages without clipping or layout shift.
- Format dates, times, currency, and numbers by locale; keep airport codes, flight numbers, currency codes, and seat numbers in their canonical LTR form even inside RTL text.
- Use the Unicode bidi algorithm correctly so mixed LTR/RTL strings (e.g. "DXB → IKA" inside Arabic text) render in the right order.

### Component requirements

- Every reusable component ships with a story/test verifying both directions.
- AirportAutocomplete, DatePicker, PassengerSelector, SeatMap, and PriceBreakdown must be explicitly validated in RTL.
- Forms must align labels, errors, and input affordances to the start edge in both directions.

## Touch target rules

- Minimum target size: 44px by 44px.
- Seat map can be smaller visually, but tap area should remain usable.
- Bottom sticky CTA must not cover form fields.
- Respect safe-area insets on iOS.

## Motion rules

- Use motion for continuity, not decoration.
- Respect `prefers-reduced-motion`.
- Avoid long animations in checkout.
- Use skeletons rather than spinners for content loading.

## Iconography

Needed icons:

- Plane departure/arrival.
- Calendar.
- Passenger.
- Cabin/seat.
- Baggage.
- Meal.
- Lounge.
- Wi-Fi.
- Refund/change.
- Warning/error/success.
- Loyalty miles.
- Payment/wallet.
- Download.
- Check-in.
- Flight status.

## Content tone

Use direct, calm, human language.

Examples:

- Good: "Your fare changed. Review the new total before continuing."
- Avoid: "An error occurred."
- Good: "Seat 12A is no longer available. Choose another seat or continue without selecting a seat."
- Avoid: "Seat selection failed."

## Accessibility checklist for components

Every component must include:

- Keyboard behavior.
- Focus visible style.
- Screen reader label/description.
- Disabled and loading states.
- Error state.
- High-contrast validation.
- RTL and LTR layout correctness, verified in both directions.
- Unit tests for key behavior.
