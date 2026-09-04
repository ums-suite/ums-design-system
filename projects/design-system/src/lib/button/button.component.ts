import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsIconComponent, type IconName, type IconWeight } from '../icon/icon.component';
import type { ButtonSize, ButtonType, ButtonVariant, IconPosition } from './button.types';

/**
 * DSYS-7 -- the component-tree's own hub (tickets.md "Notes for Sprint Planner Agent": every
 * composite/interactive component from DSYS-8 onward embeds or triggers a Button).
 *
 * A native <button> is the actual interactive element inside this component's template (not the
 * host), so keyboard operability (Space/Enter activation, Tab focus order, native `disabled`
 * blocking both pointer and keyboard activation) comes for free from the platform rather than
 * being reimplemented -- consistent with requirement-spec.md §8 "accessible by construction, not
 * by audit." A `(click)` binding on `<ums-button>` in a consuming template keeps working because
 * the native click bubbles from the inner <button> up through the host element.
 *
 * Every visual value below is a token (`var(--...)`) resolved in button.component.scss --
 * nothing hardcoded, so a future palette/spacing change is a token-file change, never a
 * component edit (requirement-spec.md §6, "Component tokens... always resolve to the semantic
 * tokens... rather than a hardcoded value").
 */
@Component({
  selector: 'ums-button',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[class.ums-button--full-width]': 'fullWidth()',
  },
})
export class UmsButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  /** Optional leading/trailing icon -- this is the spec's "icon" button variant, not a separate component. */
  readonly icon = input<IconName | undefined>(undefined);
  readonly iconPosition = input<IconPosition>('leading');
  readonly iconWeight = input<IconWeight>('regular');

  protected get isDisabled(): boolean {
    return this.disabled() || this.loading();
  }
}
