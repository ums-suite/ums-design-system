import type { ChartPalette } from './chart-theme.util';
import type { DonutSlice } from './chart.types';
import type { EChartsOptionInternal } from './echarts-option.types';

export interface DonutChartOptions {
  readonly showLegend?: boolean;
  /** `false` renders a full pie instead of a donut -- see `chart.types.ts` inventory (§6 groups them as one "donut chart" entry; a plain pie is this builder's `donut: false` mode, not a separate component). */
  readonly donut?: boolean;
}

/**
 * Shared option builder for the Donut chart (requirement-spec.md §6). Also conceptually the
 * sibling of the Progress ring's two-slice pie in `progress.util.ts` -- this one renders an
 * arbitrary number of named slices with real proportions, where the Progress ring is always
 * exactly two slices (value/remainder) against a fixed 0..max scale.
 */
export function buildDonutOption(
  palette: ChartPalette,
  data: readonly DonutSlice[],
  options: DonutChartOptions = {},
): EChartsOptionInternal {
  const { showLegend = true, donut = true } = options;

  return {
    color: [...palette.categorical],
    tooltip: { trigger: 'item' },
    legend: showLegend ? { bottom: 0, textStyle: { color: palette.text } } : undefined,
    series: [
      {
        type: 'pie',
        radius: donut ? ['55%', '75%'] : '75%',
        center: ['50%', showLegend ? '45%' : '50%'],
        itemStyle: { borderColor: palette.surface, borderWidth: 2 },
        label: { color: palette.text },
        data: data.map((slice) => ({ name: slice.name, value: slice.value })),
      },
    ],
  };
}
