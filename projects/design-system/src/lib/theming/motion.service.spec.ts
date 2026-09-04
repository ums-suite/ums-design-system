import { TestBed } from '@angular/core/testing';
import { MotionService } from './motion.service';

describe('MotionService', () => {
  it('initializes prefersReducedMotion from the current media query state', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(MotionService);
    expect(service.prefersReducedMotion()).toBe(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  });

  it('flips prefersReducedMotion and snaps in-flight animations when the media query changes', () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const fakeMediaQueryList = {
      matches: false,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        changeListener = listener;
      },
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList;

    spyOn(window, 'matchMedia').and.callFake((query: string) =>
      query === '(prefers-reduced-motion: reduce)' ? fakeMediaQueryList : window.matchMedia(query),
    );
    const getAnimationsSpy = spyOn(document, 'getAnimations').and.returnValue([]);

    TestBed.configureTestingModule({});
    const service = TestBed.inject(MotionService);

    expect(service.prefersReducedMotion()).toBeFalse();
    expect(changeListener).toBeDefined();
    if (!changeListener) {
      throw new Error('expected MotionService to register a change listener');
    }

    changeListener({ matches: true } as MediaQueryListEvent);

    expect(service.prefersReducedMotion()).toBeTrue();
    expect(getAnimationsSpy).toHaveBeenCalled();
  });
});
