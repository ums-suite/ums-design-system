import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [UmsModalComponent],
  template: `
    <button type="button" id="trigger" (click)="open.set(true)">Open</button>
    <ums-modal
      [open]="open()"
      title="Confirm submission"
      (closed)="open.set(false); closeCount = closeCount + 1"
    >
      <p>Are you sure you want to submit?</p>
    </ums-modal>
  `,
})
class HostComponent {
  readonly open = signal(false);
  closeCount = 0;
}

describe('UmsModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing while closed', () => {
    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).toBeNull();
  });

  it('renders a labelled dialog with aria-modal when open, and moves focus into it', () => {
    (fixture.debugElement.query(By.css('#trigger')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'))
      .nativeElement as HTMLElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('emits closed and restores focus to the trigger when the close button is clicked', () => {
    const trigger = fixture.debugElement.query(By.css('#trigger'))
      .nativeElement as HTMLButtonElement;
    // A real user interaction (mouse or keyboard) focuses the trigger before its click handler
    // runs; a synthetic .click() in a test does not, so focus it explicitly to match reality.
    trigger.focus();
    trigger.click();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.ums-modal__close')).nativeElement.click();
    fixture.detectChanges();

    expect(host.closeCount).toBe(1);
    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('emits closed on backdrop click', () => {
    host.open.set(true);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.ums-modal__backdrop')).nativeElement.click();
    fixture.detectChanges();
    expect(host.closeCount).toBe(1);
  });

  it('emits closed on Escape', () => {
    host.open.set(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(host.closeCount).toBe(1);
  });

  it('traps Tab within the panel', () => {
    host.open.set(true);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('.ums-modal__panel'))
      .nativeElement as HTMLElement;
    const closeButton = panel.querySelector('.ums-modal__close') as HTMLElement;
    closeButton.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    panel.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
  });
});
