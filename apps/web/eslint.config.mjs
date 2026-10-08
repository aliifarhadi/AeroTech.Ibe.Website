import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { designSystemRestrictions } from '@aerotech/config/eslint/design-system';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Design-system guardrail: forbid hardcoded hex colors in Tailwind arbitrary values
// (e.g. `bg-[#9d1b5c]`). Use brand tokens instead — brand-*, accent-*, neutral-*, black,
// white, or a semantic token like `bg-surface`. Defined in apps/web/src/app/globals.css.
const NO_HEX_MESSAGE =
  'Hardcoded hex colors are not allowed. Use a brand token (bg-brand-400, text-black, bg-brand-50, bg-surface, …) instead.';
const HEX_CLASS = '-\\[#[0-9a-fA-F]{3,8}';

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${HEX_CLASS}/]`, message: NO_HEX_MESSAGE },
        { selector: `TemplateElement[value.raw=/${HEX_CLASS}/]`, message: NO_HEX_MESSAGE },
      ],
    },
  },
  {
    // Redesigned routes and their features: design tokens only (see @aerotech/config/eslint/design-system).
    files: ['src/app/(next)/**/*.{ts,tsx}', 'src/features/next/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...designSystemRestrictions] },
  },
  {
    // The current site must not import the design-system barrel: it pulls every primitive (and
    // React Aria) into its bundles. `cn` has its own client-free entry.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/(next)/**', 'src/features/next/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@aerotech/ui',
              message:
                "Import `cn` from '@aerotech/ui/cn'. The primitives are for the redesigned routes only.",
            },
          ],
        },
      ],
    },
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
