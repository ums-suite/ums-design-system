import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UmsFormFieldComponent, UmsRichTextEditorComponent } from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for DSYS-10 (Rich text editor, requirement-spec.md §6
 * "Forms & Inputs": "Rich text editor, for Notice/Content authoring"). Mirrors form-catalog's own
 * structure -- a dedicated page rather than folding into form-catalog, matching the precedent
 * DSYS-9's own primitives (Date/Time pickers, OTP input, File upload) set with their own
 * date-time-catalog page rather than crowding into form-catalog.
 *
 * Includes a long-form Bengali content variant (design-decisions.md "Locale-Safe Component
 * Sizing Verification") alongside the English default, an invalid state wired through
 * `ums-form-field` the same way DSYS-8's Input/Textarea already are, and a disabled state.
 */
@Component({
  selector: 'app-rich-text-editor-catalog',
  standalone: true,
  imports: [UmsFormFieldComponent, UmsRichTextEditorComponent],
  templateUrl: './rich-text-editor-catalog.component.html',
  styleUrl: './rich-text-editor-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorCatalogComponent {
  protected readonly noticeValue = signal(
    '<p>Welcome to <strong>Notice</strong> authoring. Use the toolbar to add <em>emphasis</em>, links, and lists.</p>',
  );

  protected readonly disabledValue = signal(
    '<p>This published notice is locked for further editing.</p>',
  );

  protected readonly invalidValue = signal('');

  /**
   * A representative long-form Bengali notice body -- meaningfully longer/denser than its
   * English counterpart, per design-decisions.md "Locale-Safe Component Sizing Verification" --
   * exercising the editor content area's wrapping rather than a short placeholder ever would.
   */
  protected readonly bengaliLongContent = signal(
    '<p>শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ১৫ সেপ্টেম্বর, ২০২৬ তারিখে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে যথাসময়ে উপস্থিত থাকার জন্য অনুরোধ করা হলো।</p>',
  );

  protected readonly englishContent =
    '<p>Please join us for the annual sports competition on September 15, 2026. All students are requested to attend on time.</p>';
}
