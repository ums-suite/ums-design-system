/**
 * DSYS-16 -- the one place this package imports from Apache ECharts' modular entry points
 * (`echarts/core` + explicit chart/renderer/component registration) rather than the full
 * `echarts` bundle, per design-decisions.md "Charting Engine Selection"'s accepted bundle-size
 * trade-off: ECharts is meaningfully heavier than a minimal bespoke layer, so only the modules
 * this package's chart family actually uses (Line/Bar/Pie for donut/area, Heatmap+Calendar for
 * the attendance/occupancy heatmap, Gauge is intentionally NOT registered -- the Progress ring
 * is built from PieChart instead, see progress-ring's own class doc) are registered, once, here.
 *
 * Every chart component imports `echarts` from this module, never `echarts` or `echarts/core`
 * directly -- so a future chart type only ever needs one new `.use()` registration, in one file.
 */
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts';
import {
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
]);

export { echarts };
