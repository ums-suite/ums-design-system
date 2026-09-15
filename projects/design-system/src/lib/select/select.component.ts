import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { SelectOption } from './select.types';

/**
 * DSYS-8 Select primitive. A native `<select>` is the actual interactive element -- keyboard
 * operability (arrow keys, type-ahead, native OS-rendered options popup) and screen-reader
 * behaviour come for free from the platform, the same "accessible by construction" reasoning as
 * UmsButtonComponent/UmsInputComponent. The chevron icon is purely decorative styling layered on
 * top; it never intercepts interaction.
 */
@Component({
  selector: 'ums-select',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-select',
    '[class.ums-select--invalid]': 'invalid()',
    '[class.ums-select--disabled]': 'disabled()',
  },
})
export class UmsSelectComponent {
  readonly options = input<readonly SelectOption[]>([]);
  readonly value = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);

  readonly valueChange = output<string>();

  protected onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
