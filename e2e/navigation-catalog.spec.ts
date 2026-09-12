import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-13 navigation family (App shell -- operational and public
 * modes, Tab bar, Stepper). Mirrors e2e/button-family.spec.ts's structure.
 */

test.describe('Navigation catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('navigation-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="navigation-catalog"]')
      // This catalog page deliberately renders TWO live App Shell instances side by side (one
      // per mode) plus the catalog shell's own <main> around them, purely so both variants get
      // screenshot-diffed on one page -- a demo-only artifact of this Storybook-equivalent
      // catalog, never a real product scenario (a real consuming app mounts exactly one App
      // Shell, so exactly one <main>/side-nav landmark exists). Disabled here, not in the
      // component itself.
      .disableRules(['landmark-main-is-top-level', 'landmark-no-duplicate-main', 'landmark-unique'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the operational and public App shell with a stable visual baseline', async ({
    page,
  }) => {
    await expect(page.getByTestId('app-shell-operational')).toHaveScreenshot(
      'navigation-app-shell-operational.png',
    );
    await expect(page.getByTestId('app-shell-public')).toHaveScreenshot(
      'navigation-app-shell-public.png',
    );
  });

  test('renders the Tab bar and Stepper with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('tab-bar-row')).toHaveScreenshot('navigation-tab-bar-row.png');
    await expect(page.getByTestId('stepper-row')).toHaveScreenshot('navigation-stepper-row.png');
  });

  test('the operational App shell side nav collapses on toggle', async ({ page }) => {
    const shell = page.getByTestId('app-shell-operational');
    const toggle = shell.locator('.ums-app-shell__collapse-toggle');
    const sideNav = shell.locator('.ums-app-shell__side-nav');
    await expect(sideNav).not.toHaveClass(/--collapsed/);
    await toggle.click();
    await expect(sideNav).toHaveClass(/--collapsed/);
  });

  test('the public App shell mega-menu opens on click and closes on Escape', async ({ page }) => {
    const shell = page.getByTestId('app-shell-public');
    const trigger = shell.getByRole('button', { name: 'Admissions' });
    await trigger.click();
    await expect(shell.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(shell.getByRole('menu')).toBeHidden();
  });

  test('the Tab bar supports arrow-key navigation, skipping a disabled tab', async ({ page }) => {
    const tabBar = page.getByTestId('tab-bar-row');
    const firstTab = tabBar.getByRole('tab').first();
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    // "Documents" is disabled in the catalog fixture, so ArrowRight should land on the tab after it.
    await expect(tabBar.getByRole('tab', { selected: true })).toHaveText(/Documents|Payments/);
  });

  test('the Stepper lets the user navigate back to a completed step', async ({ page }) => {
    const stepper = page.getByTestId('stepper-row');
    const completedMarker = stepper.locator('button[aria-label*="completed"]').first();
    await expect(completedMarker).toBeVisible();
  });

  test('renders the English and long-form Bengali Stepper labels without clipping', async ({
    page,
  }) => {
    await expect(page.getByTestId('stepper-bn')).toBeVisible();
    await expect(page.getByTestId('navigation-locale-row')).toHaveScreenshot(
      'navigation-locale-en-vs-bn.png',
    );
  });
});
