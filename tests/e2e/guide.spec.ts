import { expect, test } from '@playwright/test';

test('opens the platform guide and returns to the unchanged proof board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add next step' }).click();
  await expect(page.getByLabel('Add next step')).toBeVisible();

  await page.getByRole('button', { name: 'Open ProofLab guide' }).click();

  const guide = page.getByLabel('Use the ProofLab visualizer with confidence.');
  await expect(guide).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Guide sections' })).toBeVisible();
  await expect(guide.getByText('Checked', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Mode controls' }).click();
  await expect(guide.getByText('Add equivalent step / Submit solution set')).toBeVisible();

  await page.getByRole('button', { name: 'Back to proof' }).click();
  await expect(page.getByLabel('Add next step')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The missing middle term' })).toBeVisible();
});

test('closes the platform guide with Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open ProofLab guide' }).click();
  await expect(page.getByLabel('Use the ProofLab visualizer with confidence.')).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page.getByLabel('Reasoning path')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open ProofLab guide' })).toBeFocused();
});
