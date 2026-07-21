import { expect, test } from '@playwright/test';
import { registerAccount } from './auth-helpers';

test.describe('Math Foundations lab', () => {
  test('launches a visual activity, keeps it resumable, and gives deterministic feedback', async ({ page }) => {
    await registerAccount(page);
    await page.goto('/math/foundations');

    await expect(page.getByRole('heading', { name: 'Math Foundations' })).toBeVisible();
    await expect(page.getByText('10 MODULES · 20 ACTIVITIES')).toBeVisible();
    await page.getByRole('button', { name: /Manipulate the model/ }).click();
    await expect(page.getByText('GUIDED VISUAL MISSION')).toBeVisible();
    await page.getByLabel('Your answer').fill('wrong');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Try again')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Math Foundations' })).toBeVisible();
    await page.getByRole('button', { name: /Manipulate the model/ }).click();
    await expect(page.getByText('GUIDED VISUAL MISSION')).toBeVisible();
  });
});
