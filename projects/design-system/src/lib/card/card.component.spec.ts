import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsCardComponent } from './card.component';

@Component({
  standalone: true,
  imports: [UmsCardComponent],
  template: `
    <ums-card title="Recent Applications" subtitle="Last 7 days" data-testid="content-card">
      <p>42 new applications</p>
    </ums-card>
    <ums-card
      variant="stat"
      statLabel="Total Enrolled"
      statValue="12,480"
      statDelta="4.2% vs last term"
      statTrend="up"
      data-testid="stat-card"
    />
    <ums-card
      variant="profile"
      profileName="Dr. Farah Hossain"
      profileRole="Registrar"
      data-testid="profile-card"
    />
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsCardComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function card(testId: string) {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  it('renders a content-variant card with title/subtitle and projected body', () => {
    const el = card('content-card').nativeElement as HTMLElement;
    expect(el.textContent).toContain('Recent Applications');
    expect(el.textContent).toContain('Last 7 days');
    expect(el.textContent).toContain('42 new applications');
  });

  it('renders a stat-variant card with tabular-numeral value and an up-trend indicator', () => {
    const el = card('stat-card').nativeElement as HTMLElement;
    expect(el.textContent).toContain('Total Enrolled');
    expect(el.textContent).toContain('12,480');
    expect(card('stat-card').query(By.css('[data-trend="up"]'))).toBeTruthy();
  });

  it('renders a profile-variant card with an Avatar and name/role', () => {
    const el = card('profile-card').nativeElement as HTMLElement;
    expect(card('profile-card').query(By.css('ums-avatar'))).toBeTruthy();
    expect(el.textContent).toContain('Dr. Farah Hossain');
    expect(el.textContent).toContain('Registrar');
  });
});
