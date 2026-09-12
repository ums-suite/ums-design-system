import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  viewChild,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import { focusPanel, trapTabKey } from '../overlay/focus-trap.util';
import type { ModalSize } from './modal.types';

let nextModalId = 0;

/**
 * DSYS-15 Modal/Dialog (requirement-spec.md §6, named among the ARIA-verified components in
 * §8). Controlled component: `[open]` in, `(closed)` out on every dismissal request (Escape,
 * backdrop click, the close button) -- the consumer decides whether to actually set `open` back
 * to `false`, the same pattern as ThemeService's mode/AppShell's collapsed.
 *
 * Focus management (shared with Drawer/Confirmation dialog via overlay/focus-trap.util.ts):
 * opening moves focus into the panel and traps Tab inside it; closing restores focus to
 * whatever had it before the modal opened. Deliberately NOT implemented via `effect()` --
 * ThemeService's own class doc already flags why: "an effect() is scheduled by Angular's
 * reactivity graph and may not have flushed by the time a caller (or a test) next inspects the
 * DOM," a correctness risk for something as immediately focus-sensitive as this. Opening is
 * detected synchronously in `ngAfterViewChecked` (part of the same change-detection pass as the
 * triggering `[open]` binding update); closing restores focus synchronously inside whichever
 * handler (Escape/backdrop/close button) actually requests the close, before `closed` is even
 * emitted.
 */
@Component({
  selector: 'ums-modal',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-modal',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class UmsModalComponent implements AfterViewChecked {
  private readonly instanceId = `ums-modal-${++nextModalId}`;
  private previouslyFocused: HTMLElement | null = null;
  private wasOpen = false;

  readonly open = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
  readonly size = input<ModalSize>('md');
  readonly closeOnBackdropClick = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  /** Emitted for every dismissal request; the consumer decides whether to actually close. */
  readonly closed = output();

  protected readonly titleId = `${this.instanceId}-title`;
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  ngAfterViewChecked(): void {
    const isOpen = this.open();
    if (isOpen && !this.wasOpen) {
      const panel = this.panelRef()?.nativeElement;
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      if (panel) focusPanel(panel);
    }
    this.wasOpen = isOpen;
  }

  protected onEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.requestClose();
    }
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.requestClose();
    }
  }

  protected onCloseButtonClick(): void {
    this.requestClose();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const panel = this.panelRef()?.nativeElement;
    if (panel) trapTabKey(panel, event);
  }

  private requestClose(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
    this.closed.emit();
  }
}
