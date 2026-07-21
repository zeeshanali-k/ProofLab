import { expect, test } from '@playwright/test';
import { registerAccount } from './auth-helpers';

async function setMathField(page, label: string, latex: string) {
  await page.getByLabel(label).evaluate((element, value) => {
    const field = element as unknown as { value: string };
    field.value = value as string;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, latex);
}

test.describe('LeetMath challenge arena', () => {
  test.beforeEach(async ({ page }) => { await registerAccount(page); });

  test('uses clear active tabs and preserves dark mode between workspaces', async ({ page }) => {
    await page.goto('/math');
    await expect(page.getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('link', { name: 'LeetMath' }).click();
    await expect(page).toHaveURL('/leetmath');
    await expect(page.getByRole('link', { name: 'LeetMath' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('link', { name: 'Learn', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle color theme' })).toBeVisible();
  });

  test('navigates from the dashboard and filters the 30-challenge catalog', async ({ page }) => {
    await page.goto('/math');
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

  test('shows attempting and solved challenge progress in the catalog', async ({ page }) => {
    await page.goto('/leetmath/001');
    await setMathField(page, 'LeetMath answer', 'x = 4');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('link', { name: 'LeetMath' }).click();
    const card = page.getByRole('link', { name: /Keep It Balanced/ });
    await expect(card.getByText('Attempting', { exact: true })).toBeVisible();

    await card.click();
    await setMathField(page, 'LeetMath answer', 'x = 5');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('link', { name: 'LeetMath' }).click();
    await expect(page.getByRole('link', { name: /Keep It Balanced/ }).getByText('Solved', { exact: true })).toBeVisible();
  });

  test('typesets formula-bearing LeetMath guidance and format feedback', async ({ page }) => {
    await page.goto('/leetmath/022');
    await expect(page.locator('.challenge-brief li .katex')).toHaveCount(1);

    await setMathField(page, 'LeetMath answer', 'F(x) = 2x^3');
    await page.getByRole('button', { name: 'Submit answer' }).click();

    const result = page.locator('.submission-result');
    await expect(result.getByText('Format error', { exact: true })).toBeVisible();
    await expect(result.locator('.katex')).toHaveCount(1);
    await expect(result.locator('.katex-html')).toHaveCount(1);
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
