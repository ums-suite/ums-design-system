import type { ThemeService } from '../theming/theme.service';

/**
 * DSYS-16 chart color palette, resolved from this package's own design tokens -- never a
 * hardcoded hex, and never cached: `resolveChartPalette` must be called again on every theme
 * change (design-decisions.md "Theme-Switch Transition Mechanism"), reading the *live* CSS
 * custom-property values via `ThemeService.resolveCssVar` (the mandated escape hatch its own
 * class doc names this exact chart family as the primary consumer of). Each chart component's
 * base class re-calls this and re-applies the result via `setOption` whenever
 * `ThemeService.resolvedTheme` changes -- see `base-chart.ts`.
 */
export interface ChartPalette {
  readonly categorical: readonly string[];
  readonly primary: string;
  readonly secondary: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly info: string;
  readonly text: string;
  readonly textMuted: string;
  readonly border: string;
  readonly surface: string;
  readonly background: string;
}

export function resolveChartPalette(theme: ThemeService): ChartPalette {
  const primary = theme.resolveCssVar('--color-primary');
  const secondary = theme.resolveCssVar('--color-secondary');
  const success = theme.resolveCssVar('--color-success');
  const warning = theme.resolveCssVar('--color-warning');
  const danger = theme.resolveCssVar('--color-danger');
  const info = theme.resolveCssVar('--color-info');

  return {
    // A fixed, deliberately-ordered rotation for multi-series charts -- brand colors first, then
    // semantic colors, so a 2-3 series chart reads as "on-brand" before falling back to status
    // colors for series counts large enough to need them.
    categorical: [primary, secondary, info, success, warning, danger],
    primary,
    secondary,
    success,
    warning,
    danger,
    info,
    text: theme.resolveCssVar('--color-text'),
    textMuted: theme.resolveCssVar('--color-text-muted'),
    border: theme.resolveCssVar('--color-border'),
    surface: theme.resolveCssVar('--color-surface'),
    background: theme.resolveCssVar('--color-background'),
  };
}
