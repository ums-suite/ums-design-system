import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-17 state-surface family (Skeleton, EmptyState, ErrorState,
 * OfflineBanner). Mirrors e2e/button-family.spec.ts's structure, plus a real offline/online
 * simulation via Playwright's own `context.setOffline()` for the connectivity banner.
 */

test.describe('State surfaces catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('state-surface-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="state-surface-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders Skeleton variants with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('skeleton-row')).toHaveScreenshot(
      'state-surface-skeleton-row.png',
    );
  });

  test('renders EmptyState and ErrorState with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('empty-state-row')).toHaveScreenshot(
      'state-surface-empty-row.png',
    );
    await expect(page.getByTestId('error-state-row')).toHaveScreenshot(
      'state-surface-error-row.png',
    );
  });

  test('ErrorState retry button fires the retry handler', async ({ page }) => {
    const errorState = page.getByTestId('error-state');
    await expect(errorState).toContainText('Retry count: 0');
    await errorState.getByRole('button', { name: 'Try again' }).click();
    await expect(errorState).toContainText('Retry count: 1');
  });

  test('OfflineBanner appears when the browser goes offline and hides again once online', async ({
    page,
    context,
  }) => {
    const banner = page.getByTestId('offline-banner');
    await expect(banner).toBeHidden();

    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('role', 'status');

    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(banner).toBeHidden();
  });

  test('renders the English title and a long-form Bengali title without clipping', async ({
    page,
  }) => {
    await expect(page.getByTestId('empty-state-bn')).toBeVisible();
    await expect(page.getByTestId('state-surface-locale-row')).toHaveScreenshot(
      'state-surface-locale-en-vs-bn.png',
    );
  });
});
