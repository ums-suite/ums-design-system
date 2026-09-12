import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsAvatarComponent } from '../avatar/avatar.component';
import { UmsIconComponent } from '../icon/icon.component';
import type { CardTrend, CardVariant } from './card.types';

/**
 * DSYS-11 Card. `variant="content"` is a generic elevated surface projecting arbitrary content
 * (optionally under a `title`/`subtitle` header); `variant="stat"` renders a fixed KPI-tile
 * layout (label/value/trend) and `variant="profile"` renders a fixed avatar/name/role layout --
 * both driven by explicit inputs rather than projection, since their shape is specified, not
 * freeform (requirement-spec.md §6).
 */
@Component({
  selector: 'ums-card',
  standalone: true,
  imports: [UmsAvatarComponent, UmsIconComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-card',
    '[attr.data-variant]': 'variant()',
  },
})
export class UmsCardComponent {
  readonly variant = input<CardVariant>('content');

  // variant="content"
  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);

  // variant="stat"
  readonly statLabel = input<string | undefined>(undefined);
  readonly statValue = input<string | undefined>(undefined);
  readonly statDelta = input<string | undefined>(undefined);
  readonly statTrend = input<CardTrend | undefined>(undefined);

  // variant="profile"
  readonly profileName = input<string | undefined>(undefined);
  readonly profileRole = input<string | undefined>(undefined);
  readonly profileImageUrl = input<string | undefined>(undefined);

  protected readonly trendIcon: Record<CardTrend, 'caret-up' | 'caret-down' | 'minus'> = {
    up: 'caret-up',
    down: 'caret-down',
    flat: 'minus',
  };
}
