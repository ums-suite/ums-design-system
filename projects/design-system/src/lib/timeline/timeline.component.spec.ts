import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsTimelineComponent } from './timeline.component';
import type { TimelineEntry } from './timeline.types';

@Component({
  standalone: true,
  imports: [UmsTimelineComponent],
  template: `<ums-timeline [entries]="entries" />`,
})
class HostComponent {
  readonly entries: TimelineEntry[] = [
    { title: 'Application submitted', timestamp: '2026-01-04', status: 'info' },
    {
      title: 'Application approved',
      timestamp: '2026-01-10',
      status: 'success',
      description: 'Approved by the Admissions Committee.',
    },
  ];
}

describe('UmsTimelineComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders entries as an ordered list', () => {
    expect(fixture.debugElement.query(By.css('ol'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('li')).length).toBe(2);
  });

  it('renders the title, timestamp, and optional description as real text', () => {
    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items[0].nativeElement.textContent).toContain('Application submitted');
    expect(items[0].nativeElement.textContent).toContain('2026-01-04');
    expect(items[1].nativeElement.textContent).toContain('Approved by the Admissions Committee.');
  });

  it('renders a decorative status dot, not relying on color alone', () => {
    const dots = fixture.debugElement.queryAll(By.css('.ums-timeline__dot'));
    expect(dots[0].nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(dots[1].nativeElement.getAttribute('data-status')).toBe('success');
  });
});
