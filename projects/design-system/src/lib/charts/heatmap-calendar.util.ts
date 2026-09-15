import type { ChartPalette } from './chart-theme.util';
import type { HeatmapCalendarEntry } from './chart.types';
import type { EChartsOptionInternal } from './echarts-option.types';

export interface HeatmapCalendarOptions {
  /** An ISO year (`'2026'`) or an explicit `[start, end]` ISO date range; defaults to the year of the first entry. */
  readonly range?: string | readonly [string, string];
}

/**
 * Heatmap calendar (requirement-spec.md §6 -- attendance, occupancy). Uses ECharts' own
 * `calendar` coordinate system plus a continuous `visualMap` (both registered in
 * `echarts-setup.ts`) rather than a bespoke grid-of-divs calendar, so date-cell layout (week
 * rows, month labels, leap years) is the charting engine's problem, not this package's.
 */
export function buildHeatmapCalendarOption(
  palette: ChartPalette,
  entries: readonly HeatmapCalendarEntry[],
  options: HeatmapCalendarOptions = {},
): EChartsOptionInternal {
  const range = options.range ?? entries[0]?.date.slice(0, 4) ?? String(new Date().getFullYear());
  const values = entries.map((entry) => entry.value);
  const max = values.length ? Math.max(...values) : 1;

  return {
    tooltip: { trigger: 'item' },
    visualMap: {
      show: true,
      min: 0,
      max: max || 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: [palette.background, palette.primary] },
      textStyle: { color: palette.textMuted },
    },
    calendar: {
      range: typeof range === 'string' ? range : ([range[0], range[1]] as [string, string]),
      cellSize: ['auto', 16],
      itemStyle: { borderColor: palette.surface, borderWidth: 2, color: palette.background },
      splitLine: { lineStyle: { color: palette.border } },
      yearLabel: { show: false },
      dayLabel: { color: palette.textMuted },
      monthLabel: { color: palette.textMuted },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: entries.map((entry) => [entry.date, entry.value]),
      },
    ],
  };
}
