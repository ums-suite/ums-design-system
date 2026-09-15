import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { UploadableFile } from './file-upload.types';

/**
 * DSYS-9 File upload (requirement-spec.md §6: "drag-drop, progress"). Deliberately
 * presentational/thin: this component renders a dropzone and a per-file progress list, but never
 * performs the actual upload network call itself -- that's a consuming app's own concern (which
 * HTTP client, which retry/backoff policy, which storage backend). It emits the raw native
 * `FileList` from either a drop or the hidden file input's own picker via `(filesSelected)`, and
 * the consumer feeds `[files]` back in as an `UploadableFile[]` (id/progress/status), updating
 * `progress`/`status` as its own upload mechanism reports them.
 *
 * The dropzone is a real `<button>` (not a styled `<div>` with a click handler) specifically so
 * drag-and-drop remains a pointer-only *convenience* on top of a fully keyboard-operable control
 * -- Enter/Space opens the native file picker exactly like a click would, matching this package's
 * "accessible by construction" posture for every other interactive component.
 */
@Component({
  selector: 'ums-file-upload',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-file-upload' },
})
export class UmsFileUploadComponent {
  readonly files = input<readonly UploadableFile[]>([]);
  readonly accept = input<string | undefined>(undefined);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hint = input<string>('Drag and drop files here, or click to browse');

  readonly filesSelected = output<FileList>();
  readonly removeRequested = output<string>();
  readonly retryRequested = output<string>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly isDraggingOver = signal(false);

  protected openPicker(): void {
    if (this.disabled()) return;
    this.fileInput()?.nativeElement.click();
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filesSelected.emit(input.files);
    }
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.isDraggingOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDraggingOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver.set(false);
    if (this.disabled()) return;
    const dropped = event.dataTransfer?.files;
    if (dropped && dropped.length > 0) {
      this.filesSelected.emit(dropped);
    }
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected remove(file: UploadableFile): void {
    this.removeRequested.emit(file.id);
  }

  protected retry(file: UploadableFile): void {
    this.retryRequested.emit(file.id);
  }
}
