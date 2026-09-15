import type {
  BarSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
} from 'echarts/charts';
import type {
  CalendarComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

/**
 * The full ECharts option shape this package's chart family ever builds, composed only from the
 * chart/component types actually registered in `echarts-setup.ts`. Internal to this directory --
 * never exported from `public-api.ts` (design-decisions.md "Charting Engine Selection": "wrapped
 * in a thin Angular component layer... never exposing ECharts' own API directly to consuming
 * apps").
 */
export type EChartsOptionInternal = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | HeatmapSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | CalendarComponentOption
  | VisualMapComponentOption
>;
