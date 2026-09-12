import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';

/**
 * DSYS-17 Offline/connectivity banner. Auto-detects connectivity via the `online`/`offline`
 * window events (mirroring ThemeService/MotionService's own "one platform-wide listener,
 * registered once" pattern) rather than requiring every consuming app to poll `navigator.onLine`
 * itself. `role="status"`/`aria-live="polite"` announces the change without stealing focus --
 * appropriate for a persistent, non-blocking banner rather than a modal interruption.
 */
@Component({
  selector: 'ums-offline-banner',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './offline-banner.component.html',
  styleUrl: './offline-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-offline-banner',
    '[class.ums-offline-banner--visible]': 'visible()',
    role: 'status',
    'aria-live': 'polite',
  },
})
export class UmsOfflineBannerComponent {
  private readonly document = inject(DOCUMENT);

  readonly message = input<string>('You are offline. Some features may be unavailable.');

  private readonly isOffline = signal(!(this.document.defaultView?.navigator.onLine ?? true));

  protected readonly visible = computed(() => this.isOffline());

  constructor() {
    const win = this.document.defaultView;
    win?.addEventListener('online', () => this.isOffline.set(false));
    win?.addEventListener('offline', () => this.isOffline.set(true));
  }
}
