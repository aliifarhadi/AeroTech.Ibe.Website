import { z } from 'zod';

/** IATA airport/city code: three uppercase letters. */
export const airportCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'INVALID_AIRPORT_CODE');

export const tripTypeSchema = z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']);
export const cabinSchema = z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']);
export const passengerTypeSchema = z.enum(['ADT', 'CHD', 'INF']);

export const passengerCountSchema = z.object({
  type: passengerTypeSchema,
  count: z.number().int().min(0).max(9),
});

export const searchCriteriaSchema = z
  .object({
    tripType: tripTypeSchema,
    origin: airportCodeSchema,
    destination: airportCodeSchema,
    departureDate: z.string().date(),
    returnDate: z.string().date().optional(),
    passengers: z.array(passengerCountSchema).min(1),
    cabin: cabinSchema,
    promoCode: z.string().trim().max(32).optional().nullable(),
    awardSearch: z.boolean().default(false),
  })
  .refine((c) => c.origin !== c.destination, {
    message: 'ORIGIN_DESTINATION_SAME',
    path: ['destination'],
  })
  .refine((c) => c.tripType !== 'ROUND_TRIP' || Boolean(c.returnDate), {
    message: 'RETURN_DATE_REQUIRED',
    path: ['returnDate'],
  });

export type SearchCriteria = z.infer<typeof searchCriteriaSchema>;
export type TripType = z.infer<typeof tripTypeSchema>;
export type Cabin = z.infer<typeof cabinSchema>;
export type AirportCode = z.infer<typeof airportCodeSchema>;
