import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsIconButtonComponent } from './icon-button.component';

// See button.component.spec.ts's top comment: host bindings are signals so a later
// fixture.detectChanges() correctly re-propagates into this OnPush child under zoneless CD.
@Component({
  standalone: true,
  imports: [UmsIconButtonComponent],
  template: `<ums-icon-button
    icon="trash"
    label="Delete row"
    [disabled]="disabled()"
    (click)="onClick()"
  />`,
})
class HostComponent {
  readonly disabled = signal(false);
  clickCount = 0;
  onClick(): void {
    this.clickCount++;
  }
}

describe('UmsIconButtonComponent', () => {
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

  it('requires and applies an aria-label since there is no visible text', () => {
    expect(nativeButton().getAttribute('aria-label')).toBe('Delete row');
  });

  it('renders the requested icon, marked decorative (aria-label already gives the name)', () => {
    const svg = fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('fires (click) on activation and is blocked when disabled', () => {
    nativeButton().click();
    expect(host.clickCount).toBe(1);

    host.disabled.set(true);
    fixture.detectChanges();
    expect(nativeButton().disabled).toBeTrue();
    nativeButton().click();
    expect(host.clickCount).toBe(1);
  });
});
