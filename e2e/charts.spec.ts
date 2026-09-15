import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-16 Data Visualization family (Line/Bar/Donut/Area, Sparkline,
 * Progress ring/bar, Heatmap calendar -- requirement-spec.md §6). Every chart paints to a
 * `<canvas>` via ECharts, so unlike this repo's other catalog pages this suite explicitly waits
 * out `--motion-slow` (320ms) plus a safety margin after any dataset/theme change before taking
 * a screenshot -- there's no DOM signal for "the canvas has finished animating," which is exactly
 * why `*.component.spec.ts` (Karma) deliberately does not attempt to assert on real chart
 * rendering (see `line-chart.component.spec.ts`'s header comment) and this real-Chromium suite
 * is the one place that behavior is actually exercised.
 *
 * Every `toBeVisible`/`toHaveScreenshot` call below carries an explicit generous timeout for the
 * same reason: under a fully-parallel local run (`npm run e2e` with no `--workers` cap), several
 * workers cold-compiling this page's large lazy `echarts-setup` chunk through the dev server's
 * own on-demand bundler at once can genuinely take longer than Playwright's 5s default --
 * independent of anything about the chart components themselves. CI pins `workers: 1`
 * (`playwright.config.ts`), where this contention doesn't occur.
 */

const SETTLE_MS = 600;

async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(SETTLE_MS);
}

test.describe('Data Visualization catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // See the generous timeout note in "renders every named chart type" below -- the same
    // cold dev-server-compile contention under a fully-parallel run applies to this first
    // navigation in every test in this file.
    await expect(page.getByTestId('charts-catalog')).toBeVisible({ timeout: 15_000 });
    await settle(page);
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="charts-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders every named chart type', async ({ page }) => {
    for (const testId of [
      'line-chart',
      'bar-chart',
      'area-chart',
      'donut-chart',
      'sparkline',
      'progress-ring',
      'progress-bar',
      // The Heatmap calendar's `calendar` coordinate system paints multiple stacked <canvas>
      // layers (base grid + heatmap series) -- `.first()` below is deliberate, not a narrowing
      // of the assertion, since ECharts owns how many layers a given series type needs.
      'heatmap-calendar',
    ]) {
      // A generous explicit timeout: under a fully-parallel local run, several workers cold-
      // compiling this page's large lazy `echarts-setup` chunk through the dev server's own
      // on-demand bundler at once can genuinely take longer than Playwright's 5s default,
      // independent of anything about the chart components themselves.
      await expect(page.getByTestId(testId).locator('canvas').first()).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test('the Progress ring shows its live percentage as real, screen-reader-legible DOM text', async ({
    page,
  }) => {
    await expect(page.getByTestId('progress-ring').locator('.ums-chart__center-label')).toHaveText(
      '68%',
    );
  });

  test('renders the English and a long-form Bengali Progress bar label without clipping', async ({
    page,
  }) => {
    // design-decisions.md "Locale-Safe Component Sizing Verification" -- every text-bearing
    // catalog entry gets an English-vs-long-form-Bengali screenshot, matching every other
    // DSYS-18 catalog page (form/data-table/navigation/command-palette/overlay). The Progress
    // bar's `label` is this chart family's one arbitrary, consumer-supplied translatable string.
    await expect(page.getByTestId('progress-bar-locale-row')).toHaveScreenshot(
      'progress-bar-locale-en-vs-bn.png',
      { timeout: 15_000 },
    );
  });

  test('renders a stable light-theme visual baseline', async ({ page }) => {
    await expect(page.getByTestId('charts-catalog')).toHaveScreenshot('charts-catalog-light.png', {
      timeout: 15_000,
    });
  });

  test('renders a stable dark-theme visual baseline after a live theme toggle', async ({
    page,
  }) => {
    await page.getByTestId('theme-toggle-dark').click();
    await settle(page);
    await expect(page.getByTestId('charts-catalog')).toHaveScreenshot('charts-catalog-dark.png', {
      timeout: 15_000,
    });
  });

  test('a mid-animation dataset update converges to the same final render as a single update (interrupt-and-retarget)', async ({
    page,
  }) => {
    // "Update once" jumps straight to the final target dataset -- this becomes the canonical
    // baseline both paths are compared against (via the project's standard 2% screenshot
    // tolerance, `playwright.config.ts`), not a strict byte-for-byte comparison: two genuinely
    // different animation timelines converging on the same target legitimately differ by
    // sub-pixel antialiasing even once both are fully settled.
    const chart = page.getByTestId('live-update-chart');
    await page.getByTestId('live-update-once').click();
    await settle(page);
    await expect(chart).toHaveScreenshot('live-update-settled.png', { timeout: 15_000 });

    // A fresh load, then "update rapidly": a decoy dataset is applied, and the *same* final
    // target is applied again less than one animation frame later, interrupting the decoy's
    // own in-flight transition. If ECharts' `setOption` merge did not retarget correctly --
    // got stuck mid-transition, raced two overlapping animations, or settled on the decoy --
    // this would not match the baseline above.
    await page.reload();
    await expect(page.getByTestId('charts-catalog')).toBeVisible();
    await settle(page);
    await page.getByTestId('live-update-rapidly').click();
    await settle(page);
    await expect(chart).toHaveScreenshot('live-update-settled.png', { timeout: 15_000 });
  });

  test('a chart inside an open Modal repaints live when the theme is toggled, without the modal closing', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    // The theme is flipped here via the OS-level `prefers-color-scheme` media query -- exactly
    // the mechanism `ThemeService` listens to in its default 'system' mode -- rather than by
    // clicking the catalog app's own in-header theme-toggle button. That button sits in the
    // page's background chrome, and a correctly-behaving Modal's backdrop deliberately makes
    // the background inert while open (the same reason `closeOnBackdropClick` exists): a real
    // click there would either do nothing or be exactly the kind of accidental background
    // interaction a modal exists to prevent. A live OS-level theme flip while a dialog is open
    // (e.g. the OS's own auto dark-mode switching at sunset) is a realistic, and arguably more
    // common, way this edge case actually happens for a user mid-task.
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(page.getByTestId('charts-catalog')).toBeVisible();
    await settle(page);

    await page.getByTestId('chart-modal-trigger').click();
    const modal = page.getByTestId('chart-modal').locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await settle(page);
    const beforeToggle = await modal.screenshot();

    await page.emulateMedia({ colorScheme: 'dark' });
    // The modal must stay open -- design-decisions.md "Theme-Switch Transition Mechanism"
    // explicitly rejected force-closing an open overlay on a theme switch.
    await expect(modal).toBeVisible();
    await settle(page);
    const afterToggle = await modal.screenshot();

    // The chart actually repainted (not a cached light-mode canvas sitting inside a
    // now-dark-themed modal chrome).
    expect(beforeToggle.equals(afterToggle)).toBe(false);
    await expect(modal).toHaveScreenshot('chart-modal-dark-live-toggle.png', { timeout: 15_000 });

    expect(pageErrors).toEqual([]);
  });
});
