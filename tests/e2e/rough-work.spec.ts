import { expect, test } from '@playwright/test';

async function openRoughBoard(page) {
  await page.getByRole('button', { name: 'Open rough work board' }).click();
  const board = page.getByRole('dialog', { name: /Rough work board for/ });
  await expect(board.getByRole('button', { name: 'Empty board' })).toBeVisible();
  return board;
}

async function drawRectangle(page, board) {
  await board.locator('[data-testid="toolbar-rectangle"]').check({ force: true });
  const canvas = board.locator('canvas.interactive');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('The Excalidraw canvas did not render.');

  const startX = bounds.x + bounds.width * 0.62;
  const startY = bounds.y + bounds.height * 0.45;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 140, startY + 80);
  await page.mouse.up();

  await expect.poll(async () => Number(await board.locator('[data-rough-work-elements]').getAttribute('data-rough-work-elements'))).toBeGreaterThan(0);
}

test.describe('persistent rough-work canvas', () => {
  test('opens over the ProofLab solution and restores board work after reload', async ({ page }) => {
    await page.goto('/');
    const startingUrl = page.url();
    let board = await openRoughBoard(page);
    await expect(page).toHaveURL(startingUrl);
    await drawRectangle(page, board);
    await page.waitForTimeout(350);

    await board.getByRole('button', { name: 'Close rough work board' }).click();
    await expect(page.getByRole('button', { name: 'Open rough work board' })).toBeFocused();

    await page.reload();
    board = await openRoughBoard(page);
    await expect(board.locator('[data-rough-work-elements]')).not.toHaveAttribute('data-rough-work-elements', '0');
  });

  test('keeps LeetMath rough work when the answer draft is reset', async ({ page }) => {
    await page.goto('/leetmath/003');
    await expect(page.getByLabel('LeetMath answer')).toBeVisible();
    const board = await openRoughBoard(page);
    await drawRectangle(page, board);

    await board.getByRole('button', { name: 'Close rough work board' }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();

    const reopenedBoard = await openRoughBoard(page);
    await expect(reopenedBoard.locator('[data-rough-work-elements]')).not.toHaveAttribute('data-rough-work-elements', '0');
  });
});
