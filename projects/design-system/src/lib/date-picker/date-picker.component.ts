import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  addDays,
  addMonths,
  buildMonthMatrix,
  compareDays,
  fromIsoDate,
  isSameDay,
  toIsoDate,
  type CalendarDay,
} from './calendar.util';

let nextDatePickerId = 0;

/**
 * DSYS-9 Date picker (requirement-spec.md §6; §8 names the date picker among the ARIA-verified
 * components). A custom calendar popover, not native `<input type="date">`: the native control's
 * browser-supplied chrome can't be themed to this package's tokens (a hard requirement given
 * principle #2's "gorgeous, distinctive" mandate, the same reasoning that already rejected a
 * generic default icon look, requirement-spec.md §10 item 2) and has no path to a range variant
 * (`UmsDateRangePickerComponent` shares this component's `calendar.util.ts` grid math).
 *
 * Implements the WAI-ARIA "Date Picker Dialog" pattern: a non-modal `role="dialog"` panel
 * containing a `role="grid"` month table with roving-tabindex day cells. Arrow keys move the
 * focused day (Left/Right +-1 day, Up/Down +-1 week, Home/End to the visible week's start/end,
 * PageUp/PageDown +-1 month); Enter/Space selects the focused day. Opening the panel, and
 * crossing a month boundary via the keyboard, both re-render the grid before the newly-focused
 * day's button exists in the DOM, so the follow-up `.focus()` call runs inside `afterNextRender`
 * rather than a bare `queueMicrotask` -- a microtask scheduled from inside an event handler can
 * run before Angular's own change-detection flush actually creates the new DOM nodes, a race
 * `afterNextRender` (which runs only once the next render has actually committed) doesn't have.
 */
@Component({
  selector: 'ums-date-picker',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-date-picker',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UmsDatePickerComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly instanceId = `ums-date-picker-${++nextDatePickerId}`;

  readonly value = input<string | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly placeholder = input<string>('Select a date');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly id = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly label = input<string>('Choose date');

  readonly valueChange = output<string | null>();

  protected readonly open = signal(false);
  protected readonly gridId = `${this.instanceId}-grid`;

  private readonly today = new Date();
  protected readonly viewDate = signal<Date>(this.today);
  protected readonly focusedIso = signal<string>(toIsoDate(this.today));

  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly monthLabel = computed(
    () => `${MONTH_LABELS[this.viewDate().getMonth()]} ${this.viewDate().getFullYear()}`,
  );

  protected readonly weeks = computed<readonly (readonly CalendarDay[])[]>(() =>
    buildMonthMatrix(this.viewDate().getFullYear(), this.viewDate().getMonth()),
  );

  protected readonly displayValue = computed<string>(() => {
    const date = fromIsoDate(this.value());
    if (!date) return '';
    return `${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
  });

  protected toggleOpen(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    const initial = fromIsoDate(this.value()) ?? this.today;
    this.viewDate.set(new Date(initial.getFullYear(), initial.getMonth(), 1));
    this.focusedIso.set(toIsoDate(initial));
    this.open.set(true);
    afterNextRender(() => this.focusDay(this.focusedIso()), { injector: this.injector });
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  protected goToPreviousMonth(): void {
    this.viewDate.update((date) => addMonths(date, -1));
  }

  protected goToNextMonth(): void {
    this.viewDate.update((date) => addMonths(date, 1));
  }

  protected isDisabledDay(day: CalendarDay): boolean {
    const min = fromIsoDate(this.min());
    const max = fromIsoDate(this.max());
    if (min && compareDays(day.date, min) < 0) return true;
    if (max && compareDays(day.date, max) > 0) return true;
    return false;
  }

  protected isSelected(day: CalendarDay): boolean {
    return isSameDay(fromIsoDate(this.value()), day.date);
  }

  protected isFocused(day: CalendarDay): boolean {
    return day.iso === this.focusedIso();
  }

  protected selectDay(day: CalendarDay): void {
    if (this.isDisabledDay(day)) return;
    this.valueChange.emit(day.iso);
    this.close();
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const current = fromIsoDate(this.focusedIso()) ?? this.today;
    let next: Date | undefined;

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, -1);
        break;
      case 'ArrowRight':
        next = addDays(current, 1);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'Home':
        next = addDays(current, -current.getDay());
        break;
      case 'End':
        next = addDays(current, 6 - current.getDay());
        break;
      case 'PageUp':
        next = addMonths(current, -1);
        break;
      case 'PageDown':
        next = addMonths(current, 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const day = this.weeks()
          .flat()
          .find((candidate) => candidate.iso === this.focusedIso());
        if (day) this.selectDay(day);
        return;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        return;
      default:
        return;
    }

    event.preventDefault();
    this.focusedIso.set(toIsoDate(next));
    if (
      next.getMonth() !== this.viewDate().getMonth() ||
      next.getFullYear() !== this.viewDate().getFullYear()
    ) {
      this.viewDate.set(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    afterNextRender(() => this.focusDay(this.focusedIso()), { injector: this.injector });
  }

  private focusDay(iso: string): void {
    const button = this.elementRef.nativeElement.querySelector<HTMLElement>(`[data-iso="${iso}"]`);
    button?.focus();
  }
}
