export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * A file this component only ever displays -- it never performs the actual upload network call
 * (out of scope for a presentational design-system component; see the component's class doc).
 * The consuming app owns `id`/`progress`/`status`/`errorMessage`, updating them as its own upload
 * mechanism (an HttpClient request, a resumable-upload library, etc.) reports progress.
 */
export interface UploadableFile {
  readonly id: string;
  readonly name: string;
  readonly sizeBytes: number;
  readonly progress: number;
  readonly status: FileUploadStatus;
  readonly errorMessage?: string;
}
