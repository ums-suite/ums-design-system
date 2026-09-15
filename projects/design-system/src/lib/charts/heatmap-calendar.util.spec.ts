import type { ChartPalette } from './chart-theme.util';
import { buildHeatmapCalendarOption } from './heatmap-calendar.util';

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

describe('buildHeatmapCalendarOption', () => {
  it('defaults the calendar range to the year of the first entry', () => {
    const option = buildHeatmapCalendarOption(PALETTE, [
      { date: '2026-02-14', value: 3 },
      { date: '2026-03-01', value: 1 },
    ]);
    expect((option.calendar as { range?: unknown }).range).toBe('2026');
  });

  it('honors an explicit [start, end] range', () => {
    const option = buildHeatmapCalendarOption(PALETTE, [{ date: '2026-02-14', value: 3 }], {
      range: ['2026-01-01', '2026-06-30'],
    });
    expect((option.calendar as { range?: unknown }).range).toEqual(['2026-01-01', '2026-06-30']);
  });

  it('maps each entry to a [date, value] heatmap datapoint', () => {
    const option = buildHeatmapCalendarOption(PALETTE, [{ date: '2026-02-14', value: 3 }]);
    const [series] = option.series as readonly { data?: unknown }[];
    expect(series?.data).toEqual([['2026-02-14', 3]]);
  });

  it('resolves visualMap max from the largest value, guarding against an all-zero dataset', () => {
    const option = buildHeatmapCalendarOption(PALETTE, [{ date: '2026-02-14', value: 0 }]);
    expect((option.visualMap as { max?: number }).max).toBe(1);
  });
});
