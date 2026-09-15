import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { StepperStep, StepStatus } from './stepper.types';

/**
 * DSYS-13 Stepper (admission wizard, onboarding progress -- requirement-spec.md §6; named among
 * the ARIA-verified components in §8). Marked up as an `<ol>` (a real ordered sequence): the
 * current step gets `aria-current="step"`; a completed step's marker is a real `<button>` so a
 * user can navigate back to it (a routine wizard affordance), while the current/upcoming steps
 * are non-interactive `<span>`s -- a wizard does not let a user skip ahead to a step they have
 * not reached yet.
 */
@Component({
  selector: 'ums-stepper',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-stepper' },
})
export class UmsStepperComponent {
  readonly steps = input<readonly StepperStep[]>([]);
  readonly currentIndex = input<number>(0);

  /** Emitted only when a completed step's marker is activated (never for current/upcoming). */
  readonly stepClick = output<number>();

  protected statusOf(index: number): StepStatus {
    if (index < this.currentIndex()) return 'complete';
    if (index === this.currentIndex()) return 'current';
    return 'upcoming';
  }
}
