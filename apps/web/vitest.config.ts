import { defineConfig } from 'vitest/config';

/** Unit tests for pure modules. Browser behaviour is covered by Playwright (see e2e/). */
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
