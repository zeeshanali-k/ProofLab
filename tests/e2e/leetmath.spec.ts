import { expect, test } from '@playwright/test';

async function setMathField(page, label: string, latex: string) {
  await page.getByLabel(label).evaluate((element, value) => {
    const field = element as unknown as { value: string };
    field.value = value as string;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, latex);
}

test.describe('LeetMath challenge arena', () => {
  test('uses clear active tabs and preserves dark mode between workspaces', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('link', { name: 'LeetMath' }).click();
    await expect(page).toHaveURL('/leetmath');
    await expect(page.getByRole('link', { name: 'LeetMath' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('link', { name: 'Learn', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible();
  });

  test('navigates from the dashboard and filters the 30-challenge catalog', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'LeetMath' }).click();
    await expect(page).toHaveURL('/leetmath');
    await expect(page.getByText('30 deterministic challenges')).toBeVisible();
    await expect(page.getByRole('link', { name: /Keep It Balanced/ })).toBeVisible();

    await page.getByRole('button', { name: 'Complex' }).click();
    await expect(page.getByRole('link', { name: /Both Roots Matter/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Keep It Balanced/ })).toHaveCount(0);
  });

  test('accepts Sign Switch and renders the number-line replay', async ({ page }) => {
    await page.goto('/leetmath/003');
    await setMathField(page, 'LeetMath answer', 'x < -2');
    await page.getByRole('button', { name: 'Submit answer' }).click();

    await expect(page.getByText('Mathematical contract satisfied', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Reality simulator').getByText('Verified')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Submission history' })).toBeVisible();
    await expect(page.getByText('accepted', { exact: true })).toBeVisible();
  });

  test('keeps an incomplete complex root set private and restores local draft work', async ({ page }) => {
    await page.goto('/leetmath/005');
    await setMathField(page, 'LeetMath answer', '\\{2i\\}');
    await page.getByRole('link', { name: 'LeetMath' }).click();
    await page.getByRole('link', { name: /Both Roots Matter/ }).click();
    await expect(page.getByLabel('LeetMath answer')).toHaveJSProperty('value', '\\{2i\\}');

    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not accepted yet', { exact: true })).toBeVisible();
    await expect(page.getByText('- 2 i', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByLabel('LeetMath answer')).toHaveJSProperty('value', '\\{ \\}');
  });
});
