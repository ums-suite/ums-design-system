import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { UmsButtonComponent } from '../button/button.component';
import { UmsModalComponent } from '../modal/modal.component';
import { UmsTextareaComponent } from '../textarea/textarea.component';

let nextConfirmationDialogId = 0;

/**
 * DSYS-15 Confirmation dialog -- the destructive-action pattern named explicitly in
 * requirement-spec.md §6 ("Confirmation dialog... with required reason field"): a distinct,
 * named variant of Modal (not a separate component built from scratch -- it embeds
 * `<ums-modal>`), where the reason field is MANDATORY, not an optional nicety. The Confirm
 * button stays disabled until the reason has real (trimmed, non-empty) content, and the reason
 * is cleared whenever the dialog closes so a stale value never leaks into the next time it opens
 * -- detected synchronously in `ngAfterViewChecked` rather than an `effect()` watching `[open]`,
 * for the same reason UmsModalComponent's focus management avoids `effect()` (see its class doc):
 * an effect's flush timing relative to a test's next `fixture.detectChanges()` is not guaranteed.
 */
@Component({
  selector: 'ums-confirmation-dialog',
  standalone: true,
  imports: [UmsModalComponent, UmsTextareaComponent, UmsButtonComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-confirmation-dialog' },
})
export class UmsConfirmationDialogComponent implements AfterViewChecked {
  protected readonly reasonFieldId = `ums-confirmation-dialog-${++nextConfirmationDialogId}-reason`;
  private wasOpen = false;

  readonly open = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly reasonLabel = input<string>('Reason for this action');
  readonly reasonPlaceholder = input<string>('Explain why, for the audit log...');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');

  /** Emits the trimmed, required reason text once Confirm is activated. */
  readonly confirmed = output<string>();
  readonly cancelled = output();

  protected readonly reason = signal('');
  protected readonly canConfirm = computed(() => this.reason().trim().length > 0);

  ngAfterViewChecked(): void {
    const isOpen = this.open();
    if (!isOpen && this.wasOpen) {
      this.reason.set('');
    }
    this.wasOpen = isOpen;
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit(this.reason().trim());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
