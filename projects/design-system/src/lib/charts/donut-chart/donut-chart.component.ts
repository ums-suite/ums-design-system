import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { DonutSlice } from '../chart.types';
import { buildDonutOption } from '../donut-chart.util';
import type { EChartsOptionInternal } from '../echarts-option.types';

/**
 * DSYS-16 Donut chart (requirement-spec.md §6). A thin wrapper: consumers pass named
 * `{ name, value }` slices, never an ECharts option -- see `UmsBaseChartComponent`'s class doc
 * for the shared lifecycle/theming mechanism every chart in this family uses.
 */
@Component({
  selector: 'ums-donut-chart',
  standalone: true,
  template: `<div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>`,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart' },
})
export class UmsDonutChartComponent extends UmsBaseChartComponent {
  readonly data = input.required<readonly DonutSlice[]>();
  readonly showLegend = input<boolean>(true);
  readonly donut = input<boolean>(true);
  readonly height = input<string>('280px');

  constructor() {
    super();
    effect(() => {
      this.data();
      this.showLegend();
      this.donut();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    return buildDonutOption(palette, this.data(), {
      showLegend: this.showLegend(),
      donut: this.donut(),
    });
  }
}
