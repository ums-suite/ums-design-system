import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * DSYS-18 e2e suite for the DSYS-14 Command Palette -- the real Ctrl+K/Cmd+K global shortcut,
 * full keyboard operability (arrow-key navigation, Enter to activate, Escape to close), ARIA
 * (role="dialog"/aria-modal, live-region result-count announcement), and focus-trap/restore
 * (reusing overlay/focus-trap.util.ts, per DSYS-15).
 */

test.describe('Command Palette catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('command-palette-catalog')).toBeVisible();
  });

  test('is not present in an a11y-relevant way while closed', async ({ page }) => {
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test('opens via the real Ctrl+K shortcut and traps focus with zero axe violations', async ({
    page,
  }) => {
    await page.keyboard.press('Control+k');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('.ums-command-palette__input')).toBeFocused();

    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);

    await expect(dialog).toHaveScreenshot('command-palette-open.png');
  });

  test('a plain trigger button also opens it', async ({ page }) => {
    await page.getByTestId('command-palette-trigger').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('typing filters results and the live region announces the count', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const liveRegion = page.locator('[role="dialog"] [aria-live="polite"]');
    await expect(liveRegion).toContainText('4 results');

    const options = page.locator('[role="dialog"] [role="option"]');
    await page.locator('.ums-command-palette__input').fill('notice');
    await expect(options).toHaveCount(1);
    await expect(liveRegion).toContainText('1 result');
    await expect(options).toContainText('Create Notice');
  });

  test('ArrowDown/ArrowUp move the active option and Enter activates it', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const activeOption = page.locator('[role="dialog"] [role="option"][aria-selected="true"]');
    await expect(activeOption).toContainText('Create Notice');

    await page.keyboard.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await expect(page.getByTestId('command-palette-last-selected')).toContainText('new-notice');
  });

  test('Escape closes the palette and restores focus to the trigger', async ({ page }) => {
    const trigger = page.getByTestId('command-palette-trigger');
    await trigger.focus();
    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a second Ctrl+K while open closes the palette', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="dialog"]')).toBeHidden();
  });

  test('shows the no-results message for an unmatched query', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.locator('.ums-command-palette__input').fill('no-such-command-xyz');
    await expect(page.locator('.ums-command-palette__empty')).toBeVisible();
  });

  test('renders the English and long-form Bengali item labels without clipping', async ({
    page,
  }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="listbox"]')).toHaveScreenshot(
      'command-palette-locale-en-vs-bn.png',
    );
  });
});
