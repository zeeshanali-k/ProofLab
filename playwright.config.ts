import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'FRONTEND_ORIGIN=http://127.0.0.1:3001 uv run --project backend python -m uvicorn prooflab_api.main:app --app-dir backend --host 127.0.0.1 --port 8010',
      url: 'http://127.0.0.1:8010/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'NEXT_DIST_DIR=.next-e2e NEXT_PUBLIC_PROOFLAB_API_URL=http://127.0.0.1:8010 npm run dev -- --hostname 127.0.0.1 --port 3001',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
