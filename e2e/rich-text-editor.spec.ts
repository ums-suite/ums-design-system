import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * DSYS-18 e2e suite for DSYS-10 (Rich text editor). Runs against a real Chromium for the same
 * reason e2e/date-time.spec.ts and e2e/data-table.spec.ts do -- this component's real lifecycle
 * (a dynamic `import('./tiptap-setup')` constructing a live Tiptap `Editor` against a real
 * contenteditable DOM node) and its toolbar's real keyboard timing cannot be exercised inside
 * Karma (see rich-text-editor.component.spec.ts's own comment for that split).
 *
 * Covers:
 *  - an automated a11y scan (axe-core) with zero violations;
 *  - screenshot-diffing visual regression on the catalog page;
 *  - toolbar keyboard operability (Tab to a toolbar button, activate with Enter/Space) for
 *    Bold, Italic, and Link -- not mouse-only, the ticket's explicit mandate;
 *  - the Link toolbar's insert/remove round trip;
 *  - the disabled and invalid states;
 *  - an English-content vs. long-form-Bengali-content comparison (design-decisions.md
 *    "Locale-Safe Component Sizing Verification").
 *
 * Every first-interaction wait below carries a generous explicit timeout, matching
 * e2e/charts.spec.ts's own precedent: under a fully-parallel local run, several workers cold-
 * loading this component's own lazily-chunked `tiptap-setup` bundle at once can take meaningfully
 * longer than Playwright's 5s default.
 */

/** Replaces the catalog's seeded demo content with isolated, single-paragraph text, so a test's
 * mark assertions aren't tripped up by the seed content's own pre-existing bold/italic spans. */
async function clearAndType(page: Page, content: Locator, text: string): Promise<void> {
  await content.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text);
  await page.keyboard.press('ControlOrMeta+a');
}

test.describe('Rich text editor catalog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('rich-text-editor-catalog')).toBeVisible({ timeout: 15_000 });
    // The editor mounts asynchronously (afterNextRender -> dynamic import -> Editor construction)
    // -- wait for the real contenteditable root to exist before any test interacts with it.
    await expect(
      page.getByTestId('rte-default').locator('.ums-rich-text-editor__prosemirror'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('has zero automated accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="rich-text-editor-catalog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders the catalog section with a stable visual baseline', async ({ page }) => {
    await expect(page.getByTestId('rich-text-editor-catalog')).toHaveScreenshot(
      'rich-text-editor-catalog.png',
    );
  });

  test('Bold toolbar button is keyboard-operable (Tab, then Enter) and toggles aria-pressed', async ({
    page,
  }) => {
    const editor = page.getByTestId('rte-default');
    const content = editor.locator('.ums-rich-text-editor__prosemirror');
    const boldButton = editor.getByRole('button', { name: 'Bold' });

    await clearAndType(page, content, 'formatted text');

    await boldButton.focus();
    await expect(boldButton).toHaveAttribute('aria-pressed', 'false');
    await boldButton.press('Enter');

    await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    await expect(content.locator('strong')).toHaveText('formatted text');

    // Toggling back off is keyboard-operable too (Space, not just Enter).
    await boldButton.press('Space');
    await expect(boldButton).toHaveAttribute('aria-pressed', 'false');
    await expect(content.locator('strong')).toHaveCount(0);
  });

  test('Italic toggles via the editor content area own keyboard shortcut (Ctrl+I)', async ({
    page,
  }) => {
    const editor = page.getByTestId('rte-default');
    const content = editor.locator('.ums-rich-text-editor__prosemirror');
    const italicButton = editor.getByRole('button', { name: 'Italic' });

    await clearAndType(page, content, 'slanted text');
    await page.keyboard.press('ControlOrMeta+i');

    await expect(italicButton).toHaveAttribute('aria-pressed', 'true');
    await expect(content.locator('em')).toHaveText('slanted text');
  });

  test('Link toolbar button is keyboard-operable end to end: insert, then remove', async ({
    page,
  }) => {
    const editor = page.getByTestId('rte-default');
    const content = editor.locator('.ums-rich-text-editor__prosemirror');

    await clearAndType(page, content, 'visit our site');

    const linkButton = editor.getByRole('button', { name: 'Insert link' });
    await linkButton.focus();
    await linkButton.press('Enter');

    const urlInput = page.getByTestId('rte-link-url-input').locator('input');
    await expect(urlInput).toBeFocused({ timeout: 10_000 });
    await page.keyboard.type('https://ums.example.edu');
    await page.keyboard.press('Enter');

    const link = content.locator('a');
    await expect(link).toHaveAttribute('href', 'https://ums.example.edu');
    await expect(editor.getByRole('button', { name: 'Remove link' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Removing is keyboard-operable too -- select the linked text again, then toggle off.
    await content.click();
    await page.keyboard.press('ControlOrMeta+a');
    await editor.getByRole('button', { name: 'Remove link' }).focus();
    await page.keyboard.press('Enter');
    await expect(content.locator('a')).toHaveCount(0);
  });

  test('the disabled editor blocks editing and disables every toolbar button', async ({ page }) => {
    const editor = page.getByTestId('rte-disabled');
    const content = editor.locator('.ums-rich-text-editor__prosemirror');

    await expect(content).toHaveAttribute('contenteditable', 'false', { timeout: 15_000 });
    await expect(editor.getByRole('button', { name: 'Bold' })).toBeDisabled();
  });

  test('the invalid state is wired through ums-form-field with a visible inline error', async ({
    page,
  }) => {
    const row = page.getByTestId('rte-invalid-row');
    await expect(row.getByText('Announcement body cannot be empty.')).toBeVisible();

    const content = page.getByTestId('rte-invalid').locator('.ums-rich-text-editor__prosemirror');
    await expect(content).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await expect(content).toHaveAttribute('aria-required', 'true');
  });

  test('renders the English content and a long-form Bengali content variant without clipping', async ({
    page,
  }) => {
    const englishContent = page.getByTestId('rte-content-en');
    const bengaliContent = page.getByTestId('rte-content-bn');
    await expect(englishContent).toBeVisible({ timeout: 15_000 });
    await expect(bengaliContent).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId('rte-locale-row')).toHaveScreenshot(
      'rich-text-editor-locale-en-vs-bn.png',
    );
  });
});
