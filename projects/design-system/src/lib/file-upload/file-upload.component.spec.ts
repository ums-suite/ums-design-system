import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsFileUploadComponent } from './file-upload.component';
import type { UploadableFile } from './file-upload.types';

@Component({
  standalone: true,
  imports: [UmsFileUploadComponent],
  template: `
    <ums-file-upload
      [files]="files()"
      (filesSelected)="lastSelected = $event"
      (removeRequested)="lastRemoved = $event"
      (retryRequested)="lastRetried = $event"
    />
  `,
})
class HostComponent {
  readonly files = signal<readonly UploadableFile[]>([]);
  lastSelected: FileList | undefined;
  lastRemoved: string | undefined;
  lastRetried: string | undefined;
}

describe('UmsFileUploadComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function dropzone(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-file-upload__dropzone'))
      .nativeElement as HTMLButtonElement;
  }

  function fakeFileList(names: string[]): FileList {
    const files = names.map((name) => new File(['content'], name, { type: 'text/plain' }));
    return {
      ...files,
      length: files.length,
      item: (i: number) => files[i] ?? null,
      [Symbol.iterator]: () => files[Symbol.iterator](),
    } as unknown as FileList;
  }

  it('renders an empty state with just the dropzone when there are no files', () => {
    expect(fixture.debugElement.query(By.css('.ums-file-upload__list'))).toBeNull();
  });

  it('clicking the dropzone opens the native file picker', () => {
    const fileInput = fixture.debugElement.query(By.css('input[type="file"]'))
      .nativeElement as HTMLInputElement;
    const clickSpy = spyOn(fileInput, 'click');
    dropzone().click();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('emits filesSelected when files are dropped', () => {
    const list = fakeFileList(['photo.png']);
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: list } });
    dropzone().dispatchEvent(dropEvent);
    fixture.detectChanges();

    expect(host.lastSelected).toBe(list);
  });

  it('emits filesSelected when a file is chosen via the native input', () => {
    const list = fakeFileList(['resume.pdf']);
    const fileInput = fixture.debugElement.query(By.css('input[type="file"]'))
      .nativeElement as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', { value: list, configurable: true });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.lastSelected).toBe(list);
  });

  it('renders a progress bar for an uploading file with the correct aria attributes', () => {
    host.files.set([
      { id: '1', name: 'a.png', sizeBytes: 2048, progress: 42, status: 'uploading' },
    ]);
    fixture.detectChanges();

    const bar = fixture.debugElement.query(By.css('[role="progressbar"]'))
      .nativeElement as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
  });

  it('shows a success indicator for a completed file', () => {
    host.files.set([{ id: '1', name: 'a.png', sizeBytes: 2048, progress: 100, status: 'success' }]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ums-file-upload__status--success'))).toBeTruthy();
  });

  it('shows an error message and a retry button for a failed file, wired to (retryRequested)', () => {
    host.files.set([
      {
        id: '1',
        name: 'a.png',
        sizeBytes: 2048,
        progress: 0,
        status: 'error',
        errorMessage: 'Network error',
      },
    ]);
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.ums-file-upload__status--error')).nativeElement
        .textContent,
    ).toContain('Network error');

    (
      fixture.debugElement.query(By.css('.ums-file-upload__retry'))
        .nativeElement as HTMLButtonElement
    ).click();
    expect(host.lastRetried).toBe('1');
  });

  it('formats file sizes in B/KB/MB', () => {
    host.files.set([
      { id: '1', name: 'tiny.txt', sizeBytes: 500, progress: 0, status: 'pending' },
      { id: '2', name: 'medium.txt', sizeBytes: 2048, progress: 0, status: 'pending' },
      { id: '3', name: 'big.txt', sizeBytes: 5 * 1024 * 1024, progress: 0, status: 'pending' },
    ]);
    fixture.detectChanges();

    const sizes = fixture.debugElement
      .queryAll(By.css('.ums-file-upload__item-size'))
      .map((el) => (el.nativeElement as HTMLElement).textContent);
    expect(sizes).toEqual(['500 B', '2.0 KB', '5.0 MB']);
  });

  it('emits removeRequested when a file row is removed', () => {
    host.files.set([{ id: '1', name: 'a.png', sizeBytes: 2048, progress: 0, status: 'pending' }]);
    fixture.detectChanges();

    (
      fixture.debugElement.query(By.css('.ums-file-upload__remove'))
        .nativeElement as HTMLButtonElement
    ).click();
    expect(host.lastRemoved).toBe('1');
  });
});
