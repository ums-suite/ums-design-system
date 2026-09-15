/** requirement-spec.md §6 (Data Visualization): shared shapes across the chart family. */
export interface ChartSeries {
  readonly name: string;
  readonly data: readonly number[];
}

export interface HeatmapCalendarEntry {
  /** ISO `YYYY-MM-DD` date string. */
  readonly date: string;
  readonly value: number;
}

/** A single named slice for the Donut chart. */
export interface DonutSlice {
  readonly name: string;
  readonly value: number;
}

/**
 * Semantic color selection for single-value charts (Sparkline, Progress ring/bar) -- these
 * communicate a status against `--color-*` semantic tokens (§3) rather than distinguishing
 * multiple series, so they resolve a single named tone from `ChartPalette` instead of consuming
 * its `categorical` rotation. The literal union deliberately matches `ChartPalette`'s own
 * property names one-for-one so `palette[tone]` type-checks with no cast.
 */
export type ChartTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
