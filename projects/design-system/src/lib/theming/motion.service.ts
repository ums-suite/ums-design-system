import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { snapInFlightAnimations } from './reduced-motion.util';

/**
 * DSYS-4 motion tokens + design-decisions.md "Reduced-Motion State Consistency Across In-Flight
 * Animations". One platform-wide `change` listener on `prefers-reduced-motion`, registered once
 * here (this service is `providedIn: 'root'`, so it's instantiated exactly once per app) rather
 * than per component -- matching the decision's "an app-level media-query switch, not a
 * per-component opt-out."
 *
 * `_reset.scss` already collapses `animation-duration`/`transition-duration` to
 * `--motion-reduced` for anything running under `@media (prefers-reduced-motion: reduce)`, which
 * covers animations that *start* after the preference is set. This service covers the case that
 * a plain CSS media query cannot: an animation already in flight at the exact moment the
 * preference flips.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly document = inject(DOCUMENT);
  private readonly reducedMotionMediaQuery =
    this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;

  readonly prefersReducedMotion = signal<boolean>(this.reducedMotionMediaQuery?.matches ?? false);

  constructor() {
    this.reducedMotionMediaQuery?.addEventListener('change', (event) => {
      this.prefersReducedMotion.set(event.matches);
      if (event.matches) {
        snapInFlightAnimations(this.document);
      }
    });
  }
}
