import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsDrawerComponent } from './drawer.component';

@Component({
  standalone: true,
  imports: [UmsDrawerComponent],
  template: `
    <button type="button" id="trigger" (click)="open.set(true)">Open</button>
    <ums-drawer
      [open]="open()"
      title="Filters"
      position="end"
      (closed)="open.set(false); closeCount = closeCount + 1"
    >
      <p>Filter options</p>
    </ums-drawer>
  `,
})
class HostComponent {
  readonly open = signal(false);
  closeCount = 0;
}

describe('UmsDrawerComponent', () => {
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

  it('renders a labelled dialog at the requested logical edge when open', () => {
    host.open.set(true);
    fixture.detectChanges();
    const panel = fixture.debugElement.query(By.css('.ums-drawer__panel'))
      .nativeElement as HTMLElement;
    expect(panel.getAttribute('data-position')).toBe('end');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  it('emits closed and restores focus to the trigger on close', () => {
    const trigger = fixture.debugElement.query(By.css('#trigger'))
      .nativeElement as HTMLButtonElement;
    // A real user interaction (mouse or keyboard) focuses the trigger before its click handler
    // runs; a synthetic .click() in a test does not, so focus it explicitly to match reality.
    trigger.focus();
    trigger.click();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.ums-drawer__close')).nativeElement.click();
    fixture.detectChanges();

    expect(host.closeCount).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('emits closed on Escape', () => {
    host.open.set(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(host.closeCount).toBe(1);
  });
});
