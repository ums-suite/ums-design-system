import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { ChartSeries } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { buildLineLikeOption } from '../line-like-chart.util';

/**
 * DSYS-16 Line chart (requirement-spec.md §6). A thin wrapper: consumers pass plain
 * `categories`/`series` data, never an ECharts option -- see `UmsBaseChartComponent`'s class doc
 * for the shared lifecycle/theming mechanism every chart in this family uses.
 */
@Component({
  selector: 'ums-line-chart',
  standalone: true,
  template: `<div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>`,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart' },
})
export class UmsLineChartComponent extends UmsBaseChartComponent {
  readonly categories = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  readonly smooth = input<boolean>(false);
  readonly showLegend = input<boolean>(true);
  readonly height = input<string>('320px');

  constructor() {
    super();
    effect(() => {
      this.categories();
      this.series();
      this.smooth();
      this.showLegend();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    return buildLineLikeOption(palette, this.categories(), this.series(), {
      smooth: this.smooth(),
      showLegend: this.showLegend(),
    });
  }
}
