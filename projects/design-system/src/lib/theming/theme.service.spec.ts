import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-register');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-register');
    localStorage.clear();
  });

  it('defaults to system mode and marketing register', () => {
    expect(service.mode()).toBe('system');
    expect(service.register()).toBe('marketing');
  });

  it('does not set a data-theme attribute while in system mode', () => {
    expect(document.documentElement.hasAttribute('data-theme')).toBeFalse();
  });

  it('setMode("dark") sets data-theme="dark" on <html> and resolves to dark', () => {
    service.setMode('dark');
    expect(service.resolvedTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setMode("light") sets data-theme="light" on <html> and resolves to light', () => {
    service.setMode('light');
    expect(service.resolvedTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setMode back to "system" removes the data-theme override', () => {
    service.setMode('dark');
    service.setMode('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBeFalse();
  });

  it('persists the explicit mode override across service instances (same-device fallback)', () => {
    service.setMode('dark');
    // Re-inject a fresh instance to simulate a reload -- TestBed keeps the same injector, so
    // construct one manually against localStorage instead.
    const fresh = TestBed.runInInjectionContext(() => new ThemeService());
    expect(fresh.mode()).toBe('dark');
  });

  it('setRegister("operational") sets data-register="operational" on <html>', () => {
    service.setRegister('operational');
    expect(document.documentElement.getAttribute('data-register')).toBe('operational');
  });

  it('resolveCssVar reads the live computed value of a token custom property', () => {
    document.documentElement.style.setProperty('--ums-test-token', '#123456');
    expect(service.resolveCssVar('--ums-test-token')).toBe('#123456');
    document.documentElement.style.removeProperty('--ums-test-token');
  });

  it('resolveCssVar reflects a value change on the next call (no caching)', () => {
    document.documentElement.style.setProperty('--ums-test-token', '#111111');
    expect(service.resolveCssVar('--ums-test-token')).toBe('#111111');
    document.documentElement.style.setProperty('--ums-test-token', '#222222');
    expect(service.resolveCssVar('--ums-test-token')).toBe('#222222');
    document.documentElement.style.removeProperty('--ums-test-token');
  });
});
