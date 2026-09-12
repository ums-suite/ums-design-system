import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-11 data-display family (Card, Badge, Avatar, Avatar group,
 * Breadcrumbs, Timeline). Mirrors e2e/button-family.spec.ts's structure.
 */

test.describe('Data display primitives catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('data-display-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="data-display-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the Card variants with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('card-row')).toHaveScreenshot('data-display-card-row.png');
  });

  test('renders the Badge, Avatar, and Avatar group rows with a stable visual baseline', async ({
    page,
  }) => {
    await expect(page.getByTestId('badge-row')).toHaveScreenshot('data-display-badge-row.png');
    await expect(page.getByTestId('avatar-row')).toHaveScreenshot('data-display-avatar-row.png');
  });

  test('renders Breadcrumbs and Timeline with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('breadcrumbs-row')).toHaveScreenshot(
      'data-display-breadcrumbs-row.png',
    );
    await expect(page.getByTestId('timeline-row')).toHaveScreenshot(
      'data-display-timeline-row.png',
    );
  });

  test('the Avatar group overflow badge names the hidden members for a screen reader', async ({
    page,
  }) => {
    const overflow = page.locator('[data-testid="avatar-group"] .ums-avatar-group__overflow');
    await expect(overflow).toBeVisible();
    await expect(overflow).toHaveAttribute('aria-label', /Kamrul Islam/);
  });

  test('renders the English label and a long-form Bengali label without clipping', async ({
    page,
  }) => {
    await expect(page.getByTestId('badge-label-bn')).toBeVisible();
    await expect(page.getByTestId('card-profile-bn')).toBeVisible();
    await expect(page.getByTestId('data-display-locale-row')).toHaveScreenshot(
      'data-display-locale-en-vs-bn.png',
    );
  });
});
