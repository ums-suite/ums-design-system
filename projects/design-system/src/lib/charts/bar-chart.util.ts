import type { ChartPalette } from './chart-theme.util';
import type { ChartSeries } from './chart.types';
import type { EChartsOptionInternal } from './echarts-option.types';

export interface BarChartOptions {
  readonly horizontal?: boolean;
  readonly stacked?: boolean;
  readonly showLegend?: boolean;
}

/**
 * Shared option builder for the Bar chart (requirement-spec.md §6). Kept separate from
 * `line-like-chart.util.ts` (Line/Area/Sparkline) deliberately: a bar series has no
 * `smooth`/`symbol` concept, and a horizontal orientation flips which axis is the category axis
 * -- folding that into the line-family builder would leak bar-only options onto a signature
 * shared by chart types that never use them.
 */
export function buildBarOption(
  palette: ChartPalette,
  categories: readonly string[],
  series: readonly ChartSeries[],
  options: BarChartOptions = {},
): EChartsOptionInternal {
  const { horizontal = false, stacked = false, showLegend = true } = options;

  const categoryAxis = {
    type: 'category' as const,
    data: [...categories],
    axisLine: { lineStyle: { color: palette.border } },
    axisLabel: { color: palette.textMuted },
  };
  const valueAxis = {
    type: 'value' as const,
    splitLine: { lineStyle: { color: palette.border } },
    axisLabel: { color: palette.textMuted },
  };

  return {
    color: [...palette.categorical],
    grid: {
      left: horizontal ? 80 : 48,
      right: 16,
      top: showLegend && series.length > 1 ? 32 : 16,
      bottom: 32,
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend:
      showLegend && series.length > 1 ? { top: 0, textStyle: { color: palette.text } } : undefined,
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: [...s.data],
      stack: stacked ? 'total' : undefined,
      barMaxWidth: 32,
    })),
  };
}
