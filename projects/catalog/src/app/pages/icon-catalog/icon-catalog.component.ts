import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICON_NAMES, UmsIconComponent, type IconName } from '@ums/design-system';

/**
 * Browsable rendering of the DSYS-6 icon registry -- every icon in tools/icons/subset.json,
 * both weights, so a visual regression on the icon build pipeline (a wrong subset entry, a bad
 * SVG normalize step) is visible on this catalog page rather than only discovered per-app.
 */
@Component({
  selector: 'app-icon-catalog',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './icon-catalog.component.html',
  styleUrl: './icon-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconCatalogComponent {
  protected readonly iconNames: readonly IconName[] = ICON_NAMES;
}
