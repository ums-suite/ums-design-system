import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsDonutChartComponent } from './donut-chart.component';

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

/** See `line-chart.component.spec.ts` for why these never call `fixture.detectChanges()`. */
describe('UmsDonutChartComponent', () => {
  function create() {
    return TestBed.createComponent(UmsDonutChartComponent);
  }

  function buildOption(instance: UmsDonutChartComponent): EChartsOptionInternal {
    return (
      instance as unknown as { buildOption: (palette: ChartPalette) => EChartsOptionInternal }
    ).buildOption(PALETTE);
  }

  it('defaults to a hollow donut ring', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [
      { name: 'Approved', value: 60 },
      { name: 'Rejected', value: 40 },
    ]);
    const option = buildOption(fixture.componentInstance);
    const [series] = option.series as readonly { radius?: unknown }[];
    expect(series.radius).toEqual(['55%', '75%']);
  });

  it('renders a solid pie when donut is set to false', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [{ name: 'Approved', value: 60 }]);
    fixture.componentRef.setInput('donut', false);
    const option = buildOption(fixture.componentInstance);
    const [series] = option.series as readonly { radius?: unknown }[];
    expect(series.radius).toBe('75%');
  });
});
