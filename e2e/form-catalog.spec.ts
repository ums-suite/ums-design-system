import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-8 form primitive family (FormField, Input, Textarea, Select,
 * Combobox). Mirrors e2e/button-family.spec.ts's structure.
 *
 * Covers:
 *  - an automated a11y scan (axe-core) with zero violations;
 *  - screenshot-diffing visual regression across every control's default/invalid states;
 *  - Combobox keyboard operability (ArrowDown/Enter to select, Escape to revert);
 *  - an English-label vs. long-form Bengali-error comparison (design-decisions.md "Locale-Safe
 *    Component Sizing Verification").
 */

test.describe('Form primitives catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('form-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="form-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the input row with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('input-row')).toHaveScreenshot('form-input-row.png');
  });

  test('renders the invalid-state row with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('input-invalid-row')).toHaveScreenshot(
      'form-input-invalid-row.png',
    );
  });

  test('renders the select and combobox rows with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('select-row')).toHaveScreenshot('form-select-row.png');
    await expect(page.getByTestId('combobox-row')).toHaveScreenshot('form-combobox-row.png');
  });

  test('Combobox supports keyboard-only selection (ArrowDown, Enter)', async ({ page }) => {
    const comboboxInput = page.locator('[data-testid="combobox-city"] input');
    await comboboxInput.click();
    await comboboxInput.press('ArrowDown');
    await expect(page.locator('[role="listbox"]')).toBeVisible();
    await comboboxInput.press('Enter');
    await expect(comboboxInput).toHaveValue('Dhaka');
    await expect(page.locator('[role="listbox"]')).toBeHidden();
  });

  test('Combobox reverts an uncommitted query on Escape', async ({ page }) => {
    const comboboxInput = page.locator('[data-testid="combobox-city"] input');
    await comboboxInput.fill('zzz-no-such-place');
    await expect(page.locator('.ums-combobox__empty')).toBeVisible();
    await comboboxInput.press('Escape');
    await expect(comboboxInput).toHaveValue('');
  });

  test('renders the English error and a long-form Bengali error without clipping', async ({
    page,
  }) => {
    const englishField = page.getByTestId('input-invalid-row');
    const bengaliField = page.getByTestId('form-field-bn');
    await expect(englishField).toBeVisible();
    await expect(bengaliField).toBeVisible();
    await expect(page.getByTestId('form-locale-row')).toHaveScreenshot('form-locale-en-vs-bn.png');
  });
});
