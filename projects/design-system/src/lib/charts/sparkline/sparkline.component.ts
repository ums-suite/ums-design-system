import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { ChartTone } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { buildLineLikeOption } from '../line-like-chart.util';

/**
 * DSYS-16 Sparkline (requirement-spec.md §6) -- a chrome-free single-series line, meant to sit
 * inline in a KPI tile or a Data Table cell rather than claim a full chart's worth of layout
 * (see `chart.shared.scss`'s `.ums-chart--sparkline` host modifier). Reuses
 * `line-like-chart.util.ts`'s `minimal` mode rather than a bespoke renderer, then overrides the
 * resolved `color` with a single semantic tone (`ChartTone`) since a sparkline communicates a
 * single value's trend/status, never multiple distinguishable series.
 */
@Component({
  selector: 'ums-sparkline',
  standalone: true,
  template: `<div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>`,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart ums-chart--sparkline' },
})
export class UmsSparklineComponent extends UmsBaseChartComponent {
  readonly data = input.required<readonly number[]>();
  readonly area = input<boolean>(true);
  readonly tone = input<ChartTone>('primary');
  readonly height = input<string>('48px');

  private readonly categories = computed(() => this.data().map((_, index) => String(index)));

  constructor() {
    super();
    effect(() => {
      this.data();
      this.area();
      this.tone();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    const option = buildLineLikeOption(
      palette,
      this.categories(),
      [{ name: 'value', data: this.data() }],
      { area: this.area(), minimal: true },
    );
    return { ...option, color: [palette[this.tone()]] };
  }
}
