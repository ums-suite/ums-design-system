import { TestBed } from '@angular/core/testing';
import { UmsToastService } from './toast.service';

describe('UmsToastService', () => {
  let service: UmsToastService;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UmsToastService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('adds a toast with a default neutral variant', () => {
    service.show('Saved successfully');
    expect(service.toasts()).toEqual([
      {
        id: jasmine.any(Number),
        message: 'Saved successfully',
        variant: 'neutral',
        actionLabel: undefined,
      },
    ]);
  });

  it('adds a toast with a requested variant and action label', () => {
    service.show('Undo the last change?', { variant: 'warning', actionLabel: 'Undo' });
    expect(service.toasts()[0].variant).toBe('warning');
    expect(service.toasts()[0].actionLabel).toBe('Undo');
  });

  it('auto-dismisses after durationMs', () => {
    const id = service.show('Auto-dismiss me', { durationMs: 1000 });
    expect(service.toasts().some((toast) => toast.id === id)).toBeTrue();
    jasmine.clock().tick(1001);
    expect(service.toasts().some((toast) => toast.id === id)).toBeFalse();
  });

  it('dismiss() removes a toast and cancels its timer', () => {
    const id = service.show('Dismiss me');
    service.dismiss(id);
    expect(service.toasts()).toEqual([]);
  });

  it('triggerAction() calls the onAction callback and dismisses the toast', () => {
    const onAction = jasmine.createSpy('onAction');
    const id = service.show('Undo?', { actionLabel: 'Undo', onAction });
    service.triggerAction(id);
    expect(onAction).toHaveBeenCalled();
    expect(service.toasts()).toEqual([]);
  });
});
