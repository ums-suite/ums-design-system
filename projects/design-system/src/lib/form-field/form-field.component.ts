import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

let nextFormFieldId = 0;

/**
 * DSYS-8 form field wrapper (requirement-spec.md §6 "Forms & Inputs": "form field wrapper with
 * inline validation and localized error messages"). Not a form-control itself -- it lays out a
 * label/hint/error triad around a projected control (Input, Select, Combobox, Textarea, ...) and
 * hands that control the ids it needs to wire up `for`/`aria-describedby`/`aria-invalid` itself,
 * via `exportAs` template-reference access:
 *
 * ```html
 * <ums-form-field #field="umsFormField" label="Email" [errors]="emailErrors()">
 *   <ums-input [id]="field.controlId()" [ariaDescribedBy]="field.describedBy()" [invalid]="field.hasErrors()" />
 * </ums-form-field>
 * ```
 *
 * `errors` takes already-localized message strings (requirement-spec.md §8: "the design system
 * itself holds no translated strings -- that's each app's i18n resource"); this wrapper only
 * guarantees the *layout/ARIA* of inline validation, never the translation itself.
 *
 * `labelId()` (DSYS-10) exists for a projected control that isn't a "labelable" HTML element per
 * the forms spec (button, input, select, textarea, ...) -- a `<label for>` only computes an
 * accessible name automatically for those; a `role="textbox"` `<div contenteditable>` (the Rich
 * Text Editor's real interactive element) needs the label wired explicitly via
 * `[ariaLabelledBy]="field.labelId()"`, or axe-core's automated a11y gate (requirement-spec.md
 * §8) correctly flags it as unnamed. Every other DSYS-8 control can ignore `labelId()` entirely.
 */
@Component({
  selector: 'ums-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'umsFormField',
  host: { class: 'ums-form-field' },
})
export class UmsFormFieldComponent {
  private readonly instanceId = `ums-form-field-${++nextFormFieldId}`;

  readonly label = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
  readonly errors = input<readonly string[]>([]);
  readonly required = input(false, { transform: booleanAttribute });

  /** Id the projected control must set as its own `[id]`, so this field's `<label for>` resolves. */
  readonly controlId = computed(() => `${this.instanceId}-control`);
  readonly hintId = computed(() => `${this.instanceId}-hint`);
  readonly errorId = computed(() => `${this.instanceId}-error`);
  /** See class doc: for a non-labelable projected control, bind `[ariaLabelledBy]="labelId()"`. */
  readonly labelId = computed(() => `${this.instanceId}-label`);
  readonly hasErrors = computed(() => this.errors().length > 0);

  /** Id the projected control must set as its own `[ariaDescribedBy]`. */
  readonly describedBy = computed<string | undefined>(() => {
    if (this.hasErrors()) return this.errorId();
    if (this.hint()) return this.hintId();
    return undefined;
  });
}
