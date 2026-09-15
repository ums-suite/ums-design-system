import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsHeatmapCalendarComponent } from './heatmap-calendar.component';

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
describe('UmsHeatmapCalendarComponent', () => {
  function create() {
    return TestBed.createComponent(UmsHeatmapCalendarComponent);
  }

  it('maps entries to [date, value] heatmap datapoints against the calendar coordinate system', () => {
    const fixture = create();
    fixture.componentRef.setInput('entries', [
      { date: '2026-01-05', value: 2 },
      { date: '2026-01-06', value: 5 },
    ]);
    const option = (
      fixture.componentInstance as unknown as {
        buildOption: (palette: ChartPalette) => EChartsOptionInternal;
      }
    ).buildOption(PALETTE);
    const [series] = option.series as readonly { coordinateSystem?: string; data?: unknown }[];
    expect(series.coordinateSystem).toBe('calendar');
    expect(series.data).toEqual([
      ['2026-01-05', 2],
      ['2026-01-06', 5],
    ]);
  });

  it('passes an explicit range input through to the calendar option', () => {
    const fixture = create();
    fixture.componentRef.setInput('entries', [{ date: '2026-01-05', value: 2 }]);
    fixture.componentRef.setInput('range', ['2026-01-01', '2026-03-31']);
    const option = (
      fixture.componentInstance as unknown as {
        buildOption: (palette: ChartPalette) => EChartsOptionInternal;
      }
    ).buildOption(PALETTE);
    expect((option.calendar as { range?: unknown }).range).toEqual(['2026-01-01', '2026-03-31']);
  });
});
