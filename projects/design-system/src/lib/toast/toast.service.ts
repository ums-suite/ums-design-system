import { Injectable, signal } from '@angular/core';
import type { ToastMessage, ToastOptions } from './toast.types';

/**
 * DSYS-15 Toast/Snackbar (requirement-spec.md §6; §8 names toast among the ARIA-verified
 * components). A single shared queue (`providedIn: 'root'`, same "one shared service" pattern as
 * ThemeService/MotionService) that `UmsToastContainerComponent` renders -- mount the container
 * once near an app's root, then call `toastService.show(...)` from anywhere.
 *
 * `--motion-base` (200ms, "toast enter/exit" per requirement-spec.md §5) drives the container's
 * own enter/exit CSS animation; the auto-dismiss *timer* itself is deliberately NOT motion --
 * `prefers-reduced-motion` shortens animation, it does not mean "auto-dismiss instantly."
 */
@Injectable({ providedIn: 'root' })
export class UmsToastService {
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly actions = new Map<number, () => void>();

  private readonly _toasts = signal<readonly ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, options: ToastOptions = {}): number {
    const id = ++this.nextId;
    const toast: ToastMessage = {
      id,
      message,
      variant: options.variant ?? 'neutral',
      actionLabel: options.actionLabel,
    };
    this._toasts.update((list) => [...list, toast]);

    if (options.onAction) {
      this.actions.set(id, options.onAction);
    }

    const durationMs = options.durationMs ?? 5000;
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), durationMs),
    );

    return id;
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.actions.delete(id);
  }

  triggerAction(id: number): void {
    this.actions.get(id)?.();
    this.dismiss(id);
  }
}
