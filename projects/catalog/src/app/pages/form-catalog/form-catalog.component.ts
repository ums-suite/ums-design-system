import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UmsComboboxComponent,
  UmsFormFieldComponent,
  UmsInputComponent,
  UmsSelectComponent,
  UmsTextareaComponent,
  type ComboboxOption,
  type SelectOption,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-8 form primitive family (Input, Textarea,
 * Select, Combobox, FormField). Includes a long-form Bengali label/error variant on the email
 * field (design-decisions.md "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-form-catalog',
  standalone: true,
  imports: [
    UmsFormFieldComponent,
    UmsInputComponent,
    UmsTextareaComponent,
    UmsSelectComponent,
    UmsComboboxComponent,
  ],
  templateUrl: './form-catalog.component.html',
  styleUrl: './form-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCatalogComponent {
  protected readonly textValue = signal('');
  protected readonly numberValue = signal('');
  protected readonly passwordValue = signal('');
  protected readonly searchValue = signal('');
  protected readonly bioValue = signal('');
  protected readonly departmentValue = signal('');
  protected readonly cityValue = signal('');
  protected readonly invalidEmailValue = signal('not-an-email');
  protected readonly bengaliValue = signal('');

  protected readonly departments: readonly SelectOption[] = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'eee', label: 'Electrical & Electronic Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
  ];

  protected readonly cities: readonly ComboboxOption[] = [
    { value: 'dhaka', label: 'Dhaka' },
    { value: 'chittagong', label: 'Chittagong' },
    { value: 'khulna', label: 'Khulna' },
    { value: 'rajshahi', label: 'Rajshahi' },
    { value: 'sylhet', label: 'Sylhet' },
  ];

  /**
   * A representative long-form Bengali validation message, exercising the FormField's error-list
   * wrapping/overflow the same way button-catalog's bengaliLongLabel does for Button.
   */
  protected readonly bengaliLongError =
    'অনুগ্রহ করে একটি বৈধ শিক্ষার্থী পরিচয়পত্র নম্বর প্রবেশ করান';
}
