import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import type { ResolvedTheme, ThemeMode, TypographyRegister } from './theme.types';

const THEME_STORAGE_KEY = 'ums-design-system:theme-mode';
const REGISTER_STORAGE_KEY = 'ums-design-system:typography-register';

/**
 * Theming engine (DSYS-5, requirement-spec.md §7).
 *
 * - Three modes -- light / dark / system -- with "system" driven by `prefers-color-scheme` and
 *   an explicit override that wins over it (§7). This service persists the override to
 *   `localStorage` as a same-device fallback; a consuming app that wants the "follows the user
 *   across all six SSO'd apps" behaviour (§7) should read the User's profile preference via
 *   Identity at bootstrap and call `setMode()` with it, and subscribe to `mode` to write changes
 *   back -- this package has no knowledge of Identity or the network, by design (§1 scope).
 * - Primitive -> semantic -> component token layering (§7) means this service never touches a
 *   component's styles directly: it only ever flips the `data-theme`/`data-register` attribute
 *   on <html>, and every token in tokens.css already has a rule for both attribute states (see
 *   tools/tokens/build-tokens.mjs). Theme-switching a component is therefore never a
 *   component-level code change.
 * - Every signal write here also applies the corresponding DOM attribute change synchronously,
 *   in the same method, rather than through an `effect()` -- an `effect()` is scheduled by
 *   Angular's reactivity graph and may not have flushed by the time a caller (or a test) next
 *   inspects the DOM, which is a correctness risk for something as immediately-visible as a
 *   theme flip.
 * - `resolveCssVar` is the mandated escape hatch for JS-computed color (design-decisions.md
 *   "Theme-Switch Transition Mechanism (Mid-Interaction Safety)"): any component that paints a
 *   color outside the CSS cascade (a <canvas> chart fill, an SVG attribute) MUST re-read the
 *   live custom property through this method whenever `resolvedTheme` changes, never cache a
 *   color resolved once at initial render. DSYS-16's chart wrapper is the primary future
 *   consumer; nothing in this pass paints outside the CSS cascade, so nothing needs it yet, but
 *   the mechanism has to exist now rather than be retrofitted later.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkMediaQuery =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly systemPrefersDark = signal<boolean>(this.darkMediaQuery?.matches ?? false);

  /** The user's explicit choice -- 'system' until they override it. */
  readonly mode = signal<ThemeMode>(this.readPersisted(THEME_STORAGE_KEY, 'system'));

  /** requirement-spec.md §2 Principle #4 -- see TypographyRegister. */
  readonly register = signal<TypographyRegister>(
    this.readPersisted(REGISTER_STORAGE_KEY, 'marketing'),
  );

  /** What actually paints, once 'system' is resolved against the live OS preference. */
  readonly resolvedTheme = signal<ResolvedTheme>(this.computeResolvedTheme());

  constructor() {
    this.applyThemeAttribute();
    this.applyRegisterAttribute();

    this.darkMediaQuery?.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
      if (this.mode() === 'system') {
        this.applyThemeAttribute();
      }
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.writePersisted(THEME_STORAGE_KEY, mode);
    this.applyThemeAttribute();
  }

  setRegister(register: TypographyRegister): void {
    this.register.set(register);
    this.writePersisted(REGISTER_STORAGE_KEY, register);
    this.applyRegisterAttribute();
  }

  /**
   * Reads a design token's live, currently-painted value straight off <html> -- e.g.
   * `resolveCssVar('--color-primary')`. Always reflects the *current* resolvedTheme, so calling
   * it again after a theme change returns the new value; nothing about it is cached.
   */
  resolveCssVar(cssVarName: string): string {
    return this.document.defaultView
      ? this.document.defaultView
          .getComputedStyle(this.document.documentElement)
          .getPropertyValue(cssVarName)
          .trim()
      : '';
  }

  private applyThemeAttribute(): void {
    const resolved = this.computeResolvedTheme();
    this.resolvedTheme.set(resolved);
    const root = this.document.documentElement;
    if (this.mode() === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', this.mode());
    }
  }

  private applyRegisterAttribute(): void {
    this.document.documentElement.setAttribute('data-register', this.register());
  }

  private computeResolvedTheme(): ResolvedTheme {
    const mode = this.mode();
    if (mode === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return mode;
  }

  private readPersisted<T extends string>(key: string, fallback: T): T {
    try {
      const stored = this.document.defaultView?.localStorage?.getItem(key);
      return (stored as T | null) ?? fallback;
    } catch {
      // localStorage can throw (private-browsing quota, disabled storage) -- fall back silently.
      return fallback;
    }
  }

  private writePersisted(key: string, value: string): void {
    try {
      this.document.defaultView?.localStorage?.setItem(key, value);
    } catch {
      // Best-effort only -- see readPersisted.
    }
  }
}
