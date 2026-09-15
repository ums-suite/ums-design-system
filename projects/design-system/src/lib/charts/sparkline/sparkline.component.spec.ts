import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsSparklineComponent } from './sparkline.component';

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
describe('UmsSparklineComponent', () => {
  function create() {
    return TestBed.createComponent(UmsSparklineComponent);
  }

  function buildOption(instance: UmsSparklineComponent): EChartsOptionInternal {
    return (
      instance as unknown as { buildOption: (palette: ChartPalette) => EChartsOptionInternal }
    ).buildOption(PALETTE);
  }

  it('strips all axis/legend/tooltip chrome', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [1, 4, 2, 6]);
    const option = buildOption(fixture.componentInstance);
    expect(option.tooltip).toBeUndefined();
    expect(option.legend).toBeUndefined();
    expect((option.xAxis as { show?: boolean }).show).toBe(false);
  });

  it('resolves a single semantic tone color rather than the categorical rotation', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [1, 2, 3]);
    fixture.componentRef.setInput('tone', 'danger');
    const option = buildOption(fixture.componentInstance);
    expect(option['color']).toEqual([PALETTE.danger]);
  });

  it('defaults to the primary tone and an area fill', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [1, 2, 3]);
    const option = buildOption(fixture.componentInstance);
    expect(option['color']).toEqual([PALETTE.primary]);
    const [series] = option.series as readonly { areaStyle?: unknown }[];
    expect(series.areaStyle).toBeTruthy();
  });

  it('derives categories as stringified indices, matching the data length', () => {
    const fixture = create();
    fixture.componentRef.setInput('data', [5, 6, 7]);
    const option = buildOption(fixture.componentInstance);
    expect((option.xAxis as { data?: readonly string[] }).data).toEqual(['0', '1', '2']);
  });
});
