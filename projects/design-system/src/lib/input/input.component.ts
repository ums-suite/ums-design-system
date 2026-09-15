import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { InputSize, InputType } from './input.types';

/**
 * DSYS-8 text/number input primitive. A native `<input>` is the actual interactive element (same
 * "accessible by construction" reasoning as UmsButtonComponent) -- keyboard editing, native number
 * spinners/validation, and IME composition all come for free from the platform.
 *
 * Two-way value binding follows this package's established signal-input/output convention (see
 * button.component.ts's class doc) rather than ControlValueAccessor, consistent with every other
 * component in this pass: `[value]`/`(valueChange)`, usable as `[(value)]` from a consuming app.
 *
 * Numeric input gets `font-feature-settings: var(--font-feature-numeric)` (tabular figures) per
 * requirement-spec.md §4, so a column of number inputs aligns the same way a Data Table's numeric
 * columns do (DSYS-12).
 */
@Component({
  selector: 'ums-input',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-input',
    '[attr.data-size]': 'size()',
    '[class.ums-input--invalid]': 'invalid()',
    '[class.ums-input--disabled]': 'disabled()',
  },
})
export class UmsInputComponent {
  readonly type = input<InputType>('text');
  readonly size = input<InputSize>('md');
  readonly value = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input<number | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly blurred = output();

  protected readonly showPassword = signal(false);
  protected readonly resolvedType = computed(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    this.blurred.emit();
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((shown) => !shown);
  }

  protected clear(): void {
    this.valueChange.emit('');
  }
}
