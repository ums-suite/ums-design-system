import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { ComboboxOption } from './combobox.types';

let nextComboboxId = 0;

/**
 * DSYS-8 Combobox -- a filter-as-you-type single-select, implementing the WAI-ARIA 1.2
 * "combobox with list autocomplete" pattern by hand (no native HTML element covers this), per
 * requirement-spec.md §8's "every interactive component ships with documented keyboard
 * interaction and a passing automated a11y test."
 *
 * Keyboard: ArrowDown/ArrowUp move the active option (opening the listbox first if closed),
 * Home/End jump to the first/last visible option, Enter commits the active option, Escape closes
 * and reverts the typed query to the current selection's label, Tab/blur closes without
 * committing an uncommitted query. `(mousedown)` on the listbox is prevented so clicking an
 * option doesn't first fire the input's blur-close handler before the click lands.
 */
@Component({
  selector: 'ums-combobox',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-combobox',
    '[class.ums-combobox--invalid]': 'invalid()',
    '[class.ums-combobox--disabled]': 'disabled()',
  },
})
export class UmsComboboxComponent {
  private readonly instanceId = `ums-combobox-${++nextComboboxId}`;

  readonly options = input<readonly ComboboxOption[]>([]);
  readonly value = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly noResultsText = input<string>('No matching results');

  readonly valueChange = output<string>();

  protected readonly listboxId = `${this.instanceId}-listbox`;
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly filteredOptions = computed<readonly ComboboxOption[]>(() => {
    const needle = this.query().trim().toLowerCase();
    if (!needle) return this.options();
    return this.options().filter((option) => option.label.toLowerCase().includes(needle));
  });

  protected readonly activeOptionId = computed<string | undefined>(() => {
    const index = this.activeIndex();
    return index >= 0 && index < this.filteredOptions().length ? this.optionId(index) : undefined;
  });

  constructor() {
    // Keep the displayed query in sync with the currently selected value's label whenever the
    // consumer changes [value] externally (never while the user is actively typing/open).
    effect(() => {
      const currentValue = this.value();
      if (this.open()) return;
      const selected = this.options().find((option) => option.value === currentValue);
      this.query.set(selected?.label ?? '');
    });
  }

  protected optionId(index: number): string {
    return `${this.instanceId}-option-${index}`;
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activeIndex.set(0);
  }

  protected onFocus(): void {
    this.open.set(true);
  }

  protected onBlur(): void {
    this.closeAndRevert();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.filteredOptions().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
        }
        this.activeIndex.update((index) => (count === 0 ? -1 : Math.min(index + 1, count - 1)));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
        }
        this.activeIndex.update((index) => (count === 0 ? -1 : Math.max(index - 1, 0)));
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.activeIndex.set(0);
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.activeIndex.set(count - 1);
        }
        break;
      case 'Enter':
        if (this.open() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.selectOption(this.filteredOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.closeAndRevert();
        }
        break;
    }
  }

  protected selectOption(option: ComboboxOption): void {
    this.query.set(option.label);
    this.open.set(false);
    this.activeIndex.set(-1);
    this.valueChange.emit(option.value);
  }

  private closeAndRevert(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
    const selected = this.options().find((option) => option.value === this.value());
    this.query.set(selected?.label ?? '');
  }
}
