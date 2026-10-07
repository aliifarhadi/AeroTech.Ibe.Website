import type { ApiError } from '@aerotech/domain';

/**
 * Typed BFF client. Phase 1 fleshes out the shopping/order/payment/manage endpoints
 * and MSW handlers (see 05_api_contracts.md). This entry establishes the cross-cutting
 * rules that every call must follow: correlation IDs on all requests and idempotency
 * keys on every mutation.
 */

export type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  warnings?: { code: string; messageKey: string }[];
  meta: {
    correlationId: string;
    serverTime: string;
  };
};

export const CORRELATION_HEADER = 'X-Correlation-Id';
export const IDEMPOTENCY_HEADER = 'X-Idempotency-Key';

/** Generate an id for tracing or idempotency. Uses Web Crypto where available. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback for environments without Web Crypto; not used in browser/Next runtime.
  return `id-${Date.now()}-${Math.round(Number.MAX_SAFE_INTEGER * 0.5)}`;
}

export type RequestOptions = {
  /** Marks the call as a mutation: an idempotency key header is required and added. */
  mutation?: boolean;
  correlationId?: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
};

export function buildHeaders(options: RequestOptions = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [CORRELATION_HEADER]: options.correlationId ?? newId(),
    ...options.headers,
  };
  if (options.mutation) {
    headers[IDEMPOTENCY_HEADER] = options.idempotencyKey ?? newId();
  }
  return headers;
}
