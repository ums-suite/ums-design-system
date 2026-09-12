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
} from '../date-picker/calendar.util';
import type { DateRange } from './date-range-picker.types';

let nextDateRangePickerId = 0;

/**
 * DSYS-9 Date-range picker -- shares `date-picker/calendar.util.ts`'s grid math and the same
 * WAI-ARIA "Date Picker Dialog"/roving-tabindex keyboard model as `UmsDatePickerComponent` (see
 * its class doc for the reasoning behind a custom calendar over native `<input type="date">`,
 * which has no range variant at all).
 *
 * Two-phase selection, the conventional range-picker interaction: the first day clicked becomes
 * the range start (clearing any previous end); the next click on a day on/after the start becomes
 * the end; a click before the current start restarts the range from that day instead. Days
 * between start and end (inclusive) get an "in range" highlight.
 */
@Component({
  selector: 'ums-date-range-picker',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-date-range-picker',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UmsDateRangePickerComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly instanceId = `ums-date-range-picker-${++nextDateRangePickerId}`;

  readonly start = input<string | null>(null);
  readonly end = input<string | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly placeholder = input<string>('Select a date range');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly label = input<string>('Choose date range');

  readonly rangeChange = output<DateRange>();

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
    const start = fromIsoDate(this.start());
    const end = fromIsoDate(this.end());
    if (!start) return '';
    const formatted = (date: Date): string =>
      `${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
    return end ? `${formatted(start)} - ${formatted(end)}` : formatted(start);
  });

  protected toggleOpen(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    const initial = fromIsoDate(this.start()) ?? this.today;
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

  protected isRangeStart(day: CalendarDay): boolean {
    return isSameDay(fromIsoDate(this.start()), day.date);
  }

  protected isRangeEnd(day: CalendarDay): boolean {
    return isSameDay(fromIsoDate(this.end()), day.date);
  }

  protected isInRange(day: CalendarDay): boolean {
    const start = fromIsoDate(this.start());
    const end = fromIsoDate(this.end());
    if (!start || !end) return false;
    return compareDays(day.date, start) > 0 && compareDays(day.date, end) < 0;
  }

  protected isFocused(day: CalendarDay): boolean {
    return day.iso === this.focusedIso();
  }

  protected selectDay(day: CalendarDay): void {
    if (this.isDisabledDay(day)) return;
    const start = fromIsoDate(this.start());
    const end = fromIsoDate(this.end());

    if (!start || end || compareDays(day.date, start) < 0) {
      // No range yet, a complete range already exists, or the click is before the current
      // start: begin a fresh range at this day.
      this.rangeChange.emit({ start: day.iso, end: null });
    } else {
      this.rangeChange.emit({ start: this.start(), end: day.iso });
      this.close();
    }
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
