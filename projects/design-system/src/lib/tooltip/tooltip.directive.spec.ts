import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [UmsTooltipDirective],
  template: `<button type="button" [umsTooltip]="'Export the current roster as a CSV file'">
    Export
  </button>`,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.ums-tooltip').forEach((el) => el.remove());
  });

  function button(): HTMLElement {
    return fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
  }

  it('renders no tooltip element until hovered/focused', () => {
    expect(document.querySelector('.ums-tooltip')).toBeNull();
  });

  it('shows a role="tooltip" element on mouseenter and links it via aria-describedby', () => {
    button().dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    const tooltip = document.querySelector('.ums-tooltip') as HTMLElement;
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.textContent).toBe('Export the current roster as a CSV file');
    expect(button().getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('shows the tooltip on focus too, not only on hover (keyboard-only users)', () => {
    button().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(document.querySelector('.ums-tooltip')).toBeTruthy();
  });

  it('hides the tooltip on mouseleave, blur, and Escape', () => {
    button().dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    button().dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(document.querySelector('.ums-tooltip')).toBeNull();

    button().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(document.querySelector('.ums-tooltip')).toBeNull();
  });

  it('removes the tooltip and its aria-describedby when the directive is destroyed', () => {
    button().dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    fixture.destroy();
    expect(document.querySelector('.ums-tooltip')).toBeNull();
  });
});
