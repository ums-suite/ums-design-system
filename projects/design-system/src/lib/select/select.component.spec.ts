import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsSelectComponent } from './select.component';
import type { SelectOption } from './select.types';

@Component({
  standalone: true,
  imports: [UmsSelectComponent],
  template: `
    <ums-select
      [options]="options"
      [value]="value()"
      [placeholder]="'Choose a department'"
      (valueChange)="value.set($event)"
    />
  `,
})
class HostComponent {
  readonly options: SelectOption[] = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'eee', label: 'Electrical & Electronic Engineering' },
    { value: 'closed', label: 'Discontinued Program', disabled: true },
  ];
  readonly value = signal('');
}

describe('UmsSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeSelect(): HTMLSelectElement {
    return fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
  }

  it('renders every option plus a disabled placeholder', () => {
    const options = fixture.debugElement.queryAll(By.css('option'));
    expect(options.length).toBe(4);
    expect(options[0].nativeElement.textContent).toContain('Choose a department');
    expect(options[0].nativeElement.disabled).toBeTrue();
  });

  it('emits valueChange when the native select changes', () => {
    nativeSelect().value = 'eee';
    nativeSelect().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.value()).toBe('eee');
  });

  it('marks a disabled option as disabled', () => {
    const disabledOption = fixture.debugElement.queryAll(By.css('option'))[3]
      .nativeElement as HTMLOptionElement;
    expect(disabledOption.disabled).toBeTrue();
  });
});
