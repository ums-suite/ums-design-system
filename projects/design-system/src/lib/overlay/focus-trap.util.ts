/**
 * DSYS-15 shared focus-management utility for every overlay (Modal, Drawer, Confirmation
 * dialog) -- exported as standalone functions (matching reduced-motion.util.ts's convention) so
 * they're testable against plain DOM fixtures without booting Angular's DI, and so the same
 * "trap Tab inside the panel, restore focus to the trigger on close" behaviour is implemented
 * once rather than reinvented per overlay component.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Every focusable, visible descendant of `container`, in DOM/tab order. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * Call from a panel's own `(keydown)` handler on every keystroke; a no-op unless `event.key` is
 * "Tab". Wraps focus from the last focusable element back to the first (and vice versa with
 * Shift+Tab) so Tab can never escape the panel -- the WAI-ARIA "modal dialog" focus-trap
 * requirement (requirement-spec.md §8, "correct ARIA roles... data table, modal, command
 * palette").
 */
export function trapTabKey(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = container.ownerDocument.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Moves initial focus into a just-opened panel: its first focusable descendant, or the panel itself. */
export function focusPanel(panel: HTMLElement): void {
  const [first] = getFocusableElements(panel);
  (first ?? panel).focus();
}
