import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ASSET_REGISTRY, type AssetName } from './asset-registry';

export type { AssetName };

/**
 * Renders a brand asset from the DSYS-6 asset registry: `<ums-asset name="logo-mark" />`. Same
 * "generated typed name, never a hand-inlined <svg>" contract as UmsIconComponent, applied to
 * logo/illustration slots instead of the icon set -- requirement-spec.md §6's "no consuming app
 * inlines an ad hoc illustration or forks the brand mark locally."
 */
@Component({
  selector: 'ums-asset',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="definition().viewBox"
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.role]="decorative() ? null : 'img'"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.aria-label]="decorative() ? null : (label() ?? definition().description)"
      [innerHTML]="markup()"
    ></svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-asset' },
})
export class UmsAssetComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<AssetName>();
  readonly width = input<number | string | undefined>(undefined);
  readonly height = input<number | string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly definition = computed(() => ASSET_REGISTRY[this.name()]);
  protected readonly markup = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.definition().markup),
  );
}
