import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsDateRangePickerComponent } from './date-range-picker.component';
import type { DateRange } from './date-range-picker.types';

@Component({
  standalone: true,
  imports: [UmsDateRangePickerComponent],
  template: `
    <ums-date-range-picker
      [start]="range().start"
      [end]="range().end"
      [min]="min()"
      [max]="max()"
      (rangeChange)="range.set($event)"
    />
  `,
})
class HostComponent {
  readonly range = signal<DateRange>({ start: null, end: null });
  readonly min = signal<string | null>(null);
  readonly max = signal<string | null>(null);
}

describe('UmsDateRangePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function toggleButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-date-range-picker__toggle'))
      .nativeElement as HTMLButtonElement;
  }

  function panel(): HTMLElement | null {
    return fixture.debugElement.query(By.css('[role="dialog"]'))?.nativeElement ?? null;
  }

  function dayButtonByIso(iso: string): HTMLButtonElement {
    const match = fixture.debugElement
      .queryAll(By.css('.ums-date-range-picker__day'))
      .find((el) => (el.nativeElement as HTMLElement).getAttribute('data-iso') === iso);
    if (!match) throw new Error(`no day button found for ${iso}`);
    return match.nativeElement as HTMLButtonElement;
  }

  it('shows an empty display value until a range is set', () => {
    const input = fixture.debugElement.query(By.css('.ums-date-range-picker__input'))
      .nativeElement as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('the first day clicked (no existing range) becomes the range start with no end yet', () => {
    toggleButton().click();
    fixture.detectChanges();

    dayButtonByIso('2026-09-10').click();
    fixture.detectChanges();

    expect(host.range()).toEqual({ start: '2026-09-10', end: null });
    expect(panel()).toBeTruthy(); // stays open awaiting the end date
  });

  it('a second, later click completes the range and closes the panel', () => {
    host.range.set({ start: '2026-09-10', end: null });
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    dayButtonByIso('2026-09-20').click();
    fixture.detectChanges();

    expect(host.range()).toEqual({ start: '2026-09-10', end: '2026-09-20' });
    expect(panel()).toBeNull();
  });

  it('clicking a day before the current start restarts the range there instead', () => {
    host.range.set({ start: '2026-09-10', end: null });
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    dayButtonByIso('2026-09-05').click();
    fixture.detectChanges();

    expect(host.range()).toEqual({ start: '2026-09-05', end: null });
  });

  it('clicking a day once a complete range already exists starts a fresh range', () => {
    host.range.set({ start: '2026-09-10', end: '2026-09-20' });
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    dayButtonByIso('2026-09-15').click();
    fixture.detectChanges();

    expect(host.range()).toEqual({ start: '2026-09-15', end: null });
  });

  it('formats a completed range for display', () => {
    host.range.set({ start: '2026-09-10', end: '2026-09-20' });
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('.ums-date-range-picker__input'))
      .nativeElement as HTMLInputElement;
    expect(input.value).toBe('Sep 10, 2026 - Sep 20, 2026');
  });

  it('marks days strictly between start and end as in-range', () => {
    host.range.set({ start: '2026-09-10', end: '2026-09-12' });
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    expect(dayButtonByIso('2026-09-11').className).toContain('in-range');
    expect(dayButtonByIso('2026-09-10').className).not.toContain('in-range');
    expect(dayButtonByIso('2026-09-13').className).not.toContain('in-range');
  });

  it('disables days outside a configured min/max range', () => {
    host.min.set('2026-09-05');
    host.max.set('2026-09-25');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    expect(dayButtonByIso('2026-09-01').disabled).toBeTrue();
    expect(dayButtonByIso('2026-09-28').disabled).toBeTrue();
    expect(dayButtonByIso('2026-09-15').disabled).toBeFalse();
  });
});
