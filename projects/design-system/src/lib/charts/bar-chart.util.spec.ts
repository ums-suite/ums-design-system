import { buildBarOption } from './bar-chart.util';
import type { ChartPalette } from './chart-theme.util';

const PALETTE: ChartPalette = {
  categorical: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666'],
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

describe('buildBarOption', () => {
  it('puts the category axis on x and the value axis on y by default (vertical bars)', () => {
    const option = buildBarOption(
      PALETTE,
      ['Jan', 'Feb'],
      [{ name: 'Applicants', data: [10, 20] }],
    );
    expect(option.xAxis).toEqual(
      jasmine.objectContaining({ type: 'category', data: ['Jan', 'Feb'] }),
    );
    expect(option.yAxis).toEqual(jasmine.objectContaining({ type: 'value' }));
    expect(option.series).toEqual([
      jasmine.objectContaining({
        type: 'bar',
        name: 'Applicants',
        data: [10, 20],
        stack: undefined,
      }),
    ]);
  });

  it('flips the axes when horizontal is set', () => {
    const option = buildBarOption(
      PALETTE,
      ['Jan', 'Feb'],
      [{ name: 'Applicants', data: [10, 20] }],
      {
        horizontal: true,
      },
    );
    expect(option.xAxis).toEqual(jasmine.objectContaining({ type: 'value' }));
    expect(option.yAxis).toEqual(jasmine.objectContaining({ type: 'category' }));
  });

  it('assigns every series the shared stack key when stacked', () => {
    const option = buildBarOption(
      PALETTE,
      ['Jan'],
      [
        { name: 'A', data: [1] },
        { name: 'B', data: [2] },
      ],
      { stacked: true },
    );
    const series = option.series as readonly { stack?: string }[];
    expect(series[0]?.stack).toBe('total');
    expect(series[1]?.stack).toBe('total');
  });

  it('hides the legend for a single series even when showLegend is true', () => {
    const option = buildBarOption(PALETTE, ['Jan'], [{ name: 'A', data: [1] }], {
      showLegend: true,
    });
    expect(option.legend).toBeUndefined();
  });
});
