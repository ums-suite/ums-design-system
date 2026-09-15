import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { AppShellNavItem, AppShellMode } from './app-shell.types';

/**
 * DSYS-13 App shell (requirement-spec.md §6): `mode="operational"` renders a top bar plus a
 * collapsible side nav (`ums-admin-web`/`ums-faculty-web`); `mode="public"` renders a top bar
 * plus a mega-menu (`ums-public-web`/`ums-admission-web`/`ums-alumni-web`). Page content itself is
 * always projected via the default `<ng-content>` -- this package never composes a real page
 * (requirement-spec.md §1 scope), only the reusable chrome around one.
 *
 * Keyboard: a mega-menu trigger is a native `<button>` (Enter/Space toggle for free); Escape
 * closes an open mega-menu panel from anywhere in the shell.
 */
@Component({
  selector: 'ums-app-shell',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-app-shell',
    '[attr.data-mode]': 'mode()',
    '(document:keydown.escape)': 'closeMegaMenu()',
  },
})
export class UmsAppShellComponent {
  readonly mode = input<AppShellMode>('operational');
  readonly navItems = input<readonly AppShellNavItem[]>([]);
  readonly collapsed = input<boolean>(false);

  readonly collapsedChange = output<boolean>();
  readonly navItemClick = output<AppShellNavItem>();

  protected readonly collapsedState = signal(this.collapsed());
  protected readonly openMegaMenu = signal<string | undefined>(undefined);

  protected toggleCollapsed(): void {
    this.collapsedState.update((collapsed) => !collapsed);
    this.collapsedChange.emit(this.collapsedState());
  }

  protected toggleMegaMenu(label: string): void {
    this.openMegaMenu.update((current) => (current === label ? undefined : label));
  }

  protected closeMegaMenu(): void {
    this.openMegaMenu.set(undefined);
  }

  protected onNavItemClick(event: Event, item: AppShellNavItem): void {
    event.preventDefault();
    this.closeMegaMenu();
    this.navItemClick.emit(item);
  }
}
