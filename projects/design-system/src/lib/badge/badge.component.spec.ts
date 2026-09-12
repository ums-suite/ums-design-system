import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsBadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [UmsBadgeComponent],
  template: `
    <ums-badge variant="success">Approved</ums-badge>
    <ums-badge variant="danger" size="sm">Overdue</ums-badge>
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsBadgeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects the label as real text (never color-only signalling)', () => {
    const badges = fixture.debugElement.queryAll(By.css('ums-badge'));
    expect(badges[0].nativeElement.textContent.trim()).toBe('Approved');
    expect(badges[1].nativeElement.textContent.trim()).toBe('Overdue');
  });

  it('exposes the variant and size as host attributes for token-driven styling', () => {
    const [success, danger] = fixture.debugElement.queryAll(By.css('ums-badge'));
    expect(success.nativeElement.getAttribute('data-variant')).toBe('success');
    expect(success.nativeElement.getAttribute('data-size')).toBe('md');
    expect(danger.nativeElement.getAttribute('data-variant')).toBe('danger');
    expect(danger.nativeElement.getAttribute('data-size')).toBe('sm');
  });
});
