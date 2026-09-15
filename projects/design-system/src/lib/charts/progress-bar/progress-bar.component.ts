import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { UmsBaseChartComponent } from '../base-chart';
import type { ChartPalette } from '../chart-theme.util';
import type { ChartTone } from '../chart.types';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { buildProgressBarOption } from '../progress.util';

/**
 * DSYS-16 Progress bar (requirement-spec.md §6) -- the linear counterpart to the Progress ring,
 * sharing its value/max/tone contract. See `progress.util.ts`'s class doc.
 */
@Component({
  selector: 'ums-progress-bar',
  standalone: true,
  template: `
    <div #chartContainer class="ums-chart__canvas" [style.block-size]="height()"></div>
    @if (label(); as text) {
      <span class="ums-chart__track-label">{{ text }}</span>
    }
  `,
  styleUrl: '../chart.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-chart ums-chart--bar' },
})
export class UmsProgressBarComponent extends UmsBaseChartComponent {
  readonly value = input.required<number>();
  readonly max = input<number>(100);
  readonly tone = input<ChartTone>('primary');
  readonly label = input<string | undefined>(undefined);
  readonly height = input<string>('12px');

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
    return buildProgressBarOption(palette, this.value(), this.max(), this.tone());
  }
}
