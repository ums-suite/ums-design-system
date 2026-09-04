import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UmsButtonComponent,
  UmsFabComponent,
  UmsIconButtonComponent,
  UmsSplitButtonComponent,
  type ButtonVariant,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target: renders every Button-family variant the package
 * ships (requirement-spec.md §6 "Actions" row) so the e2e suite (playwright.config.ts, e2e/)
 * has one stable, addressable surface to screenshot-diff and axe-scan, matching requirement-spec
 * §9's "screenshot diffing on the shared component library's own Storybook-equivalent catalog."
 *
 * Includes a long-form Bengali-label variant alongside the English one on the primary button
 * (design-decisions.md "Locale-Safe Component Sizing Verification (Bengali Layout Testing)") --
 * every text-bearing catalog entry is meant to get this treatment eventually; this pass covers
 * the one component family in scope (DSYS-7).
 */
@Component({
  selector: 'app-button-catalog',
  standalone: true,
  imports: [
    TitleCasePipe,
    UmsButtonComponent,
    UmsIconButtonComponent,
    UmsFabComponent,
    UmsSplitButtonComponent,
  ],
  templateUrl: './button-catalog.component.html',
  styleUrl: './button-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonCatalogComponent {
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];

  /**
   * A representative long-form Bengali string -- "Submit the student admission application
   * form" -- long enough to exercise wrapping/overflow the short English label ("Submit") never
   * would, per the Bengali-layout design decision.
   */
  protected readonly bengaliLongLabel = 'শিক্ষার্থী ভর্তি আবেদনপত্র জমা দিন';

  protected readonly splitExpanded = signal(false);

  protected toggleSplit(): void {
    this.splitExpanded.update((expanded) => !expanded);
  }
}
