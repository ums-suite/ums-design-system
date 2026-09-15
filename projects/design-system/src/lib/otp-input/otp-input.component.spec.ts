import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsOtpInputComponent } from './otp-input.component';

@Component({
  standalone: true,
  imports: [UmsOtpInputComponent],
  template: `
    <ums-otp-input
      [length]="6"
      [value]="value()"
      (valueChange)="value.set($event)"
      (completed)="lastCompleted = $event"
    />
  `,
})
class HostComponent {
  readonly value = signal('');
  lastCompleted: string | undefined;
}

/** Focus-follow-up after a box change is deferred one microtask (see the component's class doc
 * on `focusBox`) -- await this after any interaction expected to move focus. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}

describe('UmsOtpInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function boxes(): HTMLInputElement[] {
    return fixture.debugElement
      .queryAll(By.css('.ums-otp-input__box'))
      .map((el) => el.nativeElement as HTMLInputElement);
  }

  async function typeDigit(index: number, digit: string): Promise<void> {
    const box = boxes()[index];
    box.value = digit;
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();
  }

  it('renders 6 boxes by default, all empty', () => {
    const allBoxes = boxes();
    expect(allBoxes.length).toBe(6);
    for (const box of allBoxes) {
      expect(box.value).toBe('');
    }
  });

  it('typing a digit fills the box and moves focus to the next one', async () => {
    await typeDigit(0, '1');
    expect(document.activeElement).toBe(boxes()[1]);
  });

  it('does not advance focus after typing the last box', async () => {
    for (let i = 0; i < 5; i++) await typeDigit(i, `${i + 1}`);
    await typeDigit(5, '6');
    // No error, and the value is fully populated -- there's simply no 7th box to move to.
    expect(host.value()).toBe('123456');
  });

  it('emits completed only once every box holds a real digit', async () => {
    await typeDigit(0, '1');
    expect(host.lastCompleted).toBeUndefined();

    for (let i = 1; i < 6; i++) await typeDigit(i, `${i + 1}`);
    expect(host.lastCompleted).toBe('123456');
  });

  it('Backspace on an empty box clears and focuses the previous box', async () => {
    await typeDigit(0, '1');
    await typeDigit(1, '2');
    // Box 2 is now focused and empty; Backspace should clear box 1 and move focus back to it.
    boxes()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    expect(boxes()[1].value).toBe('');
    expect(document.activeElement).toBe(boxes()[1]);
  });

  it('clearing a middle, already-filled box does not shift later digits', async () => {
    for (let i = 0; i < 6; i++) await typeDigit(i, `${i + 1}`);
    expect(host.value()).toBe('123456');

    // Simulate the browser's own Backspace-clears-a-filled-box behavior: the box's `input` event
    // fires with an empty value.
    const box2 = boxes()[2];
    box2.value = '';
    box2.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(boxes()[0].value).toBe('1');
    expect(boxes()[1].value).toBe('2');
    expect(boxes()[2].value).toBe('');
    expect(boxes()[3].value).toBe('4'); // unchanged position, not shifted to index 2
    expect(boxes()[4].value).toBe('5');
    expect(boxes()[5].value).toBe('6');
  });

  it('ArrowLeft/ArrowRight move focus between boxes', async () => {
    boxes()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();
    expect(document.activeElement).toBe(boxes()[1]);

    boxes()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();
    expect(document.activeElement).toBe(boxes()[2]);
  });

  it('pasting a full code distributes it across every box from the paste target', () => {
    const dataTransfer = { getData: () => '654321' } as unknown as DataTransfer;
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', { value: dataTransfer });
    boxes()[0].dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(host.value()).toBe('654321');
    expect(host.lastCompleted).toBe('654321');
  });

  it('typing multiple digits into one box (autofill-style) distributes them from that box', () => {
    const box = boxes()[0];
    box.value = '789';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(boxes()[0].value).toBe('7');
    expect(boxes()[1].value).toBe('8');
    expect(boxes()[2].value).toBe('9');
  });
});
