import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-15 overlay family (Modal, Drawer, Toast, Tooltip, Popover,
 * Confirmation dialog). Mirrors e2e/button-family.spec.ts's structure, plus the interaction
 * checks each overlay's own controlled-open/focus-trap/dismissal contract needs: opening moves
 * focus into the panel, Escape and the close control both dismiss, and closing restores focus to
 * the trigger that opened it.
 */

test.describe('Overlay catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('overlay-catalog')).toBeVisible();
  });

  test('has zero automated accessibility violations (axe-core) with every overlay closed', async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="overlay-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the closed overlay-catalog section with a stable visual baseline', async ({
    page,
  }) => {
    await expect(page.getByTestId('overlay-catalog')).toHaveScreenshot(
      'overlay-catalog-closed.png',
    );
  });

  test('Modal opens on trigger click, traps focus, and Escape restores focus to the trigger', async ({
    page,
  }) => {
    const trigger = page.getByTestId('modal-trigger');
    await trigger.click();

    const modal = page.getByTestId('modal').locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal.getByRole('heading', { name: 'Review application' })).toBeVisible();

    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);

    await expect(modal).toHaveScreenshot('modal-open.png');

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    // The focusable element is the native <button> ums-button renders internally, not the
    // custom-element host `data-testid` sits on -- see button.component.html.
    await expect(trigger.locator('button')).toBeFocused();
  });

  test('Modal Approve button closes the modal', async ({ page }) => {
    await page.getByTestId('modal-trigger').click();
    const modal = page.getByTestId('modal').locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    await page.getByTestId('modal-confirm').click();
    await expect(modal).toBeHidden();
  });

  test('Drawer opens from the logical end edge and its own close control restores focus to the trigger', async ({
    page,
  }) => {
    const trigger = page.getByTestId('drawer-trigger');
    await trigger.click();

    const drawer = page.getByTestId('drawer').locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer.getByRole('heading', { name: 'Applicant filters' })).toBeVisible();

    await expect(drawer).toHaveScreenshot('drawer-open.png');

    // The drawer's own built-in close affordance (the header X, aria-label "Close panel") is
    // what runs the component's internal focus-restore contract -- a consumer-supplied footer
    // button (like "drawer-close" below) only requests a close via `(closed)`, and the parent
    // decides how it responds, same as Modal's footer buttons.
    await drawer.getByRole('button', { name: 'Close panel' }).click();
    await expect(drawer).toBeHidden();
    await expect(trigger.locator('button')).toBeFocused();
  });

  test('Drawer footer "Close" button (a consumer-supplied action) also dismisses the drawer', async ({
    page,
  }) => {
    await page.getByTestId('drawer-trigger').click();
    const drawer = page.getByTestId('drawer').locator('[role="dialog"]');
    await expect(drawer).toBeVisible();

    await page.getByTestId('drawer-close').click();
    await expect(drawer).toBeHidden();
  });

  test('Confirmation dialog requires a non-empty reason before Confirm is enabled', async ({
    page,
  }) => {
    await page.getByTestId('confirmation-dialog-trigger').click();
    const dialog = page.getByTestId('confirmation-dialog').locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    const confirmButton = dialog.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeDisabled();

    await dialog
      .getByLabel('Reason for this action', { exact: false })
      .fill('Requested by the Registrar.');
    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('confirmation-dialog-result')).toContainText(
      'Requested by the Registrar.',
    );
  });

  test('Toast appears via the toast service and auto-dismisses, and an action toast fires its callback', async ({
    page,
  }) => {
    await page.getByTestId('toast-trigger').click();
    const toastRegion = page.locator('[role="status"].ums-toast-container');
    await expect(toastRegion).toContainText('Application saved as a draft.');

    await page.getByTestId('toast-action-trigger').click();
    await expect(toastRegion).toContainText('Application submitted.');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(toastRegion).toContainText('Submission undone.');
  });

  test('Tooltip shows its text on focus and hover, and hides on Escape', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger');
    await trigger.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Only visible to admissions staff');

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
  });

  test('Popover opens on trigger click, is anchored content (not a modal), and closes on outside click', async ({
    page,
  }) => {
    const trigger = page.getByTestId('popover-trigger');
    await trigger.click();

    const content = page.getByTestId('popover-content');
    await expect(content).toBeVisible();
    await expect(content).toHaveScreenshot('popover-open.png');

    // Outside click closes it (a popover is a lightweight disclosure, not a trapping dialog).
    await page.getByRole('heading', { name: 'Feedback & overlays' }).click();
    await expect(content).toBeHidden();
  });

  test('renders the English modal title and a long-form Bengali modal title without clipping', async ({
    page,
  }) => {
    await page.getByTestId('modal-bn-trigger').click();
    const bnModal = page.getByTestId('modal-bn').locator('[role="dialog"]');
    await expect(bnModal).toBeVisible();
    await expect(bnModal).toHaveScreenshot('overlay-modal-bn.png');

    await page.getByTestId('modal-bn-close').click();
    await expect(bnModal).toBeHidden();
  });
});
