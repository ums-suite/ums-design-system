import { TestBed } from '@angular/core/testing';
import type { ChartPalette } from '../chart-theme.util';
import type { EChartsOptionInternal } from '../echarts-option.types';
import { UmsProgressRingComponent } from './progress-ring.component';

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

/**
 * See `line-chart.component.spec.ts` for why these never call `fixture.detectChanges()`.
 * `percentLabel` is a plain `computed()` over the `value`/`max` inputs, so it (like
 * `buildOption`) is readable without any rendering at all.
 */
describe('UmsProgressRingComponent', () => {
  function create() {
    return TestBed.createComponent(UmsProgressRingComponent);
  }

  it('formats percentLabel as a rounded percentage of max', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 33);
    fixture.componentRef.setInput('max', 100);
    const label = (
      fixture.componentInstance as unknown as { percentLabel: () => string }
    ).percentLabel();
    expect(label).toBe('33%');
  });

  it('rounds a fractional percentage', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 1);
    fixture.componentRef.setInput('max', 3);
    const label = (
      fixture.componentInstance as unknown as { percentLabel: () => string }
    ).percentLabel();
    expect(label).toBe('33%');
  });

  it('builds a two-slice pie using the resolved tone as the filled color', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 30);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('tone', 'success');
    const option = (
      fixture.componentInstance as unknown as {
        buildOption: (palette: ChartPalette) => EChartsOptionInternal;
      }
    ).buildOption(PALETTE);
    const [series] = option.series as readonly {
      data?: readonly { name: string; value: number; itemStyle?: { color?: string } }[];
    }[];
    expect(series.data?.[0]).toEqual({
      name: 'value',
      value: 30,
      itemStyle: { color: PALETTE.success },
    });
    expect(series.data?.[1]).toEqual({
      name: 'remainder',
      value: 70,
      itemStyle: { color: PALETTE.border },
    });
  });
});
