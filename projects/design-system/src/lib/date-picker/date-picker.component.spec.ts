import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsDatePickerComponent } from './date-picker.component';

@Component({
  standalone: true,
  imports: [UmsDatePickerComponent],
  template: `
    <ums-date-picker
      [value]="value()"
      [min]="min()"
      [max]="max()"
      (valueChange)="value.set($event)"
    />
  `,
})
class HostComponent {
  readonly value = signal<string | null>(null);
  readonly min = signal<string | null>(null);
  readonly max = signal<string | null>(null);
}

describe('UmsDatePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function toggleButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-date-picker__toggle'))
      .nativeElement as HTMLButtonElement;
  }

  function panel(): HTMLElement | null {
    return fixture.debugElement.query(By.css('[role="dialog"]'))?.nativeElement ?? null;
  }

  function dayButtonByIso(iso: string): HTMLButtonElement {
    const match = fixture.debugElement
      .queryAll(By.css('.ums-date-picker__day'))
      .find((el) => (el.nativeElement as HTMLElement).getAttribute('data-iso') === iso);
    if (!match) throw new Error(`no day button found for ${iso}`);
    return match.nativeElement as HTMLButtonElement;
  }

  it('is closed by default', () => {
    expect(panel()).toBeNull();
  });

  it('opens the calendar panel on toggle click', () => {
    toggleButton().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
  });

  it('shows an empty display value until a date is set', () => {
    const input = fixture.debugElement.query(By.css('.ums-date-picker__input'))
      .nativeElement as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('formats a selected ISO value for display', () => {
    host.value.set('2026-09-12');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('.ums-date-picker__input'))
      .nativeElement as HTMLInputElement;
    expect(input.value).toBe('Sep 12, 2026');
  });

  it('clicking a day emits its ISO date and closes the panel', () => {
    host.value.set('2026-09-01');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    dayButtonByIso('2026-09-15').click();
    fixture.detectChanges();

    expect(host.value()).toBe('2026-09-15');
    expect(panel()).toBeNull();
  });

  it('ArrowRight moves the focused day forward by one', () => {
    host.value.set('2026-09-01');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('.ums-date-picker__grid'))
      .nativeElement as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    const focused = fixture.debugElement
      .queryAll(By.css('.ums-date-picker__day'))
      .find((el) => (el.nativeElement as HTMLElement).getAttribute('tabindex') === '0');
    if (!focused) throw new Error('no focused day button found');
    expect((focused.nativeElement as HTMLElement).getAttribute('data-iso')).toBe('2026-09-02');
  });

  it('Enter on the focused day selects it', () => {
    host.value.set('2026-09-01');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('.ums-date-picker__grid'))
      .nativeElement as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe('2026-09-01');
    expect(panel()).toBeNull();
  });

  it('Escape closes the panel without changing the value', () => {
    host.value.set('2026-09-01');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('.ums-date-picker__grid'))
      .nativeElement as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(host.value()).toBe('2026-09-01');
  });

  it('disables days outside a configured min/max range and blocks selecting them', () => {
    host.value.set('2026-09-15');
    host.min.set('2026-09-10');
    host.max.set('2026-09-20');
    fixture.detectChanges();
    toggleButton().click();
    fixture.detectChanges();

    expect(dayButtonByIso('2026-09-01').disabled).toBeTrue();
    expect(dayButtonByIso('2026-09-25').disabled).toBeTrue();
    expect(dayButtonByIso('2026-09-15').disabled).toBeFalse();

    dayButtonByIso('2026-09-01').click();
    fixture.detectChanges();
    expect(host.value()).toBe('2026-09-15'); // unchanged -- disabled day can't be selected
  });
});
