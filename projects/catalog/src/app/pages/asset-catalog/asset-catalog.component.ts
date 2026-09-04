import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UmsAssetComponent, type AssetName } from '@ums/design-system';

/**
 * Browsable rendering of the DSYS-6 asset registry (logo, logo-mark, illustration set).
 * requirement-spec.md §6: "no consuming app inlines an ad hoc illustration or forks the brand
 * mark locally" -- every value rendered here is a clearly-labelled placeholder (see
 * asset-registry.ts's own header comment), not real brand art.
 */
@Component({
  selector: 'app-asset-catalog',
  standalone: true,
  imports: [UmsAssetComponent],
  templateUrl: './asset-catalog.component.html',
  styleUrl: './asset-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetCatalogComponent {
  protected readonly assetNames: readonly AssetName[] = [
    'logo',
    'logo-mark',
    'illustration-empty-state',
    'illustration-error-state',
    'illustration-celebratory',
  ];
}
