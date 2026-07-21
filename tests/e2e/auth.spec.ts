import { expect, test } from '@playwright/test';

async function setMathField(page, label: string, latex: string) {
  await page.getByLabel(label).evaluate((element, value) => {
    const field = element as unknown as { value: string };
    field.value = value as string;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, latex);
}

test('keeps account-owned progress through onboarding, Math, LeetMath, sign-out, and sign-in', async ({ page }) => {
  const email = `learner-${Date.now()}@example.test`;
  const password = 'prooflab-password';

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByRole('tab', { name: 'Create account' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Learning goal').selectOption('understand-concepts');
  await page.getByLabel('Current confidence').selectOption('new');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();

  await page.goto('/math');
  await page.getByRole('button', { name: 'Choose a problem' }).click();
  await page.getByRole('button', { name: /The missing middle term/ }).click();
  await page.getByRole('button', { name: 'Edit STEP 2' }).click();
  await setMathField(page, 'Equation input', 'x^2 + 4x + 4 = 25');
  await page.getByRole('button', { name: 'Check step' }).click();
  await expect(page.getByText('This step is verified')).toBeVisible();

  await page.goto('/leetmath/001');
  await setMathField(page, 'LeetMath answer', 'x = 5');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page.getByText('+35 XP earned')).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.locator('.dashboard-stats')).toContainText('40');

  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/?returnTo=%2Fdashboard');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.dashboard-stats')).toContainText('40');
});
