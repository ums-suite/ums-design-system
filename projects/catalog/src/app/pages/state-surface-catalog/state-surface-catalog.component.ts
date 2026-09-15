import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UmsEmptyStateComponent,
  UmsErrorStateComponent,
  UmsOfflineBannerComponent,
  UmsSkeletonComponent,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-17 state-surface family (Skeleton,
 * EmptyState, ErrorState, OfflineBanner). Includes a long-form Bengali variant on EmptyState's
 * title (design-decisions.md "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-state-surface-catalog',
  standalone: true,
  imports: [
    UmsSkeletonComponent,
    UmsEmptyStateComponent,
    UmsErrorStateComponent,
    UmsOfflineBannerComponent,
  ],
  templateUrl: './state-surface-catalog.component.html',
  styleUrl: './state-surface-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateSurfaceCatalogComponent {
  protected readonly retryCount = signal(0);

  protected readonly bengaliEmptyTitle = 'এখনও কোনো ভর্তি আবেদন জমা পড়েনি';

  protected onRetry(): void {
    this.retryCount.update((count) => count + 1);
  }
}
