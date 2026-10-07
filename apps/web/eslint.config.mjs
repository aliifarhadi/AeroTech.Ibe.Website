import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

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
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default eslintConfig;
