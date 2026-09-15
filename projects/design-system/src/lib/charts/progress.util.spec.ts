import type { ChartPalette } from './chart-theme.util';
import { buildProgressBarOption, buildProgressRingOption } from './progress.util';

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

describe('buildProgressRingOption', () => {
  it('splits into a filled slice (resolved tone color) and a remainder slice (border color)', () => {
    const option = buildProgressRingOption(PALETTE, 30, 100, 'success');
    const [series] = option.series as readonly {
      data?: readonly { name: string; value: number; itemStyle?: { color?: string } }[];
    }[];
    expect(series?.data).toEqual([
      { name: 'value', value: 30, itemStyle: { color: PALETTE.success } },
      { name: 'remainder', value: 70, itemStyle: { color: PALETTE.border } },
    ]);
  });

  it('clamps a value above max so the remainder never goes negative', () => {
    const option = buildProgressRingOption(PALETTE, 150, 100, 'primary');
    const [series] = option.series as readonly {
      data?: readonly { value: number }[];
    }[];
    expect(series?.data?.[0]?.value).toBe(100);
    expect(series?.data?.[1]?.value).toBe(0);
  });

  it('defaults to the primary tone', () => {
    const option = buildProgressRingOption(PALETTE, 10, 100);
    const [series] = option.series as readonly {
      data?: readonly { itemStyle?: { color?: string } }[];
    }[];
    expect(series?.data?.[0]?.itemStyle?.color).toBe(PALETTE.primary);
  });
});

describe('buildProgressBarOption', () => {
  it('renders two stacked bar segments summing to max', () => {
    const option = buildProgressBarOption(PALETTE, 25, 100, 'danger');
    const series = option.series as readonly { data: readonly number[] }[];
    expect(series[0]?.data).toEqual([25]);
    expect(series[1]?.data).toEqual([75]);
  });

  it('hides both axes', () => {
    const option = buildProgressBarOption(PALETTE, 25, 100);
    expect((option.xAxis as { show?: boolean }).show).toBe(false);
    expect((option.yAxis as { show?: boolean }).show).toBe(false);
  });
});
