/**
 * design-decisions.md "Reduced-Motion State Consistency Across In-Flight Animations": when
 * `prefers-reduced-motion` flips to reduce mid-animation, every currently in-flight animation
 * must snap immediately to its end state, not run to its originally-scheduled completion.
 *
 * `Document.getAnimations()` (Web Animations API) returns every animation currently in flight on
 * the page, whether started by `Element.animate()` or triggered by a CSS `transition`/
 * `@keyframes` rule -- which is why one call here (from MotionService's media-query `change`
 * listener) covers every component in the package without each one wiring its own listener.
 * `Animation.finish()` jumps the animation directly to its end state, exactly the mandated
 * behaviour (as opposed to `.cancel()`, which would revert to the *start* state).
 *
 * Exported as a standalone function (rather than inlined into MotionService) so it's testable
 * against a plain mocked `Document`-shaped object without booting Angular's DI.
 */
export function snapInFlightAnimations(doc: Pick<Document, 'getAnimations'>): void {
  if (typeof doc.getAnimations !== 'function') {
    return;
  }
  for (const animation of doc.getAnimations()) {
    try {
      animation.finish();
    } catch {
      // An infinitely-repeating animation (animation-iteration-count: infinite) has no end
      // state to jump to and throws on finish() -- nothing more we can do for it, so it's left
      // running; every animation this package itself authors is finite by construction.
    }
  }
}
