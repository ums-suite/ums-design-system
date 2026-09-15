import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

let nextOtpInputId = 0;

/**
 * DSYS-9 OTP input (requirement-spec.md §6). A row of single-digit `<input>` boxes rather than
 * one plain text input: auto-advances focus to the next box as each digit is typed, moves
 * backward on Backspace in an empty box, supports Left/Right arrow-key navigation between boxes,
 * and splits a full pasted code across every box at once (a code delivered via SMS autofill or
 * copy-paste is the overwhelmingly common real-world entry path, not digit-by-digit typing).
 *
 * `value` is always exactly `length()` characters internally, using `' '` (space) as the
 * placeholder for an unfilled box -- never a shorter, "compact" string -- so clearing a *middle*
 * box (e.g. the user arrow-lefts back into an already-filled sequence and fixes one digit) can
 * never shift every later digit down by one position when the per-box characters are rejoined.
 * `(valueChange)` emits this full-length, space-padded string on every change (a consuming
 * form-field wrapper only needs it for live inline-validation state, not to display directly);
 * `(completed)` emits the clean, digit-only string, and only once every box actually holds a
 * real digit.
 */
@Component({
  selector: 'ums-otp-input',
  standalone: true,
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-otp-input' },
})
export class UmsOtpInputComponent {
  private readonly instanceId = `ums-otp-input-${++nextOtpInputId}`;
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  readonly length = input<number>(6);
  readonly value = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly label = input<string>('One-time passcode');

  readonly valueChange = output<string>();
  readonly completed = output<string>();

  protected readonly boxIndexes = computed<readonly number[]>(() =>
    Array.from({ length: this.length() }, (_, i) => i),
  );

  /** The character actually typed at `index`, or `''` for an unfilled/placeholder box. */
  protected digitAt(index: number): string {
    const raw = this.charAt(index);
    return raw === ' ' ? '' : raw;
  }

  protected boxId(index: number): string {
    return `${this.instanceId}-${index}`;
  }

  protected onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');

    if (raw.length > 1) {
      // A full/partial code landed in one box (mobile SMS autofill often does this even without
      // a real "paste" event) -- distribute it starting at this box.
      this.applyPaste(index, raw);
      return;
    }

    const chars = this.currentChars();
    chars[index] = raw || ' ';
    this.emit(chars);

    if (raw && index < this.length() - 1) {
      this.focusBox(index + 1);
    }
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digitAt(index) && index > 0) {
      event.preventDefault();
      const chars = this.currentChars();
      chars[index - 1] = ' ';
      this.emit(chars);
      this.focusBox(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusBox(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.focusBox(index + 1);
    }
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!pasted) return;
    event.preventDefault();
    this.applyPaste(index, pasted.replace(/\D/g, ''));
  }

  private applyPaste(startIndex: number, digits: string): void {
    const chars = this.currentChars();
    let cursor = startIndex;
    for (const digit of digits) {
      if (cursor >= this.length()) break;
      chars[cursor] = digit;
      cursor++;
    }
    this.emit(chars);
    this.focusBox(Math.min(cursor, this.length() - 1));
  }

  /** The current value as a mutable, always-`length()`-long array of single characters/spaces. */
  private currentChars(): string[] {
    return Array.from({ length: this.length() }, (_, i) => this.charAt(i));
  }

  private charAt(index: number): string {
    return this.value()[index] ?? ' ';
  }

  private emit(chars: readonly string[]): void {
    const next = chars.join('');
    this.valueChange.emit(next);
    if (!next.includes(' ')) {
      this.completed.emit(next);
    }
  }

  private focusBox(index: number): void {
    queueMicrotask(() => {
      const box = this.elementRef.nativeElement.querySelector<HTMLInputElement>(
        `[data-index="${index}"]`,
      );
      box?.focus();
      box?.select();
    });
  }
}
