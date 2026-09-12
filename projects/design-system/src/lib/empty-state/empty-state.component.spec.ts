import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsEmptyStateComponent } from './empty-state.component';

@Component({
  standalone: true,
  imports: [UmsEmptyStateComponent],
  template: `
    <ums-empty-state title="No applications yet" description="New applications will appear here.">
      <button type="button">Invite applicants</button>
    </ums-empty-state>
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsEmptyStateComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders the title, description, and a decorative illustration', () => {
    const host = fixture.debugElement.query(By.css('ums-empty-state')).nativeElement as HTMLElement;
    expect(host.textContent).toContain('No applications yet');
    expect(host.textContent).toContain('New applications will appear here.');
    const asset = fixture.debugElement.query(By.css('ums-asset'));
    expect(asset.attributes['decorative']).toBeDefined();
  });

  it('projects a primary action slot', () => {
    const action = fixture.debugElement.query(By.css('button'));
    expect(action.nativeElement.textContent).toContain('Invite applicants');
  });
});
