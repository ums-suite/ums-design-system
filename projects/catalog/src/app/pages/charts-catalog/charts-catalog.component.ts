import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  UmsAreaChartComponent,
  UmsBarChartComponent,
  UmsButtonComponent,
  UmsDonutChartComponent,
  UmsHeatmapCalendarComponent,
  UmsLineChartComponent,
  UmsModalComponent,
  UmsProgressBarComponent,
  UmsProgressRingComponent,
  UmsSparklineComponent,
  type ChartSeries,
  type HeatmapCalendarEntry,
} from '@ums/design-system';

const HEATMAP_ENTRIES: readonly HeatmapCalendarEntry[] = Array.from(
  { length: 90 },
  (_, index): HeatmapCalendarEntry => {
    const date = new Date(Date.UTC(2026, 0, 1 + index));
    // A deterministic, repeatable-looking attendance pattern (busier on weekdays) rather than
    // `Math.random()` -- e2e screenshot baselines need identical data on every run.
    const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    return {
      date: date.toISOString().slice(0, 10),
      value: isWeekend ? index % 3 : (index * 7) % 20,
    };
  },
);

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-16 Data Visualization family (Line, Bar,
 * Donut, Area, Sparkline, Progress ring/bar, Heatmap calendar -- requirement-spec.md §6).
 *
 * "Live update" exercises the mid-animation interrupt-and-retarget requirement
 * (edge-cases.md "A Chart Component Renders With a Dataset That Updates Mid-Animation"):
 * `updateBarOnce` and `updateBarRapidly` both converge on the *same* final dataset, but the
 * latter first sets a decoy value and retargets to the real one less than one animation frame
 * later -- `e2e/charts.spec.ts` asserts both paths render pixel-identically once settled,
 * which is only true if ECharts' own animation system retargeted rather than got stuck or
 * landed on the decoy.
 *
 * "Chart in modal" is the mandatory open-overlay-plus-live-theme-toggle case
 * (design-decisions.md "Theme-Switch Transition Mechanism") -- `e2e/charts.spec.ts` opens this
 * modal, toggles the app-level theme switcher without closing it, and asserts the chart inside
 * repaints to the new palette while the modal stays open.
 */
@Component({
  selector: 'app-charts-catalog',
  standalone: true,
  imports: [
    UmsLineChartComponent,
    UmsBarChartComponent,
    UmsAreaChartComponent,
    UmsSparklineComponent,
    UmsDonutChartComponent,
    UmsProgressRingComponent,
    UmsProgressBarComponent,
    UmsHeatmapCalendarComponent,
    UmsButtonComponent,
    UmsModalComponent,
  ],
  templateUrl: './charts-catalog.component.html',
  styleUrl: './charts-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsCatalogComponent {
  protected readonly enrollmentCategories: readonly string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
  ];
  protected readonly enrollmentSeries: readonly ChartSeries[] = [
    { name: 'Applied', data: [420, 460, 510, 480, 540, 600] },
    { name: 'Admitted', data: [180, 200, 230, 210, 240, 260] },
  ];

  protected readonly collectionRateSeries: readonly ChartSeries[] = [
    { name: 'Collected', data: [72, 78, 65, 81, 88, 92] },
  ];

  protected readonly donationSparkline: readonly number[] = [12, 18, 15, 24, 30, 28, 35, 42];

  protected readonly enrollmentFunnelSlices = [
    { name: 'Applied', value: 600 },
    { name: 'Shortlisted', value: 340 },
    { name: 'Admitted', value: 260 },
    { name: 'Enrolled', value: 205 },
  ];

  protected readonly heatmapEntries = HEATMAP_ENTRIES;

  // -- Live update / interrupt-and-retarget demo --------------------------------------------
  private readonly finalBarTarget: readonly number[] = [200, 55, 130];
  private readonly decoyBarTarget: readonly number[] = [10, 10, 10];

  protected readonly occupancyData = signal<readonly number[]>([120, 90, 60]);
  protected readonly occupancySeries = computed<readonly ChartSeries[]>(() => [
    { name: 'Beds occupied', data: [...this.occupancyData()] },
  ]);

  protected updateOnce(): void {
    this.occupancyData.set([...this.finalBarTarget]);
  }

  protected updateRapidly(): void {
    this.occupancyData.set([...this.decoyBarTarget]);
    setTimeout(() => this.occupancyData.set([...this.finalBarTarget]), 40);
  }

  // -- Chart-in-modal / live theme-toggle demo -----------------------------------------------
  protected readonly modalOpen = signal(false);

  protected openModal(): void {
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }
}
