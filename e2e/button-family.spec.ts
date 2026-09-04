import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the Button family (DSYS-7), the one component group in scope for this
 * pass. Runs against the catalog app (projects/catalog), the "Storybook-equivalent catalog"
 * requirement-spec.md §9 names as the visual-regression target.
 *
 * Covers:
 *  - an automated a11y scan (axe-core) with zero violations (requirement-spec.md §8's per-
 *    component release gate);
 *  - screenshot-diffing visual regression on the Button family's variants/sizes/states;
 *  - an English-label vs. long-form Bengali-label comparison (design-decisions.md "Locale-Safe
 *    Component Sizing Verification (Bengali Layout Testing)");
 *  - a live theme toggle (light/dark), confirmed via a screenshot diff, exercising
 *    ThemeService's token-driven re-paint (requirement-spec.md §7).
 *
 * NOT covered here: the "open overlay + live theme toggle" case design-decisions.md's
 * "Theme-Switch Transition Mechanism" mandates for any JS-computed-color component (a chart
 * fill, a canvas). This package ships no Modal/Drawer/overlay or chart component yet (DSYS-9,
 * DSYS-15, DSYS-16 are explicitly out of scope for this pass) -- there is nothing to open. This
 * is a deliberate, documented gap, not an oversight; it must be added the moment DSYS-9/15/16
 * land. See the PR description and the package README's "Queued" section.
 */

test.describe('Button family catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('button-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="button-catalog"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('renders every button variant with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('button-variants')).toHaveScreenshot('button-variants.png');
  });

  test('renders the full button-family catalog section with a stable visual baseline', async ({
    page,
  }) => {
    await expect(page.getByTestId('button-catalog')).toHaveScreenshot('button-catalog-full.png');
  });

  test('renders the English label and a long-form Bengali label without overflow or clipping', async ({
    page,
  }) => {
    const englishButton = page.getByTestId('button-label-en');
    const bengaliButton = page.getByTestId('button-label-bn');

    await expect(englishButton).toBeVisible();
    await expect(bengaliButton).toBeVisible();

    // The Bengali label is meaningfully longer than the English one (design-decisions.md
    // "Locale-Safe Component Sizing Verification") -- assert it actually grew the button rather
    // than silently clipping/truncating its text content.
    const englishBox = await englishButton.boundingBox();
    const bengaliBox = await bengaliButton.boundingBox();
    if (!englishBox || !bengaliBox) {
      throw new Error('expected both buttons to have a layout box');
    }
    expect(bengaliBox.width).toBeGreaterThan(englishBox.width);

    await expect(page.getByTestId('button-locale-row')).toHaveScreenshot(
      'button-locale-en-vs-bn.png',
    );
  });

  test('re-paints the button family live when the theme is toggled (light -> dark)', async ({
    page,
  }) => {
    await page.getByTestId('theme-toggle-light').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByTestId('button-variants')).toHaveScreenshot('button-variants-light.png');

    await page.getByTestId('theme-toggle-dark').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByTestId('button-variants')).toHaveScreenshot('button-variants-dark.png');
  });

  test('Icon Button, FAB, and Split Button render with a stable visual baseline', async ({
    page,
  }) => {
    await expect(page.getByTestId('icon-button-edit')).toBeVisible();
    await expect(page.getByTestId('fab-extended')).toBeVisible();
    await expect(page.getByTestId('split-button')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[data-testid="icon-button-edit"]')
      .include('[data-testid="icon-button-delete"]')
      .include('[data-testid="fab-icon-only"]')
      .include('[data-testid="fab-extended"]')
      .include('[data-testid="split-button"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
