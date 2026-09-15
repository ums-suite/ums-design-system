import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { SkeletonVariant } from './skeleton.types';

/**
 * DSYS-17 Skeleton loader (requirement-spec.md §6: "matching real content dimensions"). Purely
 * decorative (`aria-hidden="true"`) -- the surrounding loading region is responsible for its own
 * `role="status"`/live-region announcement (see EmptyState/ErrorState's own usage, and the
 * catalog page's loading-region wrapper), since a Skeleton by itself carries no content to name.
 *
 * `variant="text"` renders `lines` separate bars (the last one narrower, to read as a natural
 * paragraph end) sized from the caller's own `width`/`height`, rather than a single block, so a
 * paragraph-shaped loading state actually matches a paragraph's real dimensions.
 */
@Component({
  selector: 'ums-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-skeleton',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-hidden]': "'true'",
    '[style.inline-size]': "variant() === 'text' ? null : width()",
    '[style.block-size]': "variant() === 'text' ? null : height()",
  },
})
export class UmsSkeletonComponent {
  readonly variant = input<SkeletonVariant>('text');
  readonly width = input<string>('100%');
  readonly height = input<string>('16px');
  readonly lines = input<number>(1);

  protected readonly lineIndexes = computed(() =>
    Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i),
  );

  protected lineWidth(index: number): string {
    const isLast = index === this.lineIndexes().length - 1;
    return isLast && this.lineIndexes().length > 1 ? '60%' : this.width();
  }
}
