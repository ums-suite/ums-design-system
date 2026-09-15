import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import { UmsToastService } from './toast.service';

/**
 * DSYS-15 Toast/Snackbar container -- mount exactly one `<ums-toast-container />` near an app's
 * root; every `UmsToastService.show()` call anywhere in the app renders here. `role="status"` +
 * `aria-live="polite"` announces each new toast without stealing focus (the same non-interruptive
 * pattern as UmsOfflineBannerComponent), appropriate for a transient confirmation rather than a
 * blocking dialog.
 */
@Component({
  selector: 'ums-toast-container',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-toast-container', role: 'status', 'aria-live': 'polite' },
})
export class UmsToastContainerComponent {
  protected readonly toastService = inject(UmsToastService);
}
