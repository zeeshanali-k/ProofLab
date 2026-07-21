import type { Page } from '@playwright/test';

export async function registerAccount(page: Page) {
  const email = `e2e-${crypto.randomUUID()}@example.test`;
  await page.goto('/');
  await page.getByRole('tab', { name: 'Create account' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('prooflab-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('/dashboard');
}
