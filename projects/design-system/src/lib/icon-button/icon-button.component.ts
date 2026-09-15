import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsIconComponent, type IconName, type IconWeight } from '../icon/icon.component';
import type { ButtonSize, ButtonType, ButtonVariant } from '../button/button.types';

/**
 * DSYS-7 Icon Button. An icon-only control has no visible text, so `label` is a *required*
 * input, not optional -- there is no accessible fallback name for this component the way
 * `<ums-button icon="...">` has its projected text label. requirement-spec.md §8: "visible focus
 * states... correct ARIA roles/labels" is a property of the component, not something a
 * consuming app can forget to pass.
 *
 * `pressed` (DSYS-10) is for a toggle-style icon button -- e.g. a Rich Text Editor toolbar's
 * Bold/Italic/Link buttons, which need `aria-pressed` on the actual interactive element (not a
 * cosmetic `[class]` a consuming app would have to fake) to announce their on/off state per
 * requirement-spec.md §8. Left `undefined` (the default), the button isn't a toggle at all and no
 * `aria-pressed` attribute is rendered, matching every other Icon Button usage in this package.
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
      [attr.aria-pressed]="pressed() === undefined ? null : pressed()"
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
    '[class.ums-icon-button--pressed]': 'pressed() === true',
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
  readonly pressed = input<boolean | undefined>(undefined);

  protected readonly iconPixelSize = () => ({ sm: 16, md: 20, lg: 24 })[this.size()];
}
