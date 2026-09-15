import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsComboboxComponent } from './combobox.component';
import type { ComboboxOption } from './combobox.types';

@Component({
  standalone: true,
  imports: [UmsComboboxComponent],
  template: `
    <ums-combobox [options]="options" [value]="value()" (valueChange)="value.set($event)" />
  `,
})
class HostComponent {
  readonly options: ComboboxOption[] = [
    { value: 'dhaka', label: 'Dhaka' },
    { value: 'chittagong', label: 'Chittagong' },
    { value: 'khulna', label: 'Khulna' },
  ];
  readonly value = signal('');
}

describe('UmsComboboxComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function inputEl(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  function options(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('[role="option"]')).map((el) => el.nativeElement);
  }

  it('is closed with an empty query by default (role=combobox, aria-expanded=false)', () => {
    expect(inputEl().getAttribute('role')).toBe('combobox');
    expect(inputEl().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.debugElement.query(By.css('[role="listbox"]'))).toBeNull();
  });

  it('opens and filters options as the user types', () => {
    inputEl().value = 'ch';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl().getAttribute('aria-expanded')).toBe('true');
    const visible = options();
    expect(visible.length).toBe(1);
    expect(visible[0].textContent).toContain('Chittagong');
  });

  it('moves the active option with ArrowDown and commits it with Enter', () => {
    inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.value()).toBe('dhaka');
    expect(inputEl().value).toBe('Dhaka');
  });

  it('closes and reverts the query without committing on Escape', () => {
    inputEl().value = 'zzz-no-match';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(inputEl().getAttribute('aria-expanded')).toBe('false');
    expect(host.value()).toBe('');
  });

  it('shows a no-results message when nothing matches the query', () => {
    inputEl().value = 'zzz-no-match';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const empty = fixture.debugElement.query(By.css('.ums-combobox__empty'));
    expect(empty.nativeElement.textContent).toContain('No matching results');
  });

  it('selects an option on click', () => {
    inputEl().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    options()[1].click();
    fixture.detectChanges();
    expect(host.value()).toBe('chittagong');
  });
});
