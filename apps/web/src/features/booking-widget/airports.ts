export type AirportOption = {
  code: string;
  city: string;
  country: string;
  cityFa: string;
  countryFa: string;
  airportName?: string;
  airportNameFa?: string;
};

// Seed data for the V1 mocked search experience. Replace with the airport search API
// when the BFF contract is connected; the component contract stays the same.
export const AIRPORTS: AirportOption[] = [
  { code: 'IKA', city: 'Tehran', country: 'Iran', cityFa: 'تهران', countryFa: 'ایران' },
  {
    code: 'DXB',
    city: 'Dubai',
    country: 'United Arab Emirates',
    cityFa: 'دبی',
    countryFa: 'امارات متحده عربی',
  },
  {
    code: 'DOH',
    city: 'Doha',
    country: 'Qatar',
    cityFa: 'دوحه',
    countryFa: 'قطر',
    airportName: 'Hamad International Airport',
    airportNameFa: 'فرودگاه بین‌المللی حمد',
  },
  { code: 'IST', city: 'Istanbul', country: 'Türkiye', cityFa: 'استانبول', countryFa: 'ترکیه' },
  { code: 'LHR', city: 'London', country: 'United Kingdom', cityFa: 'لندن', countryFa: 'بریتانیا' },
  { code: 'BER', city: 'Berlin', country: 'Germany', cityFa: 'برلین', countryFa: 'آلمان' },
  { code: 'CDG', city: 'Paris', country: 'France', cityFa: 'پاریس', countryFa: 'فرانسه' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', cityFa: 'فرانکفورت', countryFa: 'آلمان' },
  {
    code: 'JFK',
    city: 'New York',
    country: 'United States',
    cityFa: 'نیویورک',
    countryFa: 'ایالات متحده',
  },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', cityFa: 'سنگاپور', countryFa: 'سنگاپور' },
];

export function airportLabel(airport: AirportOption, persian = false): string {
  return `${persian ? airport.cityFa : airport.city} (${airport.code})`;
}
