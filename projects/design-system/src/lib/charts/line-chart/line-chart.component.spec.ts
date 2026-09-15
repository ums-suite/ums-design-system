import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsLineChartComponent } from './line-chart.component';

const PALETTE: ChartPalette = {
  categorical: ['#111111', '#222222'],
  primary: '#111111',
  secondary: '#222222',
  success: '#333333',
  warning: '#444444',
  danger: '#555555',
  info: '#666666',
  text: '#000000',
  textMuted: '#777777',
  border: '#999999',
  surface: '#ffffff',
  background: '#f0f0f0',
};

/**
 * These specs call `buildOption` directly and deliberately never call `fixture.detectChanges()`
 * -- the real chart lifecycle (`afterNextRender` -> a dynamic `import('./echarts-setup')` ->
 * `echarts.init`) is exactly the class of real-browser, real-timing async behavior
 * `data-table.component.spec.ts` already documents as unreliable to await inside
 * Karma/Jasmine's zone-based flushing. That lifecycle -- and the live theme-repaint /
 * mid-animation-retarget requirements it enables -- is instead covered against a real
 * Playwright-driven Chromium in `e2e/charts.spec.ts`. What's verified here is purely this
 * component's own input-to-ECharts-option mapping, which needs no rendering at all.
 */
describe('UmsLineChartComponent', () => {
  function buildOption(setup: (ref: ReturnType<typeof create>) => void): EChartsOptionInternal {
    const fixture = create();
    setup(fixture);
    return (
      fixture.componentInstance as unknown as {
        buildOption: (palette: ChartPalette) => EChartsOptionInternal;
      }
    ).buildOption(PALETTE);
  }

  function create() {
    return TestBed.createComponent(UmsLineChartComponent);
  }

  it('defaults to a non-smoothed line series with the legend shown for multiple series', () => {
    const option = buildOption((fixture) => {
      fixture.componentRef.setInput('categories', ['Jan', 'Feb']);
      fixture.componentRef.setInput('series', [
        { name: 'Applied', data: [10, 20] },
        { name: 'Admitted', data: [5, 8] },
      ]);
    });
    const [series] = option.series as readonly { type: string; smooth?: boolean }[];
    expect(series.type).toBe('line');
    expect(series.smooth).toBe(false);
    expect(option.legend).toBeTruthy();
  });

  it('honors the smooth and showLegend inputs', () => {
    const option = buildOption((fixture) => {
      fixture.componentRef.setInput('categories', ['Jan']);
      fixture.componentRef.setInput('series', [{ name: 'Applied', data: [10] }]);
      fixture.componentRef.setInput('smooth', true);
      fixture.componentRef.setInput('showLegend', false);
    });
    const [series] = option.series as readonly { smooth?: boolean }[];
    expect(series.smooth).toBe(true);
    expect(option.legend).toBeUndefined();
  });

  it('never applies an areaStyle (that is the Area chart component, not this one)', () => {
    const option = buildOption((fixture) => {
      fixture.componentRef.setInput('categories', ['Jan']);
      fixture.componentRef.setInput('series', [{ name: 'Applied', data: [10] }]);
    });
    const [series] = option.series as readonly { areaStyle?: unknown }[];
    expect(series.areaStyle).toBeUndefined();
  });
});
