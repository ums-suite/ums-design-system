import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MotionService } from '../theming/motion.service';
import { ThemeService } from '../theming/theme.service';
import { resolveChartPalette, type ChartPalette } from './chart-theme.util';
import type { EChartsOptionInternal } from './echarts-option.types';

/**
 * DSYS-16 shared ECharts lifecycle/theming base for every chart component (Line/Bar/Donut/Area,
 * Sparkline, Progress ring/bar, Heatmap calendar) -- never exported from `public-api.ts`, since
 * it is an implementation detail of the thin wrapper, not something a consuming app extends
 * directly.
 *
 * - Lazily imports `echarts-setup.ts` (which registers only the chart/component modules this
 *   package's chart family actually uses) inside `afterNextRender`, so ECharts' own module
 *   evaluation and the chart's initial `init()` call both happen only once the container element
 *   actually exists in the DOM, and never during SSR/prerendering.
 * - **Mandatory live theme re-resolution** (design-decisions.md "Theme-Switch Transition
 *   Mechanism"): an `effect()` reads `ThemeService.resolvedTheme()` and, on every change, calls
 *   `resolveChartPalette` fresh (never a color cached from initial render) and re-applies the
 *   resulting option via `setOption` -- ECharts' own merge behavior (not a full re-init) means
 *   this also naturally satisfies the "interrupt-and-retarget" mid-animation requirement
 *   (edge-cases.md) for the common case of a `setOption` call while a prior transition is still
 *   playing.
 * - `prefers-reduced-motion` (via the shared `MotionService`) disables the *initial* animation
 *   for the currently-applied option; reduced-motion's own in-flight-animation-snapping guarantee
 *   is `MotionService`'s platform-wide `Document.getAnimations()`-based mechanism, which already
 *   covers everything on the page indiscriminately, chart canvases included, so no per-chart
 *   duplicate handling is needed here.
 * - A `ResizeObserver` on the container calls the chart's own `resize()` -- charts embedded in a
 *   flexible layout (a dashboard grid, a Modal, requirement-spec.md's own admin dashboards) must
 *   track their container's size, not just the window's.
 */
@Directive()
export abstract class UmsBaseChartComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly motionService = inject(MotionService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly container = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');

  // ECharts' own instance type, deliberately not re-exported; `any` here is scoped to this private field only.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chart: any;

  constructor() {
    afterNextRender(() => {
      void this.initChart();
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.chart?.dispose();
    });
  }

  private resizeObserver: ResizeObserver | undefined;

  private async initChart(): Promise<void> {
    const { echarts } = await import('./echarts-setup');
    this.chart = echarts.init(this.container().nativeElement);
    this.applyOption();

    effect(
      () => {
        this.themeService.resolvedTheme();
        this.applyOption();
      },
      { injector: this.injector },
    );

    this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
    this.resizeObserver.observe(this.container().nativeElement);
  }

  /** Re-resolves the live color palette and re-applies this chart's option -- see class doc. */
  protected applyOption(): void {
    if (!this.chart) return;
    const palette = resolveChartPalette(this.themeService);
    const option: EChartsOptionInternal = {
      ...this.buildOption(palette),
      animation: !this.motionService.prefersReducedMotion(),
    };
    this.chart.setOption(option);
  }

  /** Called on init and every theme change; return this chart's full option for the given palette. */
  protected abstract buildOption(palette: ChartPalette): EChartsOptionInternal;
}
