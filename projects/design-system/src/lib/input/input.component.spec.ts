import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsInputComponent } from './input.component';
import type { InputType } from './input.types';

@Component({
  standalone: true,
  imports: [UmsInputComponent],
  template: `
    <ums-input
      [type]="type()"
      [value]="value()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [clearable]="clearable()"
      (valueChange)="value.set($event)"
    />
  `,
})
class HostComponent {
  readonly type = signal<InputType>('text');
  readonly value = signal('');
  readonly disabled = signal(false);
  readonly invalid = signal(false);
  readonly clearable = signal(false);
}

describe('UmsInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  it('renders a native text input by default', () => {
    expect(nativeInput().type).toBe('text');
  });

  it('emits valueChange on input and reflects it back into [value]', () => {
    nativeInput().value = 'hello';
    nativeInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value()).toBe('hello');
    expect(nativeInput().value).toBe('hello');
  });

  it('applies tabular-numeral styling for type="number"', () => {
    host.type.set('number');
    fixture.detectChanges();
    expect(nativeInput().type).toBe('number');
    expect(nativeInput().classList).toContain('ums-input__native--numeric');
  });

  it('disables the native input when [disabled]', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(nativeInput().disabled).toBeTrue();
  });

  it('sets aria-invalid when [invalid]', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(nativeInput().getAttribute('aria-invalid')).toBe('true');
  });

  it('toggles a password field between hidden and visible text via the eye button', () => {
    host.type.set('password');
    fixture.detectChanges();
    expect(nativeInput().type).toBe('password');

    const toggle = fixture.debugElement.query(By.css('.ums-input__action'))
      .nativeElement as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(nativeInput().type).toBe('text');
  });

  it('shows a clear button once clearable and non-empty, and clears the value on click', () => {
    host.clearable.set(true);
    host.value.set('some text');
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.ums-input__action'))
      .nativeElement as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();
    expect(host.value()).toBe('');
  });
});
