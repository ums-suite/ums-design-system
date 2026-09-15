import type { ChartPalette } from './chart-theme.util';
import { buildLineLikeOption } from './line-like-chart.util';

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

describe('buildLineLikeOption', () => {
  it('renders full axis/tooltip/legend chrome by default', () => {
    const option = buildLineLikeOption(
      PALETTE,
      ['Jan', 'Feb'],
      [
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [3, 4] },
      ],
    );
    expect(option.tooltip).toEqual(jasmine.objectContaining({ trigger: 'axis' }));
    expect(option.legend).toBeTruthy();
    expect((option.xAxis as { show?: boolean }).show).not.toBe(false);
  });

  it('strips all chrome in minimal (sparkline) mode', () => {
    const option = buildLineLikeOption(PALETTE, ['0', '1'], [{ name: 'value', data: [1, 2] }], {
      minimal: true,
    });
    expect(option.tooltip).toBeUndefined();
    expect(option.legend).toBeUndefined();
    expect((option.xAxis as { show?: boolean }).show).toBe(false);
    expect((option.yAxis as { show?: boolean }).show).toBe(false);
    const [series] = option.series as readonly { symbol?: string; showSymbol?: boolean }[];
    expect(series?.symbol).toBe('none');
    expect(series?.showSymbol).toBe(false);
  });

  it('applies an areaStyle only when area is requested', () => {
    const withArea = buildLineLikeOption(PALETTE, ['Jan'], [{ name: 'A', data: [1] }], {
      area: true,
    });
    const withoutArea = buildLineLikeOption(PALETTE, ['Jan'], [{ name: 'A', data: [1] }]);
    const [seriesWithArea] = withArea.series as readonly { areaStyle?: unknown }[];
    const [seriesWithoutArea] = withoutArea.series as readonly { areaStyle?: unknown }[];
    expect(seriesWithArea?.areaStyle).toBeTruthy();
    expect(seriesWithoutArea?.areaStyle).toBeUndefined();
  });

  it('passes smooth through to every series', () => {
    const option = buildLineLikeOption(PALETTE, ['Jan'], [{ name: 'A', data: [1] }], {
      smooth: true,
    });
    const [series] = option.series as readonly { smooth?: boolean }[];
    expect(series?.smooth).toBe(true);
  });

  it('hides the legend for a single series even when showLegend is true', () => {
    const option = buildLineLikeOption(PALETTE, ['Jan'], [{ name: 'A', data: [1] }], {
      showLegend: true,
    });
    expect(option.legend).toBeUndefined();
  });
});
