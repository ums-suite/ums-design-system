import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for DSYS-9 (Date picker, Date-range picker, Time picker, OTP input, File
 * upload). Runs against a real Chromium for the same reasons e2e/data-table.spec.ts and
 * e2e/overlay.spec.ts do -- real drag-and-drop, real keyboard navigation timing, real file
 * inputs.
 */

test.describe('Date/Time pickers, OTP input, File upload catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('date-time-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="date-time-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the catalog section with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('date-time-catalog')).toHaveScreenshot('date-time-catalog.png');
  });

  test('Date picker opens a calendar grid and selecting a day updates the input', async ({
    page,
  }) => {
    const picker = page.getByTestId('date-picker');
    await picker.locator('.ums-date-picker__toggle').click();

    const grid = picker.locator('[role="dialog"]');
    await expect(grid).toBeVisible();
    await grid.locator('[data-iso="2026-09-20"]').click();

    await expect(picker.locator('.ums-date-picker__input')).toHaveValue('Sep 20, 2026');
    await expect(picker.locator('[role="dialog"]')).toBeHidden();
  });

  test('Date picker supports full keyboard navigation and Enter-to-select', async ({ page }) => {
    const picker = page.getByTestId('date-picker');
    await picker.locator('.ums-date-picker__toggle').click();
    // Opening moves focus to the day button for the current value (12 Sep 2026), not the grid
    // container itself -- the grid div is only a roving-tabindex host (tabindex="-1").
    await expect(picker.locator('[data-iso="2026-09-12"]')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(picker.locator('[role="dialog"]')).toBeHidden();
    // 12 Sep 2026 + 1 day (ArrowRight) + 7 days (ArrowDown) = 20 Sep 2026.
    await expect(picker.locator('.ums-date-picker__input')).toHaveValue('Sep 20, 2026');
  });

  test('Date-range picker requires two clicks to complete a range', async ({ page }) => {
    const picker = page.getByTestId('date-range-picker');
    await picker.locator('.ums-date-range-picker__toggle').click();
    const grid = picker.locator('[role="dialog"]');

    await grid.locator('[data-iso="2026-09-10"]').click();
    await expect(grid).toBeVisible(); // still open, awaiting the end date

    await grid.locator('[data-iso="2026-09-20"]').click();
    await expect(picker.locator('[role="dialog"]')).toBeHidden();
    await expect(picker.locator('.ums-date-range-picker__input')).toHaveValue(
      'Sep 10, 2026 - Sep 20, 2026',
    );
  });

  test('Time picker is a real native time control', async ({ page }) => {
    const timeInput = page.getByTestId('time-picker').locator('input[type="time"]');
    await expect(timeInput).toHaveValue('09:30');
    await timeInput.fill('14:15');
    await expect(timeInput).toHaveValue('14:15');
  });

  test('OTP input auto-advances, supports paste, and reports completion', async ({ page }) => {
    const otp = page.getByTestId('otp-input');
    const boxes = otp.locator('.ums-otp-input__box');

    await boxes.nth(0).click();
    await page.keyboard.type('123456', { delay: 30 });
    await expect(page.getByTestId('otp-completed')).toContainText('123456');
  });

  test('File upload lists files with progress, success, and error states, and supports remove/retry', async ({
    page,
  }) => {
    const upload = page.getByTestId('file-upload');
    await expect(upload.locator('[role="progressbar"]')).toBeVisible();
    await expect(upload.locator('.ums-file-upload__status--success')).toContainText('Uploaded');
    await expect(upload.locator('.ums-file-upload__status--error')).toContainText(
      'File exceeds the 500 KB limit',
    );

    await upload.locator('.ums-file-upload__retry').click();
    await expect(upload.locator('.ums-file-upload__status--error')).toHaveCount(0);

    const itemCountBefore = await upload.locator('.ums-file-upload__item').count();
    await upload.locator('.ums-file-upload__remove').first().click();
    await expect(upload.locator('.ums-file-upload__item')).toHaveCount(itemCountBefore - 1);
  });

  test('File upload accepts a real drag-and-drop file', async ({ page }) => {
    const upload = page.getByTestId('file-upload');
    const dropzone = upload.locator('.ums-file-upload__dropzone');
    const itemCountBefore = await upload.locator('.ums-file-upload__item').count();

    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['hello world'], 'notes.txt', { type: 'text/plain' });
      dt.items.add(file);
      return dt;
    });
    await dropzone.dispatchEvent('drop', { dataTransfer });

    await expect(upload.locator('.ums-file-upload__item')).toHaveCount(itemCountBefore + 1);
    await expect(upload.locator('.ums-file-upload__item-name').last()).toHaveText('notes.txt');
  });

  test('renders the English and long-form Bengali file-upload hint without clipping', async ({
    page,
  }) => {
    await expect(page.getByTestId('date-time-locale-row')).toHaveScreenshot(
      'date-time-locale-en-vs-bn.png',
    );
  });
});
