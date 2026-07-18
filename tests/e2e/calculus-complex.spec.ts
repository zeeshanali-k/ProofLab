import { expect, test } from '@playwright/test';

test.describe('calculus and complex learning modes', () => {
  test('repairs an incorrect polynomial derivative using FastAPI evidence', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Differentiate a polynomial/ }).click();

    await expect(page.getByText('Derivative check: try x = 3')).toBeVisible();
    await page.getByRole('button', { name: 'Show repair' }).click();
    await page.getByRole('button', { name: 'Apply and check' }).click();

    await expect(page.getByLabel('Transition evidence').getByText('correct derivative', { exact: true })).toBeVisible();
  });

  test('repairs an incomplete complex solution set', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Find both imaginary roots/ }).click();

    await expect(page.getByText('Check every root')).toBeVisible();
    await expect(page.getByText('Missing:')).toBeVisible();
    await page.getByRole('button', { name: 'Show repair' }).click();
    await page.getByRole('button', { name: 'Apply and check' }).click();

    await expect(page.getByLabel('Transition evidence').getByText('solution set complete', { exact: true })).toBeVisible();
  });
});
