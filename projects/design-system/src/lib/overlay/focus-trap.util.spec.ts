import { focusPanel, getFocusableElements, trapTabKey } from './focus-trap.util';

describe('focus-trap.util', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="first">First</button>
      <input id="middle" />
      <button id="last">Last</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('getFocusableElements lists every visible focusable descendant in DOM order', () => {
    const elements = getFocusableElements(container);
    expect(elements.map((el) => el.id)).toEqual(['first', 'middle', 'last']);
  });

  it('focusPanel focuses the first focusable descendant', () => {
    focusPanel(container);
    expect(document.activeElement?.id).toBe('first');
  });

  it('focusPanel focuses the panel itself when it has no focusable descendants', () => {
    const empty = document.createElement('div');
    empty.tabIndex = -1;
    document.body.appendChild(empty);
    focusPanel(empty);
    expect(document.activeElement).toBe(empty);
    empty.remove();
  });

  it('trapTabKey wraps Tab from the last element back to the first', () => {
    const last = container.querySelector('#last') as HTMLElement;
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    trapTabKey(container, event);
    expect(document.activeElement?.id).toBe('first');
    expect(event.defaultPrevented).toBeTrue();
  });

  it('trapTabKey wraps Shift+Tab from the first element back to the last', () => {
    const first = container.querySelector('#first') as HTMLElement;
    first.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    trapTabKey(container, event);
    expect(document.activeElement?.id).toBe('last');
  });

  it('ignores keys other than Tab', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    trapTabKey(container, event);
    expect(event.defaultPrevented).toBeFalse();
  });
});
