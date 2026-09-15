import type { ChartPalette } from './chart-theme.util';
import type { ChartSeries } from './chart.types';
import type { EChartsOptionInternal } from './echarts-option.types';

export interface LineLikeChartOptions {
  readonly area?: boolean;
  readonly smooth?: boolean;
  readonly showLegend?: boolean;
  /** Sparkline mode: no axes, no tooltip/legend chrome, just the line/area itself. */
  readonly minimal?: boolean;
}

/**
 * Shared option builder for Line chart, Area chart, and Sparkline -- all three are "a line
 * series against a category axis," differing only in area fill and how much chrome (axes,
 * legend, tooltip) surrounds it. One builder avoids reimplementing axis/color/legend config
 * three times.
 */
export function buildLineLikeOption(
  palette: ChartPalette,
  categories: readonly string[],
  series: readonly ChartSeries[],
  options: LineLikeChartOptions = {},
): EChartsOptionInternal {
  const { area = false, smooth = false, showLegend = true, minimal = false } = options;

  return {
    color: [...palette.categorical],
    grid: minimal
      ? { left: 0, right: 0, top: 0, bottom: 0 }
      : { left: 48, right: 16, top: showLegend && series.length > 1 ? 32 : 16, bottom: 32 },
    tooltip: minimal ? undefined : { trigger: 'axis' },
    legend:
      !minimal && showLegend && series.length > 1
        ? { top: 0, textStyle: { color: palette.text } }
        : undefined,
    xAxis: {
      type: 'category',
      data: [...categories],
      show: !minimal,
      axisLine: { lineStyle: { color: palette.border } },
      axisLabel: { color: palette.textMuted },
    },
    yAxis: {
      type: 'value',
      show: !minimal,
      splitLine: { lineStyle: { color: palette.border } },
      axisLabel: { color: palette.textMuted },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      data: [...s.data],
      smooth,
      symbol: minimal ? 'none' : 'circle',
      showSymbol: !minimal,
      areaStyle: area ? { opacity: 0.15 } : undefined,
      lineStyle: { width: minimal ? 1.5 : 2 },
    })),
  };
}
