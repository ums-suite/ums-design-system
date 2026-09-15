import type { ChartPalette } from './chart-theme.util';
import type { ChartTone } from './chart.types';
import type { EChartsOptionInternal } from './echarts-option.types';

/**
 * Progress ring (requirement-spec.md §6; `ums-alumni-web/requirement-spec.md` §3.4's live
 * donation-progress indicator). Built from a two-slice Pie rather than a Gauge series --
 * `echarts-setup.ts` deliberately does not register `GaugeChart` (one fewer module in the
 * bundle-size trade-off design-decisions.md accepts for choosing ECharts at all), and a
 * full-circle donut with a filled/remainder split reads identically to a gauge ring for this
 * platform's actual need (a single 0..max completion value, never a dial with tick marks or a
 * needle). `UmsProgressRingComponent` renders the live percentage as real DOM text layered over
 * the canvas (`.ums-chart__center-label` in `chart.shared.scss`) rather than an ECharts-drawn
 * label -- `GraphicComponent`/`TitleComponent` aren't registered either, and real text is what
 * keeps the value screen-reader-legible and correctly shaped for Bengali numerals, which a
 * canvas-drawn label never is.
 */
export function buildProgressRingOption(
  palette: ChartPalette,
  value: number,
  max: number,
  tone: ChartTone = 'primary',
): EChartsOptionInternal {
  const filled = Math.max(0, Math.min(value, max));
  const remainder = Math.max(max - filled, 0);
  const color = palette[tone];

  return {
    series: [
      {
        type: 'pie',
        radius: ['72%', '92%'],
        startAngle: 90,
        silent: true,
        label: { show: false },
        itemStyle: { borderRadius: 999 },
        data: [
          { name: 'value', value: filled, itemStyle: { color } },
          { name: 'remainder', value: remainder, itemStyle: { color: palette.border } },
        ],
      },
    ],
  };
}

/**
 * Progress bar (requirement-spec.md §6) -- the linear counterpart to the Progress ring above,
 * sharing the same value/max/tone contract. A single 100%-stacked horizontal Bar with both axes
 * hidden, so it reads as a plain filled track rather than a chart with chrome.
 */
export function buildProgressBarOption(
  palette: ChartPalette,
  value: number,
  max: number,
  tone: ChartTone = 'primary',
): EChartsOptionInternal {
  const filled = Math.max(0, Math.min(value, max));
  const remainder = Math.max(max - filled, 0);
  const color = palette[tone];

  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'value', show: false, max },
    yAxis: { type: 'category', show: false, data: ['progress'] },
    series: [
      {
        type: 'bar',
        stack: 'total',
        data: [filled],
        barWidth: '100%',
        silent: true,
        itemStyle: { color, borderRadius: 999 },
      },
      {
        type: 'bar',
        stack: 'total',
        data: [remainder],
        barWidth: '100%',
        silent: true,
        itemStyle: { color: palette.border },
      },
    ],
  };
}
