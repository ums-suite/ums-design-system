import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { ButtonSize, ButtonType, ButtonVariant } from '../button/button.types';

/**
 * DSYS-7 Split Button: a primary action paired with an adjoining trigger for a secondary menu
 * of related actions, following the standard "grouped buttons" ARIA pattern (a `role="group"`
 * wrapper, `aria-haspopup`/`aria-expanded`/`aria-controls` on the trigger).
 *
 * This component owns the two-button group and its ARIA wiring only -- it does not own the menu
 * itself (Menu/Popover is DSYS-15, out of scope for this pass). A consumer wires `expanded` and
 * `menuId` to whatever popover/menu implementation it renders, driven by `(toggleClick)`.
 *
 * Both inner `<button>`s live inside this component's own template, so (unlike UmsButtonComponent,
 * which is a single native button and can rely on native click bubbling) a parent needs two
 * distinguishable events -- hence the explicit `(primaryClick)`/`(toggleClick)` outputs here.
 */
@Component({
  selector: 'ums-split-button',
  standalone: true,
  imports: [UmsIconComponent],
  template: `
    <div class="ums-split-button__group" role="group" [attr.aria-label]="groupLabel()">
      <button
        class="ums-split-button__primary"
        [type]="type()"
        [disabled]="disabled()"
        (click)="primaryClick.emit($event)"
      >
        <ng-content />
      </button>
      <button
        class="ums-split-button__trigger"
        type="button"
        [disabled]="disabled()"
        aria-haspopup="menu"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="menuId() ?? null"
        [attr.aria-label]="triggerLabel()"
        (click)="toggleClick.emit($event)"
      >
        <ums-icon name="caret-down" [size]="16" decorative />
      </button>
    </div>
  `,
  styleUrl: './split-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-split-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class UmsSplitButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);

  /** Whether the attached menu is currently open -- consumer-owned state, reflected here for ARIA only. */
  readonly expanded = input<boolean>(false);
  /** id of the menu element the trigger controls, for aria-controls. */
  readonly menuId = input<string | undefined>(undefined);
  readonly groupLabel = input<string>('Actions');
  readonly triggerLabel = input<string>('More actions');

  readonly primaryClick = output<MouseEvent>();
  readonly toggleClick = output<MouseEvent>();
}
