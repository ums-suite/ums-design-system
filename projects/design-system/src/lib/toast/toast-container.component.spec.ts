import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsToastContainerComponent } from './toast-container.component';
import { UmsToastService } from './toast.service';

@Component({
  standalone: true,
  imports: [UmsToastContainerComponent],
  template: `<ums-toast-container />`,
})
class HostComponent {
  readonly toastService = inject(UmsToastService);
}

describe('UmsToastContainerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is a polite, non-interruptive status region', () => {
    const container = fixture.debugElement.query(By.css('ums-toast-container'))
      .nativeElement as HTMLElement;
    expect(container.getAttribute('role')).toBe('status');
    expect(container.getAttribute('aria-live')).toBe('polite');
  });

  it('renders a toast pushed through the service, with its variant as a data attribute', () => {
    host.toastService.show('Application submitted', { variant: 'success' });
    fixture.detectChanges();

    const toast = fixture.debugElement.query(By.css('.ums-toast'));
    expect(toast.nativeElement.textContent).toContain('Application submitted');
    expect(toast.nativeElement.getAttribute('data-variant')).toBe('success');
  });

  it('dismisses a toast when its dismiss button is clicked', () => {
    host.toastService.show('Dismiss me');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.ums-toast__dismiss')).nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ums-toast'))).toBeNull();
  });

  it('triggers the action callback when the action button is clicked', () => {
    const onAction = jasmine.createSpy('onAction');
    host.toastService.show('Undo?', { actionLabel: 'Undo', onAction });
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.ums-toast__action')).nativeElement.click();
    fixture.detectChanges();
    expect(onAction).toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('.ums-toast'))).toBeNull();
  });
});
