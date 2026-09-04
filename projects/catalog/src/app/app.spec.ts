import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the catalog heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('UMS Design System Catalog');
  });

  it('renders the Button, Icon, and Asset catalog sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="button-catalog"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="icon-catalog"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="asset-catalog"]')).toBeTruthy();
  });

  it('switches theme mode via the theme toggle', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const darkToggle = compiled.querySelector<HTMLButtonElement>(
      '[data-testid="theme-toggle-dark"]',
    );
    darkToggle?.click();
    fixture.detectChanges();

    expect(darkToggle?.getAttribute('aria-pressed')).toBe('true');
  });
});
