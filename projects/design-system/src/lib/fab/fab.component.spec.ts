import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsFabComponent } from './fab.component';

// See button.component.spec.ts's top comment: host bindings are signals so a later
// fixture.detectChanges() correctly re-propagates into this OnPush child under zoneless CD.
@Component({
  standalone: true,
  imports: [UmsFabComponent],
  template: `<ums-fab icon="plus" label="New application" [extendedLabel]="extendedLabel()" />`,
})
class HostComponent {
  readonly extendedLabel = signal<string | undefined>(undefined);
}

describe('UmsFabComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is icon-only with an aria-label by default', () => {
    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('New application');
    expect(fixture.debugElement.query(By.css('.ums-fab__label'))).toBeNull();
  });

  it('renders visible text and the extended host class when extendedLabel is set', () => {
    host.extendedLabel.set('New application');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.ums-fab__label'));
    expect(label.nativeElement.textContent.trim()).toBe('New application');
    const hostEl = fixture.debugElement.query(By.css('ums-fab')).nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ums-fab--extended')).toBeTrue();
  });
});
