import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsIconComponent, type IconName, type IconWeight } from '../icon/icon.component';
import type { ButtonSize, ButtonType, ButtonVariant } from '../button/button.types';

/**
 * DSYS-7 Icon Button. An icon-only control has no visible text, so `label` is a *required*
 * input, not optional -- there is no accessible fallback name for this component the way
 * `<ums-button icon="...">` has its projected text label. requirement-spec.md §8: "visible focus
 * states... correct ARIA roles/labels" is a property of the component, not something a
 * consuming app can forget to pass.
 */
@Component({
  selector: 'ums-icon-button',
  standalone: true,
  imports: [UmsIconComponent],
  template: `
    <button
      class="ums-icon-button__native"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="label()"
    >
      <ums-icon [name]="icon()" [weight]="weight()" [size]="iconPixelSize()" decorative />
    </button>
  `,
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-icon-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class UmsIconButtonComponent {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('ghost');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly weight = input<IconWeight>('regular');

  protected readonly iconPixelSize = () => ({ sm: 16, md: 20, lg: 24 })[this.size()];
}
