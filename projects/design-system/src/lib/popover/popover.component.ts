import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { focusPanel } from '../overlay/focus-trap.util';

let nextPopoverId = 0;

/**
 * DSYS-15 Popover -- click-triggered rich content anchored to its own trigger slot, unlike
 * Tooltip's hover-only plain text. Closes on an outside click or Escape and restores focus to
 * the trigger, the same restore-focus discipline as Modal/Drawer, but does not fully trap Tab
 * (a popover is a lightweight, non-modal disclosure -- WAI-ARIA's "disclosure" pattern, not a
 * dialog -- so a Tab press is allowed to move focus back out to the rest of the page, which
 * closes the popover via the outside-interaction check on the next focus change).
 */
@Component({
  selector: 'ums-popover',
  standalone: true,
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-popover',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class UmsPopoverComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly instanceId = `ums-popover-${++nextPopoverId}`;
  private previouslyFocused: HTMLElement | null = null;

  readonly label = input<string | undefined>(undefined);

  protected readonly open = signal(false);
  protected readonly panelId = `${this.instanceId}-panel`;

  protected toggle(): void {
    this.open.update((open) => !open);
    if (this.open()) {
      this.previouslyFocused = this.document.activeElement as HTMLElement | null;
      queueMicrotask(() => {
        const panel =
          this.elementRef.nativeElement.querySelector<HTMLElement>('.ums-popover__panel');
        if (panel) focusPanel(panel);
      });
    }
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }

  protected onEscape(): void {
    this.close();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
