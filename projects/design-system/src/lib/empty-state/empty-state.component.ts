import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UmsAssetComponent, type AssetName } from '../assets/asset.component';

/**
 * DSYS-17 Empty state (requirement-spec.md §6: "illustration + message + primary action slot").
 * The illustration is decorative (the title/description text is the real accessible content);
 * the primary action is projected via `<ng-content>` so a consuming app can drop in a real
 * `<ums-button>` wired to its own navigation, matching Button's own "hub" role in this system.
 */
@Component({
  selector: 'ums-empty-state',
  standalone: true,
  imports: [UmsAssetComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-empty-state' },
})
export class UmsEmptyStateComponent {
  readonly illustration = input<AssetName>('illustration-empty-state');
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
}
