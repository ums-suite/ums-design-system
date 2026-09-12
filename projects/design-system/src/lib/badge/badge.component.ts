import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { BadgeSize, BadgeVariant } from './badge.types';

/**
 * DSYS-11 Badge / Status Chip. A small solid-fill pill communicating status via color +
 * label text (requirement-spec.md §3: "semantic colors... kept visually distinct from both
 * brand colors so a status signal... is never mistaken for a brand accent"). Never color-only --
 * the projected label is always the real accessible name, consistent with WCAG's
 * "don't rely on color alone" guidance.
 */
@Component({
  selector: 'ums-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-badge',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class UmsBadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('md');
}
