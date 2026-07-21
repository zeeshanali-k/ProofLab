import { expect, test } from '@playwright/test';

test.describe('canonical calculus and complex tasks', () => {
  test('shows the inequality sign-flip number line, then completes after correction', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Flip the inequality sign/ }).click();

    const inspector = page.getByLabel('Transition evidence');
    await expect(inspector.getByRole('heading', { name: 'Reverse the inequality sign' })).toBeVisible();
    await expect(inspector.getByText('Mistake pattern')).toBeVisible();
    await expect(inspector.getByText('Sign did not flip')).toBeVisible();
    await expect(inspector.getByText('Reality check:')).toBeVisible();
    await expect(inspector.getByText('The correct region does not accept it; your region accepts it.')).toBeVisible();
    await expect(page.getByLabel('Canonical progress: Needs correction')).toBeVisible();

    await page.getByRole('button', { name: 'Edit STEP 3' }).click();
    const field = page.getByLabel('Equation input');
    await field.evaluate((element, latex) => {
      const mathField = element as unknown as { value: string };
      mathField.value = latex;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, 'x < -2');
    await page.getByRole('button', { name: 'Check step' }).click();

    await expect(inspector.getByText('Verified solution region')).toBeVisible();
    await expect(page.getByLabel('Canonical progress: Complete')).toBeVisible();
  });

  test('coaches a repeated derivative notation mistake without revealing the answer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Differentiate a trig chain/ }).click();
    await page.getByRole('button', { name: 'Add next derivative' }).click();

    const field = page.getByLabel('Equation input');
    await field.evaluate((element, latex) => {
      const mathField = element as unknown as { value: string };
      mathField.value = latex;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, "f'(x) = 36x\\sin(3x^2 + 1)");
    await page.getByRole('button', { name: 'Check step' }).click();

    const inspector = page.getByLabel('Transition evidence');
    await expect(inspector.getByRole('heading', { name: 'Advance the derivative order' })).toBeVisible();
    await expect(inspector.locator('.finding-text p').first()).toContainText('the next derivative must be');
    await expect(inspector.locator('.finding-text .katex')).toHaveCount(3);
    await expect(inspector.getByText('Use the product rule: differentiate the factors separately, then combine the resulting terms.')).toBeVisible();
    await expect(inspector.getByText('Use the chain rule for the polynomial inside the trigonometric function.')).toBeVisible();
    await expect(inspector.getByText('Expected', { exact: true })).toHaveCount(0);
  });

  test('typesets every formula in a sampled derivative comparison', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose a problem' }).click();
    await page.getByRole('button', { name: /Differentiate a trig chain/ }).click();
    await page.getByRole('button', { name: 'Delete STEP 2' }).click();
    await page.getByRole('button', { name: 'Add next derivative' }).click();

    const field = page.getByLabel('Equation input');
    await field.evaluate((element, latex) => {
      const mathField = element as unknown as { value: string };
      mathField.value = latex;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, "f'(x) = 6x\\cos(3x^2 + 2)");
    await page.getByRole('button', { name: 'Check step' }).click();

    const inspector = page.getByLabel('Transition evidence');
    await expect(inspector.getByText('Derivative check: try')).toBeVisible();
    await expect(inspector.locator('.counterexample-card h3 .katex')).toHaveCount(1);
    await expect(inspector.locator('.calc-result .katex')).toHaveCount(2);
    await expect(inspector.locator('.calc-result .katex-html')).toHaveCount(2);
  });

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
