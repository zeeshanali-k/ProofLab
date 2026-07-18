import { expect, test } from '@playwright/test';

test.describe('canonical calculus and complex tasks', () => {
  test('shows completion for a verified derivative task', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Differentiate a polynomial/ }).click();

    await expect(page.getByLabel('Canonical progress: Complete')).toBeVisible();
    await expect(page.getByLabel('Transition evidence').getByText('correct derivative', { exact: true })).toBeVisible();
  });

  test('marks an incomplete complex solution set as needing correction', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Find both imaginary roots/ }).click();

    await expect(page.getByText('Check every root')).toBeVisible();
    await expect(page.getByLabel('Canonical progress: Needs correction')).toBeVisible();
  });

  test('reveals a canonical final form without changing the reasoning path', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Differentiate a polynomial/ }).click();
    await page.getByRole('button', { name: 'Reveal final form' }).click();

    await expect(page.getByText('Canonical form')).toBeVisible();
    await expect(page.getByLabel('Canonical progress: Complete')).toBeVisible();
  });

  test('keeps indefinite integration open ended with no reveal control', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Integrate polynomial and cosine/ }).click();

    await expect(page.getByRole('button', { name: 'Reveal final form' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add antiderivative' })).toBeVisible();
  });
});
