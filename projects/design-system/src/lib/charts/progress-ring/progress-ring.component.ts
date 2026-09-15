import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { ChartTone } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { buildProgressRingOption } from '../progress.util';

/**
 * DSYS-16 Progress ring (requirement-spec.md §6; `ums-alumni-web`'s live donation-progress
 * indicator, §3.4). See `progress.util.ts`'s class doc for why this is a two-slice Pie rather
 * than a Gauge series. The live percentage is real DOM text overlaid on the canvas
 * (`.ums-chart__center-label`, `chart.shared.scss`), not an ECharts-drawn label -- correctly
 * screen-reader-legible and Bengali-numeral-shaped, which a canvas label is not.
 */
@Component({
  selector: 'ums-progress-ring',
  standalone: true,
  template: `
    <div #chartContainer class="ums-chart__canvas" [style.block-size]="size()"></div>
    @if (showLabel()) {
      <span class="ums-chart__center-label">{{ percentLabel() }}</span>
    }
  `,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart ums-chart--ring' },
})
export class UmsProgressRingComponent extends UmsBaseChartComponent {
  readonly value = input.required<number>();
  readonly max = input<number>(100);
  readonly tone = input<ChartTone>('primary');
  readonly showLabel = input<boolean>(true);
  readonly size = input<string>('160px');

  protected readonly percentLabel = computed(
    () => `${Math.round((this.value() / this.max()) * 100)}%`,
  );

  constructor() {
    super();
    effect(() => {
      this.value();
      this.max();
      this.tone();
      this.applyOption();
    });
  }

  protected override buildOption(palette: ChartPalette): EChartsOptionInternal {
    return buildProgressRingOption(palette, this.value(), this.max(), this.tone());
  }
}
