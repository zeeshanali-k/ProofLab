import { expect, test } from '@playwright/test';
import { registerAccount } from './auth-helpers';

test.describe('platform guide', () => {
  test.beforeEach(async ({ page }) => { await registerAccount(page); });

  test('opens from a protected Math workspace and returns there intentionally', async ({ page }) => {
    await page.goto('/math');
    await page.getByRole('link', { name: 'Open the ProofLab platform guide' }).click();
    await expect(page).toHaveURL(/\/guide\?from=%2Fmath/);
    await expect(page.getByRole('heading', { name: 'Use the ProofLab visualizer with confidence.' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Math Lab guide sections' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to Math Lab' }).click();
    await expect(page).toHaveURL('/math');
  });

  test('allows switching between the protected lab guides', async ({ page }) => {
    await page.goto('/guide?from=%2Fdashboard');
    await page.getByRole('tab', { name: /Chemistry/ }).click();
    await expect(page.getByRole('heading', { name: 'Use Chemistry Lab with confidence.' })).toBeVisible();
  });
});
