import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICON_REGISTRY, type IconName, type IconWeight } from './icon-registry.generated';

export type { IconName, IconWeight };
export { ICON_NAMES } from './icon-registry.generated';

/**
 * DSYS-6 icon system. requirement-spec.md §6 / §10 item 2: "Icon usage is exclusively through
 * the typed IconName union -- no inline SVG in feature code across any of the six apps."
 *
 * `[name]` only accepts a generated IconName, so referencing an icon outside the curated subset
 * (tools/icons/subset.json) is a compile error, not a silently-missing glyph at runtime.
 *
 * The inner markup comes from this package's own generated registry (tools/icons/build-icons.mjs
 * -> Phosphor Icons' own published SVGs) -- never from a caller-supplied string -- so
 * `bypassSecurityTrustHtml` here is sanitizing content this package fully controls, not
 * re-trusting arbitrary input.
 */
@Component({
  selector: 'ums-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 256 256"
      fill="currentColor"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.role]="decorative() ? null : 'img'"
      [attr.aria-label]="decorative() ? null : (label() ?? name())"
      [innerHTML]="markup()"
    ></svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-icon' },
})
export class UmsIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly weight = input<IconWeight>('regular');
  readonly size = input<number | string>(20);

  /**
   * Accessible label. Leave unset (and `decorative` false, the default) and the icon falls back
   * to announcing its own name -- fine for development, but a real component should always pass
   * either a real `label` or set `decorative` when the surrounding control (a labelled Button, a
   * table cell with its own text) already supplies the accessible name.
   */
  readonly label = input<string | undefined>(undefined);
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly markup = computed<SafeHtml>(() => {
    const svg = ICON_REGISTRY[this.name()][this.weight()];
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
