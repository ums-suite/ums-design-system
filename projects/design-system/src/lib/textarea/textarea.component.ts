import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/** DSYS-8 multiline text input primitive (requirement-spec.md §6 "...textarea input"). */
@Component({
  selector: 'ums-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-textarea',
    '[class.ums-textarea--invalid]': 'invalid()',
    '[class.ums-textarea--disabled]': 'disabled()',
  },
})
export class UmsTextareaComponent {
  readonly value = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly rows = input<number>(4);
  readonly maxLength = input<number | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly blurred = output();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }

  protected onBlur(): void {
    this.blurred.emit();
  }
}
