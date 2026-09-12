import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsCommandPaletteComponent } from './command-palette.component';
import type { CommandPaletteItem } from './command-palette.types';

const ITEMS: readonly CommandPaletteItem[] = [
  { id: 'go-dashboard', label: 'Go to Dashboard', group: 'Navigate', keywords: ['home'] },
  { id: 'go-students', label: 'Go to Students', group: 'Navigate' },
  { id: 'new-notice', label: 'Create Notice', group: 'Actions' },
];

@Component({
  standalone: true,
  imports: [UmsCommandPaletteComponent],
  template: `
    <button type="button" data-testid="external-trigger">Somewhere else</button>
    <ums-command-palette
      [open]="open()"
      [items]="items"
      (openRequested)="open.set(true)"
      (closed)="open.set(false)"
      (commandSelected)="lastSelected = $event"
    />
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly items = ITEMS;
  lastSelected: string | undefined;
}

describe('UmsCommandPaletteComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function searchInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('.ums-command-palette__input'))
      .nativeElement as HTMLInputElement;
  }

  function optionLabels(): string[] {
    return fixture.debugElement
      .queryAll(By.css('[role="option"]'))
      .map((el) => (el.nativeElement as HTMLElement).textContent?.trim() ?? '');
  }

  it('is not rendered while closed', () => {
    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).toBeNull();
  });

  it('opens on Ctrl+K fired anywhere in the document and focuses the search input', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    fixture.detectChanges();

    expect(host.open()).toBeTrue();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeTruthy();
    expect(document.activeElement).toBe(searchInput());
  });

  it('also opens on Cmd+K (metaKey)', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    fixture.detectChanges();
    expect(host.open()).toBeTrue();
  });

  it('renders every item grouped, in order, when the query is empty', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(optionLabels()).toEqual(['Go to Dashboard', 'Go to Students', 'Create Notice']);
  });

  it('filters items by label, group, and keyword as the query changes', () => {
    host.open.set(true);
    fixture.detectChanges();

    searchInput().value = 'notice';
    searchInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(optionLabels()).toEqual(['Create Notice']);

    searchInput().value = 'home';
    searchInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(optionLabels()).toEqual(['Go to Dashboard']);
  });

  it('announces the live result count for screen readers', () => {
    host.open.set(true);
    fixture.detectChanges();
    const liveRegion = fixture.debugElement.query(By.css('[aria-live="polite"]'))
      .nativeElement as HTMLElement;
    expect(liveRegion.textContent).toContain('3 results');

    searchInput().value = 'notice';
    searchInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(liveRegion.textContent).toContain('1 result');
  });

  it('ArrowDown/ArrowUp move the active option and Enter selects it', () => {
    host.open.set(true);
    fixture.detectChanges();

    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.lastSelected).toBe('new-notice');
    expect(host.open()).toBeFalse();
  });

  it('shows the configured empty-results message when nothing matches', () => {
    host.open.set(true);
    fixture.detectChanges();
    searchInput().value = 'no-such-command';
    searchInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ums-command-palette__empty'))).toBeTruthy();
  });

  it('closes on Escape and restores focus to the element that had it before opening', () => {
    const trigger = fixture.debugElement.query(By.css('[data-testid="external-trigger"]'))
      .nativeElement as HTMLButtonElement;
    trigger.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    fixture.detectChanges();
    expect(host.open()).toBeTrue();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(host.open()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
  });

  it('a second Ctrl+K while open closes the palette', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    fixture.detectChanges();
    expect(host.open()).toBeTrue();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    fixture.detectChanges();
    expect(host.open()).toBeFalse();
  });
});
