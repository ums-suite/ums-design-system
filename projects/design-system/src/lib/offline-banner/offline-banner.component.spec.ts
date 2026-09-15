import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsOfflineBannerComponent } from './offline-banner.component';

@Component({
  standalone: true,
  imports: [UmsOfflineBannerComponent],
  template: `<ums-offline-banner data-testid="offline-banner" />`,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsOfflineBannerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function banner(): HTMLElement {
    return fixture.debugElement.query(By.css('ums-offline-banner')).nativeElement as HTMLElement;
  }

  it('is a polite, non-interruptive status region', () => {
    expect(banner().getAttribute('role')).toBe('status');
    expect(banner().getAttribute('aria-live')).toBe('polite');
  });

  it('stays hidden while the browser reports online', () => {
    expect(banner().classList).not.toContain('ums-offline-banner--visible');
  });

  it('becomes visible on a window "offline" event and hides again on "online"', () => {
    window.dispatchEvent(new Event('offline'));
    fixture.detectChanges();
    expect(banner().classList).toContain('ums-offline-banner--visible');
    expect(banner().textContent).toContain('You are offline');

    window.dispatchEvent(new Event('online'));
    fixture.detectChanges();
    expect(banner().classList).not.toContain('ums-offline-banner--visible');
  });
});
