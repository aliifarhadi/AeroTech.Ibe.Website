import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import {
  designSystemRestrictions,
  illustrationRestrictions,
} from '@aerotech/config/eslint/design-system';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Design tokens only: no arbitrary Tailwind values, raw colours or physical directions.
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...designSystemRestrictions] },
  },
  {
    // Illustrations (canvas scenes, generated SVG art) carry their own palettes as data.
    files: ['src/**/*.art.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...illustrationRestrictions] },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
];

export default eslintConfig;
