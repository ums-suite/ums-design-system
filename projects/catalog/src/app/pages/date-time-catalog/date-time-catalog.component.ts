import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UmsDatePickerComponent,
  UmsDateRangePickerComponent,
  UmsFileUploadComponent,
  UmsOtpInputComponent,
  UmsTimePickerComponent,
  type DateRange,
  type UploadableFile,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for DSYS-9 (Date picker, Date-range picker, Time
 * picker, OTP input, File upload). Includes a long-form Bengali label on the file-upload dropzone
 * hint (design-decisions.md "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-date-time-catalog',
  standalone: true,
  imports: [
    UmsDatePickerComponent,
    UmsDateRangePickerComponent,
    UmsTimePickerComponent,
    UmsOtpInputComponent,
    UmsFileUploadComponent,
  ],
  templateUrl: './date-time-catalog.component.html',
  styleUrl: './date-time-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeCatalogComponent {
  protected readonly dateValue = signal<string | null>('2026-09-12');
  protected readonly range = signal<DateRange>({ start: null, end: null });
  protected readonly timeValue = signal('09:30');
  protected readonly otpValue = signal('');
  protected readonly otpCompleted = signal<string | undefined>(undefined);

  protected readonly files = signal<readonly UploadableFile[]>([
    { id: '1', name: 'transcript.pdf', sizeBytes: 245_000, progress: 100, status: 'success' },
    { id: '2', name: 'photo.jpg', sizeBytes: 1_200_000, progress: 60, status: 'uploading' },
    {
      id: '3',
      name: 'certificate.png',
      sizeBytes: 800_000,
      progress: 0,
      status: 'error',
      errorMessage: 'File exceeds the 500 KB limit',
    },
  ]);

  protected readonly bengaliHint = 'ফাইল টেনে এনে ছেড়ে দিন, অথবা ব্রাউজ করতে ক্লিক করুন';

  protected onFilesSelected(fileList: FileList): void {
    const newFiles: UploadableFile[] = Array.from(fileList).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      sizeBytes: file.size,
      progress: 0,
      status: 'pending',
    }));
    this.files.update((current) => [...current, ...newFiles]);
  }

  protected onRemove(id: string): void {
    this.files.update((current) => current.filter((file) => file.id !== id));
  }

  protected onRetry(id: string): void {
    this.files.update((current) =>
      current.map((file) =>
        file.id === id ? { ...file, status: 'uploading', progress: 0 } : file,
      ),
    );
  }
}
