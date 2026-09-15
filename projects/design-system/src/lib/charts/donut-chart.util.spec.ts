import type { ChartPalette } from './chart-theme.util';
import { buildDonutOption } from './donut-chart.util';

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

describe('buildDonutOption', () => {
  it('renders a hollow ring by default', () => {
    const option = buildDonutOption(PALETTE, [{ name: 'Approved', value: 60 }]);
    const [series] = option.series as readonly { radius?: unknown }[];
    expect(series?.radius).toEqual(['55%', '75%']);
  });

  it('renders a solid pie when donut is false', () => {
    const option = buildDonutOption(PALETTE, [{ name: 'Approved', value: 60 }], { donut: false });
    const [series] = option.series as readonly { radius?: unknown }[];
    expect(series?.radius).toBe('75%');
  });

  it('carries every named slice through as pie data', () => {
    const option = buildDonutOption(PALETTE, [
      { name: 'Approved', value: 60 },
      { name: 'Rejected', value: 40 },
    ]);
    const [series] = option.series as readonly { data?: readonly { name: string }[] }[];
    expect(series?.data?.map((d) => d.name)).toEqual(['Approved', 'Rejected']);
  });

  it('omits the legend when showLegend is false', () => {
    const option = buildDonutOption(PALETTE, [{ name: 'Approved', value: 60 }], {
      showLegend: false,
    });
    expect(option.legend).toBeUndefined();
  });
});
