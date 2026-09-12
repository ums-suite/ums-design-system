import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsStepperComponent } from './stepper.component';
import type { StepperStep } from './stepper.types';

@Component({
  standalone: true,
  imports: [UmsStepperComponent],
  template: `
    <ums-stepper
      [steps]="steps"
      [currentIndex]="currentIndex()"
      (stepClick)="clickedIndex = $event"
    />
  `,
})
class HostComponent {
  readonly steps: StepperStep[] = [
    { label: 'Personal details' },
    { label: 'Academic history' },
    { label: 'Payment' },
  ];
  readonly currentIndex = signal(1);
  clickedIndex: number | undefined;
}

describe('UmsStepperComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function steps() {
    return fixture.debugElement.queryAll(By.css('.ums-stepper__step'));
  }

  it('marks steps before currentIndex as complete and the currentIndex step as current', () => {
    expect(steps()[0].nativeElement.getAttribute('data-status')).toBe('complete');
    expect(steps()[1].nativeElement.getAttribute('data-status')).toBe('current');
    expect(steps()[2].nativeElement.getAttribute('data-status')).toBe('upcoming');
  });

  it('sets aria-current="step" only on the current step', () => {
    expect(steps()[1].query(By.css('[aria-current="step"]'))).toBeTruthy();
    expect(steps()[0].query(By.css('[aria-current="step"]'))).toBeNull();
  });

  it('renders a real, clickable button for a completed step, emitting stepClick', () => {
    const completedButton = steps()[0].query(By.css('button')).nativeElement as HTMLButtonElement;
    completedButton.click();
    expect(host.clickedIndex).toBe(0);
  });

  it('renders the current/upcoming steps as non-interactive spans, not buttons', () => {
    expect(steps()[1].query(By.css('button'))).toBeNull();
    expect(steps()[2].query(By.css('button'))).toBeNull();
  });
});
