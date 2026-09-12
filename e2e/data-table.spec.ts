import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-12 Data Table -- sorting, filtering, column resize/pin, sticky
 * header, row selection, and CDK-virtualized rendering. Runs against a real Chromium (real frame
 * timing for `cdk-virtual-scroll-viewport`'s ResizeObserver/rAF-driven measurement, which
 * data-table.component.spec.ts deliberately does not attempt to assert on -- see its own header
 * comment).
 */

test.describe('Data Table catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('data-table-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="data-table-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the closed data table with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('data-table-row')).toHaveScreenshot('data-table-default.png');
  });

  test('virtualizes rows: only a fraction of the 60-row dataset is in the DOM at once', async ({
    page,
  }) => {
    const renderedRows = page.locator(
      '[data-testid="data-table"] cdk-virtual-scroll-viewport [role="row"]',
    );
    const count = await renderedRows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(60);
  });

  test('sorting a column reorders the rendered rows', async ({ page }) => {
    const table = page.getByTestId('data-table');
    await table.getByRole('button', { name: 'Score' }).click();

    // Header cells: [0] selection, [1] Name, [2] Program (pinned), [3] Score.
    const firstScoreCell = table
      .locator('cdk-virtual-scroll-viewport [role="row"]')
      .first()
      .locator('[role="cell"]')
      .nth(3);
    await expect(table.locator('[role="columnheader"]').nth(3)).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(firstScoreCell).toHaveText('40');
  });

  test('filtering by Name narrows the visible rows', async ({ page }) => {
    const table = page.getByTestId('data-table');
    await table.locator('.ums-data-table__toolbar button').click();
    await table.getByLabel('Filter Name').fill('Applicant 1');
    await expect(table.getByText('Applicant 1', { exact: true })).toBeVisible();

    const rows = table.locator('cdk-virtual-scroll-viewport [role="row"]');
    // "Applicant 1" and "Applicant 10".."Applicant 19" and "Applicant 1" substring matches.
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i)).toContainText('Applicant 1');
    }
  });

  test('row and select-all checkboxes drive selection and the catalog summary text', async ({
    page,
  }) => {
    const table = page.getByTestId('data-table');
    const firstRowCheckbox = table
      .locator('cdk-virtual-scroll-viewport [role="row"]')
      .first()
      .locator('input[type="checkbox"]');

    await firstRowCheckbox.check();
    await expect(page.getByTestId('data-table-selection-summary')).toContainText(
      'Selected rows: 1',
    );

    const selectAll = table.locator('[role="columnheader"] input[type="checkbox"]');
    await selectAll.check();
    await expect(page.getByTestId('data-table-selection-summary')).toContainText(
      'Selected rows: 60',
    );

    await selectAll.uncheck();
    await expect(page.getByTestId('data-table-selection-summary')).toContainText(
      'Selected rows: 0',
    );
  });

  test('the pinned Program column stays visible while scrolling the table horizontally', async ({
    page,
  }) => {
    const table = page.getByTestId('data-table');
    const scrollContainer = table.locator('.ums-data-table__scroll');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 300;
    });
    await expect(table.getByRole('columnheader', { name: 'Program' })).toBeVisible();
  });

  test('applies the tabular-numeral utility class to the numeric Score column', async ({
    page,
  }) => {
    const table = page.getByTestId('data-table');
    const scoreCell = table
      .locator('cdk-virtual-scroll-viewport [role="row"]')
      .first()
      .locator('.ums-tnum');
    await expect(scoreCell).toBeVisible();
  });

  test('shows the empty state when a filter matches nothing', async ({ page }) => {
    const table = page.getByTestId('data-table');
    await table.locator('.ums-data-table__toolbar button').click();
    await table.getByLabel('Filter Name').fill('no-such-applicant');
    await expect(table.getByTestId('data-table-empty')).toBeVisible();
  });

  test('renders the English and long-form Bengali applicant name without clipping', async ({
    page,
  }) => {
    await expect(page.getByTestId('data-table-locale-row')).toHaveScreenshot(
      'data-table-locale-en-vs-bn.png',
    );
  });
});
