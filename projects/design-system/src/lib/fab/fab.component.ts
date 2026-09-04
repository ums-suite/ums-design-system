import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsIconComponent, type IconName, type IconWeight } from '../icon/icon.component';
import type { ButtonType } from '../button/button.types';

export type FabVariant = 'primary' | 'secondary';
export type FabSize = 'md' | 'lg';

/**
 * DSYS-7 FAB (Floating Action Button). Circular (`--radius-circle`), elevated
 * (`--shadow-2`, `--shadow-3` on hover) -- the visually heaviest member of the Button family, per
 * requirement-spec.md §6's Actions row. Icon-only by default (`label` required, same reasoning
 * as Icon Button); the "extended" FAB pattern (icon + visible text) is supported via
 * `extendedLabel` for the cases design commonly wants a labelled FAB (e.g. a prominent "New
 * Application" action) -- when set, `label` still supplies the aria-label fallback text but the
 * button also renders the visible text and stops being icon-only for the accessible-name
 * computation (the visible text wins, per how browsers compute the accessible name of a button
 * with both content and aria-label -- aria-label still takes precedence, which is fine since we
 * set it to the same text).
 */
@Component({
  selector: 'ums-fab',
  standalone: true,
  imports: [UmsIconComponent],
  template: `
    <button
      class="ums-fab__native"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="label()"
    >
      <ums-icon [name]="icon()" [weight]="weight()" [size]="size() === 'lg' ? 28 : 24" decorative />
      @if (extendedLabel()) {
        <span class="ums-fab__label">{{ extendedLabel() }}</span>
      }
    </button>
  `,
  styleUrl: './fab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-fab',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[class.ums-fab--extended]': '!!extendedLabel()',
  },
})
export class UmsFabComponent {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly extendedLabel = input<string | undefined>(undefined);
  readonly variant = input<FabVariant>('primary');
  readonly size = input<FabSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly weight = input<IconWeight>('regular');
}
