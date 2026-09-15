import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsTextareaComponent } from './textarea.component';

@Component({
  standalone: true,
  imports: [UmsTextareaComponent],
  template: `
    <ums-textarea [value]="value()" [maxLength]="maxLength()" (valueChange)="value.set($event)" />
  `,
})
class HostComponent {
  readonly value = signal('');
  readonly maxLength = signal<number | undefined>(undefined);
}

describe('UmsTextareaComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeTextarea(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
  }

  it('renders the bound value', () => {
    host.value.set('hello world');
    fixture.detectChanges();
    expect(nativeTextarea().value).toBe('hello world');
  });

  it('emits valueChange on input', () => {
    nativeTextarea().value = 'typed text';
    nativeTextarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value()).toBe('typed text');
  });

  it('shows a live character counter once maxLength is set', () => {
    host.maxLength.set(280);
    host.value.set('abc');
    fixture.detectChanges();
    const counter = fixture.debugElement.query(By.css('.ums-textarea__count'));
    expect(counter.nativeElement.textContent).toContain('3 / 280');
  });
});
