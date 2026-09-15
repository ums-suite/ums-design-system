import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsBarChartComponent } from './bar-chart.component';

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
describe('UmsBarChartComponent', () => {
  function create() {
    return TestBed.createComponent(UmsBarChartComponent);
  }

  function buildOption(instance: UmsBarChartComponent): EChartsOptionInternal {
    return (
      instance as unknown as { buildOption: (palette: ChartPalette) => EChartsOptionInternal }
    ).buildOption(PALETTE);
  }

  it('defaults to vertical (category-on-x) bars', () => {
    const fixture = create();
    fixture.componentRef.setInput('categories', ['Jan', 'Feb']);
    fixture.componentRef.setInput('series', [{ name: 'Applied', data: [10, 20] }]);
    const option = buildOption(fixture.componentInstance);
    expect(option.xAxis).toEqual(jasmine.objectContaining({ type: 'category' }));
  });

  it('flips to horizontal bars when horizontal is true', () => {
    const fixture = create();
    fixture.componentRef.setInput('categories', ['Jan', 'Feb']);
    fixture.componentRef.setInput('series', [{ name: 'Applied', data: [10, 20] }]);
    fixture.componentRef.setInput('horizontal', true);
    const option = buildOption(fixture.componentInstance);
    expect(option.yAxis).toEqual(jasmine.objectContaining({ type: 'category' }));
  });

  it('stacks every series under one key when stacked is true', () => {
    const fixture = create();
    fixture.componentRef.setInput('categories', ['Jan']);
    fixture.componentRef.setInput('series', [
      { name: 'Applied', data: [10] },
      { name: 'Admitted', data: [4] },
    ]);
    fixture.componentRef.setInput('stacked', true);
    const option = buildOption(fixture.componentInstance);
    const series = option.series as readonly { stack?: string }[];
    expect(series.every((s) => s.stack === 'total')).toBe(true);
  });
});
