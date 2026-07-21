import { expect, test } from '@playwright/test';

test.describe('Math Learn workspace resizing', () => {
  test('resizes both side panels with a pointer and the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const problemRail = page.locator('#problem-rail');
    const inspector = page.locator('#transition-inspector');
    const problemHandle = page.getByRole('separator', { name: 'Resize problem panel' });
    const inspectorHandle = page.getByRole('separator', { name: 'Resize evidence inspector' });
    await expect(problemHandle).toBeVisible();
    await expect(inspectorHandle).toBeVisible();

    const initialProblemWidth = (await problemRail.boundingBox())?.width ?? 0;
    const problemHandleBox = await problemHandle.boundingBox();
    if (!problemHandleBox) throw new Error('Problem resize handle was not laid out.');
    await page.mouse.move(problemHandleBox.x + problemHandleBox.width / 2, problemHandleBox.y + problemHandleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(problemHandleBox.x + 96, problemHandleBox.y + problemHandleBox.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => (await problemRail.boundingBox())?.width ?? 0).toBeGreaterThan(initialProblemWidth + 70);

    const initialInspectorWidth = (await inspector.boundingBox())?.width ?? 0;
    await inspectorHandle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await inspector.boundingBox())?.width ?? 0).toBeGreaterThan(initialInspectorWidth);
    await expect(inspectorHandle).toHaveAttribute('aria-valuetext', /pixels/);

    await page.setViewportSize({ width: 1000, height: 900 });
    await expect(problemHandle).toBeHidden();
    await expect(inspectorHandle).toBeHidden();
  });
});
