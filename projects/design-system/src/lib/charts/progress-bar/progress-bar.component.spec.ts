import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsProgressBarComponent } from './progress-bar.component';

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
describe('UmsProgressBarComponent', () => {
  function create() {
    return TestBed.createComponent(UmsProgressBarComponent);
  }

  it('splits value/remainder into two stacked bar segments', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 72);
    fixture.componentRef.setInput('max', 100);
    const option = (
      fixture.componentInstance as unknown as {
        buildOption: (palette: ChartPalette) => EChartsOptionInternal;
      }
    ).buildOption(PALETTE);
    const series = option.series as readonly { data: readonly number[] }[];
    expect(series[0]?.data).toEqual([72]);
    expect(series[1]?.data).toEqual([28]);
  });

  it('defaults max to 100', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 40);
    expect((fixture.componentInstance as unknown as { max: () => number }).max()).toBe(100);
  });
});
