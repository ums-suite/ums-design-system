import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsSplitButtonComponent } from './split-button.component';

// See button.component.spec.ts's top comment: host bindings are signals so a later
// fixture.detectChanges() correctly re-propagates into this OnPush child under zoneless CD.
@Component({
  standalone: true,
  imports: [UmsSplitButtonComponent],
  template: `
    <ums-split-button
      groupLabel="Publish result"
      triggerLabel="More publish options"
      [expanded]="expanded()"
      menuId="publish-menu"
      (primaryClick)="onPrimary()"
      (toggleClick)="onToggle()"
    >
      Publish
    </ums-split-button>
  `,
})
class HostComponent {
  readonly expanded = signal(false);
  primaryClicks = 0;
  toggleClicks = 0;
  onPrimary(): void {
    this.primaryClicks++;
  }
  onToggle(): void {
    this.toggleClicks++;
  }
}

describe('UmsSplitButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function primaryBtn(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-split-button__primary'))
      .nativeElement as HTMLButtonElement;
  }

  function triggerBtn(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.ums-split-button__trigger'))
      .nativeElement as HTMLButtonElement;
  }

  it('wraps both buttons in a labelled group', () => {
    const group = fixture.debugElement.query(By.css('[role="group"]')).nativeElement as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Publish result');
  });

  it('emits primaryClick and toggleClick independently', () => {
    primaryBtn().click();
    expect(host.primaryClicks).toBe(1);
    expect(host.toggleClicks).toBe(0);

    triggerBtn().click();
    expect(host.primaryClicks).toBe(1);
    expect(host.toggleClicks).toBe(1);
  });

  it('exposes menu affordance ARIA on the trigger only', () => {
    const trigger = triggerBtn();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-controls')).toBe('publish-menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    host.expanded.set(true);
    fixture.detectChanges();
    expect(triggerBtn().getAttribute('aria-expanded')).toBe('true');
  });

  it('projects content into the primary action', () => {
    expect(primaryBtn().textContent).toContain('Publish');
  });
});
