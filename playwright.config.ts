import { defineConfig, devices } from '@playwright/test';

/**
 * DSYS-18 (requirement-spec.md §9): "A visual regression test suite (screenshot diffing on the
 * shared component library's own Storybook-equivalent catalog) runs in ums-design-system's own
 * CI on every change, before publish." This config drives that suite plus the mandatory
 * automated a11y gate (requirement-spec.md §8: "a passing automated a11y test (axe-core or
 * equivalent) as a release gate for the package itself").
 *
 * Pinned to a single browser (Chromium) and a fixed viewport: cross-browser/cross-OS font
 * rendering differences would otherwise make screenshot diffing noisy rather than meaningful --
 * this suite verifies *this package's own* rendering is stable and accessible, not
 * cross-browser rendering parity (out of scope for this pass).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 30_000,
  expect: {
    // A small, non-zero tolerance absorbs sub-pixel anti-aliasing differences between CI and
    // local runs without masking a real visual regression.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx ng serve catalog --port 4300 --configuration development',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
