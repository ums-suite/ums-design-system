import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { TabBarItem } from './tab-bar.types';

let nextTabBarId = 0;

/**
 * DSYS-13 Tab bar -- the WAI-ARIA "tabs (automatic activation)" pattern: a `role="tablist"` of
 * native `<button role="tab">`s with a roving tabindex (only the selected tab is in the Tab
 * order; ArrowLeft/ArrowRight/Home/End move focus AND selection together, per the APG's
 * automatic-activation variant, appropriate here since switching tabs is a cheap, non-destructive
 * action). This component owns the tablist only -- the tabpanel(s) it controls are the
 * consumer's own content, wired via the public `tabId()`/`panelId()` helpers (`exportAs`).
 */
@Component({
  selector: 'ums-tab-bar',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'umsTabBar',
  host: { class: 'ums-tab-bar' },
})
export class UmsTabBarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly instanceId = `ums-tab-bar-${++nextTabBarId}`;

  readonly items = input<readonly TabBarItem[]>([]);
  readonly selectedIndex = input<number>(0);

  readonly selectedIndexChange = output<number>();

  tabId(index: number): string {
    return `${this.instanceId}-tab-${index}`;
  }

  panelId(index: number): string {
    return `${this.instanceId}-panel-${index}`;
  }

  protected select(index: number): void {
    if (this.items()[index]?.disabled) return;
    this.selectedIndexChange.emit(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.items().length;
    let nextIndex: number | undefined;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = this.nextEnabledIndex(index, 1);
        break;
      case 'ArrowLeft':
        nextIndex = this.nextEnabledIndex(index, -1);
        break;
      case 'Home':
        nextIndex = this.nextEnabledIndex(-1, 1);
        break;
      case 'End':
        nextIndex = this.nextEnabledIndex(count, -1);
        break;
      default:
        return;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    this.select(nextIndex);
    this.document.getElementById(this.tabId(nextIndex))?.focus();
  }

  private nextEnabledIndex(from: number, direction: 1 | -1): number | undefined {
    const count = this.items().length;
    if (count === 0) return undefined;
    for (let step = 1; step <= count; step++) {
      const candidate = (from + direction * step + count) % count;
      if (!this.items()[candidate]?.disabled) return candidate;
    }
    return undefined;
  }
}
