import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Browser tests run beside a developer's existing Next dev server.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default nextConfig;
