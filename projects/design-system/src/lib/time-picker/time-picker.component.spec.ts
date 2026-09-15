import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsTimePickerComponent } from './time-picker.component';

@Component({
  standalone: true,
  imports: [UmsTimePickerComponent],
  template: `<ums-time-picker [value]="value()" (valueChange)="value.set($event)" />`,
})
class HostComponent {
  readonly value = signal('09:00');
}

describe('UmsTimePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input[type="time"]'))
      .nativeElement as HTMLInputElement;
  }

  it('renders a native time input with the bound value', () => {
    expect(nativeInput().value).toBe('09:00');
  });

  it('emits valueChange when the native input changes', () => {
    nativeInput().value = '14:30';
    nativeInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value()).toBe('14:30');
  });
});

describe('UmsTimePickerComponent standalone label', () => {
  it('sets aria-label from the label input, for use without an associated <label for>', () => {
    TestBed.configureTestingModule({ imports: [UmsTimePickerComponent] });
    const fixture = TestBed.createComponent(UmsTimePickerComponent);
    fixture.componentRef.setInput('label', 'Preferred interview time');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Preferred interview time');
  });
});
