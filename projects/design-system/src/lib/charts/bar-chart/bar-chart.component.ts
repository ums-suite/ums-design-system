import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import { buildBarOption } from '../bar-chart.util';
import type { ChartPalette } from '../chart-theme.util';
import type { ChartSeries } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';

/**
 * DSYS-16 Bar chart (requirement-spec.md §6). A thin wrapper: consumers pass plain
 * `categories`/`series` data, never an ECharts option -- see `UmsBaseChartComponent`'s class doc
 * for the shared lifecycle/theming mechanism every chart in this family uses.
 */
@Component({
  selector: 'ums-bar-chart',
  standalone: true,
  template: `<div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>`,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart' },
})
export class UmsBarChartComponent extends UmsBaseChartComponent {
  readonly categories = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  readonly horizontal = input<boolean>(false);
  readonly stacked = input<boolean>(false);
  readonly showLegend = input<boolean>(true);
  readonly height = input<string>('320px');

  constructor() {
    super();
    effect(() => {
      this.categories();
      this.series();
      this.horizontal();
      this.stacked();
      this.showLegend();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    return buildBarOption(palette, this.categories(), this.series(), {
      horizontal: this.horizontal(),
      stacked: this.stacked(),
      showLegend: this.showLegend(),
    });
  }
}
