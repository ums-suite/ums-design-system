import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsConfirmationDialogComponent } from './confirmation-dialog.component';

@Component({
  standalone: true,
  imports: [UmsConfirmationDialogComponent],
  template: `
    <ums-confirmation-dialog
      [open]="open()"
      title="Deactivate student account"
      description="This will immediately revoke portal access."
      (confirmed)="confirmedReason = $event; open.set(false)"
      (cancelled)="open.set(false)"
    />
  `,
})
class HostComponent {
  readonly open = signal(true);
  confirmedReason: string | undefined;
}

describe('UmsConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function confirmButton(): HTMLButtonElement {
    const buttons = fixture.debugElement
      .queryAll(By.css('button'))
      .map((el) => el.nativeElement as HTMLButtonElement);
    return buttons.find((el) => el.textContent?.trim() === 'Confirm') as HTMLButtonElement;
  }

  function textarea(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
  }

  it('disables Confirm while the reason field is empty', () => {
    expect(confirmButton().disabled).toBeTrue();
  });

  it('enables Confirm once a non-empty reason is typed, and emits the trimmed reason', () => {
    textarea().value = '  Requested by the Registrar.  ';
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(confirmButton().disabled).toBeFalse();
    confirmButton().click();
    fixture.detectChanges();

    expect(host.confirmedReason).toBe('Requested by the Registrar.');
  });

  it('does not confirm on whitespace-only reason (still disabled)', () => {
    textarea().value = '   ';
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(confirmButton().disabled).toBeTrue();
  });

  it('clears the reason field once the dialog closes and reopens', () => {
    textarea().value = 'Some reason';
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    host.open.set(false);
    fixture.detectChanges();
    host.open.set(true);
    fixture.detectChanges();

    expect(textarea().value).toBe('');
  });

  it('emits cancelled when Cancel is clicked', () => {
    const buttons = fixture.debugElement
      .queryAll(By.css('button'))
      .map((el) => el.nativeElement as HTMLButtonElement);
    const cancelButton = buttons.find(
      (el) => el.textContent?.trim() === 'Cancel',
    ) as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();
    expect(host.open()).toBeFalse();
  });
});
