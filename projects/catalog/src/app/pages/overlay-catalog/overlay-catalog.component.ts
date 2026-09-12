import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  UmsButtonComponent,
  UmsConfirmationDialogComponent,
  UmsDrawerComponent,
  UmsModalComponent,
  UmsPopoverComponent,
  UmsToastService,
  UmsTooltipDirective,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-15 overlay family (Modal, Drawer, Toast,
 * Tooltip, Popover, Confirmation dialog). Every trigger here is a plain `<ums-button>` so the
 * catalog page itself never reimplements interaction logic the overlay components already own.
 *
 * Includes a long-form Bengali-title variant on the Modal (design-decisions.md "Locale-Safe
 * Component Sizing Verification") -- every text-bearing catalog entry gets this treatment.
 *
 * `UmsToastContainerComponent` is mounted once in `app.html` (near the app root, per its own
 * class doc), not here -- this page only triggers `UmsToastService.show()`.
 */
@Component({
  selector: 'app-overlay-catalog',
  standalone: true,
  imports: [
    UmsButtonComponent,
    UmsModalComponent,
    UmsDrawerComponent,
    UmsPopoverComponent,
    UmsConfirmationDialogComponent,
    UmsTooltipDirective,
  ],
  templateUrl: './overlay-catalog.component.html',
  styleUrl: './overlay-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayCatalogComponent {
  private readonly toastService = inject(UmsToastService);

  protected readonly modalOpen = signal(false);
  protected readonly bengaliModalOpen = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly confirmationOpen = signal(false);
  protected readonly lastConfirmedReason = signal<string | undefined>(undefined);

  protected readonly bengaliModalTitle = 'শিক্ষার্থী ভর্তি আবেদনপত্র পর্যালোচনা করুন';

  protected openModal(): void {
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected openBengaliModal(): void {
    this.bengaliModalOpen.set(true);
  }

  protected closeBengaliModal(): void {
    this.bengaliModalOpen.set(false);
  }

  protected openDrawer(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected openConfirmation(): void {
    this.confirmationOpen.set(true);
  }

  protected onConfirmed(reason: string): void {
    this.lastConfirmedReason.set(reason);
    this.confirmationOpen.set(false);
  }

  protected onCancelled(): void {
    this.confirmationOpen.set(false);
  }

  protected showToast(): void {
    this.toastService.show('Application saved as a draft.', { variant: 'success' });
  }

  protected showActionToast(): void {
    this.toastService.show('Application submitted.', {
      variant: 'info',
      actionLabel: 'Undo',
      onAction: () => this.toastService.show('Submission undone.', { variant: 'neutral' }),
    });
  }
}
