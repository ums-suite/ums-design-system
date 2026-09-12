import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsAppShellComponent } from './app-shell.component';
import type { AppShellMode, AppShellNavItem } from './app-shell.types';

@Component({
  standalone: true,
  imports: [UmsAppShellComponent],
  template: `
    <ums-app-shell [mode]="mode()" [navItems]="navItems" (navItemClick)="clicked = $event">
      <span umsAppShellBrand>UMS</span>
      <p>Page content</p>
    </ums-app-shell>
  `,
})
class HostComponent {
  readonly mode = signal<AppShellMode>('operational');
  readonly navItems: AppShellNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    {
      label: 'Admissions',
      children: [
        { label: 'Applications', href: '/admissions/applications' },
        { label: 'Offers', href: '/admissions/offers' },
      ],
    },
  ];
  clicked: AppShellNavItem | undefined;
}

describe('UmsAppShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a collapsible side nav in operational mode', () => {
    expect(fixture.debugElement.query(By.css('.ums-app-shell__side-nav'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ums-app-shell__collapse-toggle'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ums-app-shell__mega-nav'))).toBeNull();
  });

  it('collapses the side nav when the toggle is clicked', () => {
    const toggle = fixture.debugElement.query(By.css('.ums-app-shell__collapse-toggle'))
      .nativeElement as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(
      fixture.debugElement
        .query(By.css('.ums-app-shell__side-nav'))
        .nativeElement.classList.contains('ums-app-shell__side-nav--collapsed'),
    ).toBeTrue();
  });

  it('projects page content', () => {
    expect(fixture.debugElement.query(By.css('main')).nativeElement.textContent).toContain(
      'Page content',
    );
  });

  it('renders a mega-nav with a dropdown panel in public mode', () => {
    host.mode.set('public');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ums-app-shell__mega-nav'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ums-app-shell__side-nav'))).toBeNull();

    const trigger = fixture.debugElement.query(By.css('button.ums-app-shell__mega-trigger'))
      .nativeElement as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('[role="menu"]'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.textContent).toContain('Applications');
  });

  it('closes an open mega-menu on Escape', () => {
    host.mode.set('public');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button.ums-app-shell__mega-trigger')).nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="menu"]'))).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="menu"]'))).toBeNull();
  });

  it('emits navItemClick when a nav link is activated', () => {
    const link = fixture.debugElement.query(By.css('.ums-app-shell__side-nav-link'))
      .nativeElement as HTMLAnchorElement;
    link.click();
    fixture.detectChanges();
    expect(host.clicked?.label).toBe('Dashboard');
  });
});
