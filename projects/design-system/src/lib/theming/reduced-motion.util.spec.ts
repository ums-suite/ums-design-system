import { snapInFlightAnimations } from './reduced-motion.util';

describe('snapInFlightAnimations', () => {
  it('calls finish() on every animation returned by document.getAnimations()', () => {
    const finishA = jasmine.createSpy('finish');
    const finishB = jasmine.createSpy('finish');
    const fakeDoc = {
      getAnimations: () => [{ finish: finishA }, { finish: finishB }] as unknown as Animation[],
    };

    snapInFlightAnimations(fakeDoc);

    expect(finishA).toHaveBeenCalled();
    expect(finishB).toHaveBeenCalled();
  });

  it('does not throw if one animation cannot finish (e.g. an infinite animation)', () => {
    const finishOk = jasmine.createSpy('finish');
    const fakeDoc = {
      getAnimations: () =>
        [
          {
            finish: () => {
              throw new Error('cannot finish an infinitely-repeating animation');
            },
          },
          { finish: finishOk },
        ] as unknown as Animation[],
    };

    expect(() => snapInFlightAnimations(fakeDoc)).not.toThrow();
    expect(finishOk).toHaveBeenCalled();
  });

  it('is a no-op when getAnimations is unavailable', () => {
    expect(() => snapInFlightAnimations({} as Pick<Document, 'getAnimations'>)).not.toThrow();
  });
});
