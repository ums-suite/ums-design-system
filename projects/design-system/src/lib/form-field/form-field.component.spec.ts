import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsFormFieldComponent } from './form-field.component';

@Component({
  standalone: true,
  imports: [UmsFormFieldComponent],
  template: `
    <ums-form-field
      #field="umsFormField"
      [label]="label()"
      [hint]="hint()"
      [errors]="errors()"
      [required]="required()"
    >
      <input [id]="field.controlId()" [attr.aria-describedby]="field.describedBy()" />
    </ums-form-field>
  `,
})
class HostComponent {
  readonly label = signal('Email address');
  readonly hint = signal<string | undefined>('We will never share this.');
  readonly errors = signal<readonly string[]>([]);
  readonly required = signal(false);
}

describe('UmsFormFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  function label(): HTMLLabelElement {
    return fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;
  }

  it('links the label to the projected control via matching for/id', () => {
    expect(label().getAttribute('for')).toBe(input().id);
  });

  it('shows the required asterisk when [required]', () => {
    host.required.set(true);
    fixture.detectChanges();
    expect(label().textContent).toContain('*');
  });

  it('describes the control with the hint id when there are no errors', () => {
    expect(input().getAttribute('aria-describedby')).toContain('-hint');
    expect(
      fixture.debugElement.query(By.css('.ums-form-field__hint')).nativeElement.textContent,
    ).toContain('We will never share this.');
  });

  it('switches to the error list, in an alert role, once errors are present', () => {
    host.errors.set(['Email is required.', 'Must be a valid email address.']);
    fixture.detectChanges();

    const describedBy = input().getAttribute('aria-describedby');
    expect(describedBy).toContain('-error');

    const errorList = fixture.debugElement.query(By.css('.ums-form-field__errors'));
    expect(errorList.nativeElement.closest('[role="alert"]')).toBeTruthy();
    expect(errorList.nativeElement.textContent).toContain('Email is required.');
    expect(errorList.nativeElement.textContent).toContain('Must be a valid email address.');
    expect(fixture.debugElement.query(By.css('.ums-form-field__hint'))).toBeNull();
  });
});
