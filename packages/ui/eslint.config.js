import base from '@aerotech/config/eslint';
import { designSystemRestrictions } from '@aerotech/config/eslint/design-system';

export default [
  ...base,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...designSystemRestrictions] },
  },
];
