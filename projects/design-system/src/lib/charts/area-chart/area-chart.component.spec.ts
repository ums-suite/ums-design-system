import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsAreaChartComponent } from './area-chart.component';

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
describe('UmsAreaChartComponent', () => {
  function create() {
    return TestBed.createComponent(UmsAreaChartComponent);
  }

  function buildOption(instance: UmsAreaChartComponent): EChartsOptionInternal {
    return (
      instance as unknown as { buildOption: (palette: ChartPalette) => EChartsOptionInternal }
    ).buildOption(PALETTE);
  }

  it('always applies an areaStyle, unlike the plain Line chart', () => {
    const fixture = create();
    fixture.componentRef.setInput('categories', ['Jan']);
    fixture.componentRef.setInput('series', [{ name: 'Donations', data: [100] }]);
    const option = buildOption(fixture.componentInstance);
    const [series] = option.series as readonly { areaStyle?: unknown }[];
    expect(series.areaStyle).toBeTruthy();
  });

  it('defaults smooth to true (Area chart reads better with curves than sharp corners)', () => {
    const fixture = create();
    fixture.componentRef.setInput('categories', ['Jan']);
    fixture.componentRef.setInput('series', [{ name: 'Donations', data: [100] }]);
    const option = buildOption(fixture.componentInstance);
    const [series] = option.series as readonly { smooth?: boolean }[];
    expect(series.smooth).toBe(true);
  });
});
