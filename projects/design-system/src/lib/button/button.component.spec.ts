import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsButtonComponent } from './button.component';
import type { ButtonVariant } from './button.types';

// Host-component bindings are signals rather than plain fields: in this workspace's zoneless
// Angular setup, mutating a plain class field used in a template expression does not notify
// the reactive graph, so a later fixture.detectChanges() would not re-propagate the new value
// into an OnPush child's input. A signal write does notify it correctly.
@Component({
  standalone: true,
  imports: [UmsButtonComponent],
  template: `
    <ums-button
      [variant]="variant()"
      [disabled]="disabled()"
      [loading]="loading()"
      [icon]="icon()"
      (click)="onClick()"
    >
      Save changes
    </ums-button>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly icon = signal<'check' | undefined>(undefined);
  clickCount = 0;

  onClick(): void {
    this.clickCount++;
  }
}

describe('UmsButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
  }

  function umsButtonHost(): HTMLElement {
    return fixture.debugElement.query(By.css('ums-button')).nativeElement as HTMLElement;
  }

  it('renders a native <button type="button"> so keyboard activation (Space/Enter) works for free', () => {
    const btn = nativeButton();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.type).toBe('button');
  });

  it('projects its content as the visible label', () => {
    expect(nativeButton().textContent).toContain('Save changes');
  });

  it('exposes the variant as a data-variant attribute for token-driven styling', () => {
    expect(umsButtonHost().getAttribute('data-variant')).toBe('primary');
    host.variant.set('danger');
    fixture.detectChanges();
    expect(umsButtonHost().getAttribute('data-variant')).toBe('danger');
  });

  it('fires a (click) handler on the host element when clicked (native bubbling)', () => {
    nativeButton().click();
    expect(host.clickCount).toBe(1);
  });

  it('disables the native button and blocks clicks when [disabled]', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    const btn = nativeButton();
    expect(btn.disabled).toBeTrue();
    btn.click();
    expect(host.clickCount).toBe(0);
  });

  it('disables the native button and sets aria-busy while [loading]', () => {
    host.loading.set(true);
    fixture.detectChanges();
    const btn = nativeButton();
    expect(btn.disabled).toBeTrue();
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('renders exactly one icon (the spinner, not the requested icon) while loading', () => {
    host.icon.set('check');
    host.loading.set(true);
    fixture.detectChanges();
    const icons = fixture.debugElement.queryAll(By.css('ums-icon'));
    expect(icons.length).toBe(1);
    expect(icons[0].nativeElement.querySelector('svg').getAttribute('width')).toBeTruthy();
  });

  it('renders the requested icon when not loading', () => {
    host.icon.set('check');
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('ums-icon'));
    expect(icon).toBeTruthy();
  });

  it('marks the icon inside the button as decorative (the visible label is the accessible name)', () => {
    host.icon.set('check');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
