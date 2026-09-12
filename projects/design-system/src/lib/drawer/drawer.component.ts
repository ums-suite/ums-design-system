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
import type { DrawerPosition } from './drawer.types';

let nextDrawerId = 0;

/**
 * DSYS-15 Drawer/side-sheet -- same controlled-component and focus-management contract as
 * UmsModalComponent (see its class doc, including why this deliberately does NOT use `effect()`
 * for focus management), sliding in from a logical edge (`start`/`end`, never hardcoded
 * left/right, per the RTL-readiness posture) instead of Modal's centered panel.
 */
@Component({
  selector: 'ums-drawer',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-drawer',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class UmsDrawerComponent implements AfterViewChecked {
  private readonly instanceId = `ums-drawer-${++nextDrawerId}`;
  private previouslyFocused: HTMLElement | null = null;
  private wasOpen = false;

  readonly open = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
  readonly position = input<DrawerPosition>('end');
  readonly closeOnBackdropClick = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

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
