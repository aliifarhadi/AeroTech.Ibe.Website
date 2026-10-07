# AGENTS.md - Coding Agent Instructions

This repository is for a modern airline B2C direct-channel website. Follow these rules when generating or editing code.

## Read first

Before coding, read:

1. `README.md`
2. `00_scope_gaps_questions.md`
3. `01_product_capability_map.md`
4. `02_ux_ia_routes.md`
5. `03_frontend_architecture.md`
6. `04_booking_engine_flow_state.md`
7. `05_api_contracts.md`
8. `06_design_system_components.md`
9. `07_pwa_performance_seo_a11y.md`
10. `08_security_compliance_observability.md`
11. `09_project_structure_and_agent_prompts.md`

## Non-negotiable engineering rules

- Use TypeScript strict mode.
- Prefer server components by default; use client components only for interaction.
- Keep client JavaScript small.
- Use feature-first folders.
- Use shared domain types; do not duplicate DTOs across features.
- Use Zod or generated schemas at API boundaries.
- Use decimal strings for money, never floating-point arithmetic.
- All order/payment/servicing mutations must include an idempotency key.
- All API calls must include or propagate a correlation ID.
- Do not store passenger PII, passport data, payment data, or tokens in localStorage.
- Do not implement real payment collection unless a PSP contract is provided.
- Do not put backend secrets in `NEXT_PUBLIC_*` variables.
- Do not cache private APIs in the service worker.
- Use accessible labels, focus states, and error messages for all inputs.
- Do not hard-code user-facing strings deep inside reusable components; use message keys or simple dictionaries.
- Support multiple languages with full LTR and RTL layouts. Use CSS logical properties (`inline-start`/`inline-end`, `margin-inline`, `padding-inline`, `start`/`end`) and set the `dir` attribute from market context; never hard-code physical `left`/`right` for directional layout.

## UX rules

- Mobile-first at 360px width.
- Design every screen for both LTR and RTL. Verify mirrored layout, directional icons (back/forward, plane direction, chevrons), text alignment, and form flow in at least one RTL locale.
- Every booking step must have loading, empty, error, and success states.
- Every error must give a next action.
- Price and total must be visible and consistent.
- Seat selection and ancillaries must be skippable if business rules allow.
- Never show confirmed booking unless the order API confirms it.
- If payment/order status is uncertain, show pending state and support reference.

## Testing rules

Implement or update tests when adding behavior.

Required test types:

- Unit tests for schemas, reducers/state machine, and money/date utilities.
- Component tests for reusable UI and forms.
- Playwright smoke tests for search-to-confirmation with mocks.
- Accessibility smoke tests for homepage, search results, passenger form, manage retrieval.
- Bidirectional rendering check: render the homepage and one booking step in an RTL locale and assert layout mirrors correctly (no clipped or misaligned controls).

## Mocking rules

- Use MSW for frontend mocks.
- Mock data must look realistic but not contain real passenger PII.
- Keep mock API shape aligned with `05_api_contracts.md`.
- Make error cases mockable: no availability, price changed, seat unavailable, payment declined, order pending.

## Code style

- Small components with clear props.
- Avoid unnecessary abstractions.
- Prefer composition over inheritance.
- No giant files.
- No business logic hidden in JSX.
- Put domain transformations in domain/api layers.
- Add comments only where the why is not obvious.

## Definition of done

A task is complete only when:

- It compiles.
- Typecheck passes.
- Lint passes.
- Relevant tests pass.
- Mobile layout is considered.
- Accessibility basics are implemented.
- Security rules above are not violated.
- README or docs are updated if behavior or commands changed.
