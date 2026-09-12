import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsSkeletonComponent } from './skeleton.component';

@Component({
  standalone: true,
  imports: [UmsSkeletonComponent],
  template: `
    <ums-skeleton variant="circle" width="40px" height="40px" data-testid="skeleton-circle" />
    <ums-skeleton variant="text" [lines]="3" data-testid="skeleton-text" />
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsSkeletonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('is decorative (aria-hidden) since it carries no real content', () => {
    const circle = fixture.debugElement.query(By.css('[data-testid="skeleton-circle"]'));
    expect(circle.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies explicit width/height for circle/rect variants', () => {
    const circle = fixture.debugElement.query(By.css('[data-testid="skeleton-circle"]'))
      .nativeElement as HTMLElement;
    expect(circle.style.inlineSize).toBe('40px');
    expect(circle.style.blockSize).toBe('40px');
  });

  it('renders `lines` separate bars for the text variant, the last one narrower', () => {
    const lines = fixture.debugElement
      .query(By.css('[data-testid="skeleton-text"]'))
      .queryAll(By.css('.ums-skeleton__line'));
    expect(lines.length).toBe(3);
    expect((lines[2].nativeElement as HTMLElement).style.inlineSize).toBe('60%');
  });
});
