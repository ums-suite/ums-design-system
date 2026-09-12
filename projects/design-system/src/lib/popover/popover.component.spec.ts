import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsPopoverComponent } from './popover.component';

@Component({
  standalone: true,
  imports: [UmsPopoverComponent],
  template: `
    <ums-popover label="Notification settings">
      <span umsPopoverTrigger>Notifications</span>
      <div umsPopoverContent>
        <p>You have 3 unread notices.</p>
      </div>
    </ums-popover>
    <button type="button" id="outside">Outside</button>
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsPopoverComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-popover__trigger')).nativeElement;
  }

  it('renders no panel until the trigger is clicked', () => {
    expect(fixture.debugElement.query(By.css('.ums-popover__panel'))).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the panel on trigger click, with aria-expanded/aria-controls wired up', () => {
    trigger().click();
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    const panel = fixture.debugElement.query(By.css('.ums-popover__panel'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.id).toBe(trigger().getAttribute('aria-controls'));
    expect(panel.nativeElement.textContent).toContain('You have 3 unread notices.');
  });

  it('closes on an outside click', () => {
    trigger().click();
    fixture.detectChanges();

    (fixture.debugElement.query(By.css('#outside')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ums-popover__panel'))).toBeNull();
  });

  it('closes on Escape and restores focus to the trigger', () => {
    // A real user interaction (mouse or keyboard) focuses the trigger before its click handler
    // runs; a synthetic .click() in a test does not, so focus it explicitly to match reality.
    trigger().focus();
    trigger().click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ums-popover__panel'))).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});
