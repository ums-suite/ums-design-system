import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService, UmsToastContainerComponent, type ThemeMode } from '@ums/design-system';
import { AssetCatalogComponent } from './pages/asset-catalog/asset-catalog.component';
import { ButtonCatalogComponent } from './pages/button-catalog/button-catalog.component';
import { DataDisplayCatalogComponent } from './pages/data-display-catalog/data-display-catalog.component';
import { DataTableCatalogComponent } from './pages/data-table-catalog/data-table-catalog.component';
import { FormCatalogComponent } from './pages/form-catalog/form-catalog.component';
import { IconCatalogComponent } from './pages/icon-catalog/icon-catalog.component';
import { NavigationCatalogComponent } from './pages/navigation-catalog/navigation-catalog.component';
import { OverlayCatalogComponent } from './pages/overlay-catalog/overlay-catalog.component';
import { StateSurfaceCatalogComponent } from './pages/state-surface-catalog/state-surface-catalog.component';

/**
 * DSYS-18 "Storybook-equivalent catalog" (requirement-spec.md §9): a single-page browsable
 * surface rendering every component this pass ships (Button family, Icon registry, Asset
 * registry), plus the theme toggle the e2e suite drives to exercise ThemeService live.
 *
 * A full navigation shell (top bar + side nav, DSYS-9) is explicitly out of scope for this pass
 * -- see the package README -- so this shell is intentionally minimal: a heading and a theme
 * switcher, not a real app layout.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ButtonCatalogComponent,
    FormCatalogComponent,
    DataDisplayCatalogComponent,
    DataTableCatalogComponent,
    StateSurfaceCatalogComponent,
    NavigationCatalogComponent,
    OverlayCatalogComponent,
    IconCatalogComponent,
    AssetCatalogComponent,
    UmsToastContainerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly modes: readonly ThemeMode[] = ['light', 'dark', 'system'];

  protected setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
