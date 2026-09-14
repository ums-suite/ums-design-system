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
