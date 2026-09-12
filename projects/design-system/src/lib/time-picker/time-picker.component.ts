import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/**
 * DSYS-9 Time picker (requirement-spec.md §6). Unlike `UmsDatePickerComponent`/
 * `UmsDateRangePickerComponent` (which build a custom calendar because native `<input
 * type="date">`'s browser-chrome UI can't be themed and has no range variant), a time picker's
 * native affordance (`<input type="time">`) is a single-purpose, well-understood control across
 * every evergreen browser, ships full keyboard operability and OS-native accessibility for free,
 * and is easy to theme at the *field* level (border, radius, focus ring) even though its internal
 * spinner UI isn't ours to skin -- the same "wrap a native element thinly" posture
 * `UmsSelectComponent` already takes for `<select>`. Building a bespoke scroll-wheel time picker
 * for this pass would trade that free accessibility for marginal visual control this component
 * family doesn't need as urgently as the Date picker's calendar does.
 *
 * Value is a 24-hour `HH:mm` string (the native element's own `value` format), never a `Date`,
 * consistent with the Date pickers' plain-ISO-string boundary.
 */
@Component({
  selector: 'ums-time-picker',
  standalone: true,
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-time-picker',
    '[class.ums-time-picker--invalid]': 'invalid()',
    '[class.ums-time-picker--disabled]': 'disabled()',
  },
})
export class UmsTimePickerComponent {
  readonly value = input<string>('');
  readonly min = input<string | undefined>(undefined);
  readonly max = input<string | undefined>(undefined);
  readonly step = input<number | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  /**
   * A fallback accessible name for standalone use (no associated `<label for>`, e.g. via
   * `UmsFormFieldComponent`) -- native `<input type="time">` has no meaningful `placeholder`
   * fallback the way a text input does, so this is the only way to give it one directly.
   */
  readonly label = input<string | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly blurred = output();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    this.blurred.emit();
  }
}
