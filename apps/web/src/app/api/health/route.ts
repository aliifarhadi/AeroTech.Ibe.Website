/**
 * Health endpoint for Kubernetes liveness/readiness probes and load balancers.
 * Kept outside the `[locale]` segment and excluded from the i18n middleware matcher.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok', service: 'web' });
}
