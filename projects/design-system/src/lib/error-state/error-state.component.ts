import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UmsAssetComponent, type AssetName } from '../assets/asset.component';
import { UmsButtonComponent } from '../button/button.component';

/**
 * DSYS-17 Error/failure state (requirement-spec.md §6: "retry affordance"). Embeds a real
 * `<ums-button>` for the retry action -- Button is this component tree's own hub
 * (tickets.md "Notes for Sprint Planner Agent") -- rather than projecting an arbitrary action,
 * since a retry affordance is this component's one required, specified behaviour; extra actions
 * can still be projected via `<ng-content>` alongside it.
 */
@Component({
  selector: 'ums-error-state',
  standalone: true,
  imports: [UmsAssetComponent, UmsButtonComponent],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-error-state' },
})
export class UmsErrorStateComponent {
  readonly illustration = input<AssetName>('illustration-error-state');
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly retryLabel = input<string>('Try again');

  readonly retry = output();
}
