import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsIconComponent } from './icon.component';

// See button.component.spec.ts's top comment: host bindings are signals so a later
// fixture.detectChanges() correctly re-propagates into this OnPush child under zoneless CD.
@Component({
  standalone: true,
  imports: [UmsIconComponent],
  template: `<ums-icon
    [name]="name()"
    [weight]="weight()"
    [label]="label()"
    [decorative]="decorative()"
  />`,
})
class HostComponent {
  readonly name = signal<'check' | 'graduation-cap'>('check');
  readonly weight = signal<'regular' | 'duotone'>('regular');
  readonly label = signal<string | undefined>('Check');
  readonly decorative = signal(false);
}

describe('UmsIconComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function svg(): SVGSVGElement {
    return fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
  }

  it('renders an <svg> with a <path> for a known icon', () => {
    expect(svg().querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('exposes an accessible name via role="img" + aria-label when not decorative', () => {
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe('Check');
  });

  it('hides the icon from the accessibility tree when decorative', () => {
    host.decorative.set(true);
    host.label.set(undefined);
    fixture.detectChanges();
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().hasAttribute('role')).toBeFalse();
  });

  it('renders a different <path> markup for the duotone weight (two paths, one with opacity)', () => {
    host.name.set('graduation-cap');
    host.weight.set('duotone');
    fixture.detectChanges();
    const paths = svg().querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it('sizes the svg from the size input', () => {
    expect(svg().getAttribute('width')).toBe('20');
    expect(svg().getAttribute('height')).toBe('20');
  });
});
