import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aerotech/domain', '@aerotech/ui', '@aerotech/api-client'],
  // Produce a minimal self-contained server for Docker/Kubernetes images.
  // Gated behind an env flag because standalone tracing creates symlinks, which fail on
  // Windows without admin/Developer Mode. The Dockerfile (Linux) sets BUILD_STANDALONE=1.
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
  // Trace files from the monorepo root so workspace packages are included in the bundle.
  outputFileTracingRoot: path.join(dirname, '../../'),
};

export default withNextIntl(nextConfig);
