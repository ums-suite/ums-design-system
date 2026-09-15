import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { HeatmapCalendarEntry } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { buildHeatmapCalendarOption } from '../heatmap-calendar.util';

/**
 * DSYS-16 Heatmap calendar (requirement-spec.md §6 -- attendance, occupancy). A thin wrapper:
 * consumers pass `{ date, value }` entries, never an ECharts option -- see
 * `heatmap-calendar.util.ts`'s class doc for the `calendar`/`visualMap` mechanism.
 */
@Component({
  selector: 'ums-heatmap-calendar',
  standalone: true,
  template: `<div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>`,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart' },
})
export class UmsHeatmapCalendarComponent extends UmsBaseChartComponent {
  readonly entries = input.required<readonly HeatmapCalendarEntry[]>();
  readonly range = input<string | readonly [string, string] | undefined>(undefined);
  readonly height = input<string>('200px');

  constructor() {
    super();
    effect(() => {
      this.entries();
      this.range();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    return buildHeatmapCalendarOption(palette, this.entries(), { range: this.range() });
  }
}
