/**
 * Machine-readable error codes shared across the BFF boundary and UI.
 * Source of truth mirrors the catalog in `05_api_contracts.md`.
 */

export const ERROR_CODES = [
  'SEARCH_NO_AVAILABILITY',
  'SEARCH_SERVICE_UNAVAILABLE',
  'OFFER_EXPIRED',
  'PRICE_CHANGED',
  'PRICE_QUOTE_EXPIRED',
  'PASSENGER_VALIDATION_FAILED',
  'SEAT_MAP_UNAVAILABLE',
  'SEAT_UNAVAILABLE',
  'ANCILLARY_UNAVAILABLE',
  'ORDER_DRAFT_FAILED',
  'PAYMENT_SESSION_FAILED',
  'PAYMENT_ACTION_REQUIRED',
  'PAYMENT_DECLINED',
  'PAYMENT_TIMEOUT',
  'ORDER_COMMIT_PENDING',
  'ORDER_COMMIT_FAILED',
  'MANAGE_RETRIEVE_FAILED',
  'ACTION_NOT_ALLOWED',
  'AUTH_REQUIRED',
  'AUTH_STEP_UP_REQUIRED',
  'RATE_LIMITED',
  'BOT_CHALLENGE_REQUIRED',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type NextAction =
  'retry' | 'refreshSearch' | 'contactSupport' | 'login' | 'acceptPriceChange';

export type ApiError = {
  code: ErrorCode | string;
  messageKey: string;
  userMessage?: string;
  fieldErrors?: Record<string, string[]>;
  supportReference?: string;
  retryable: boolean;
  nextAction?: NextAction;
};
