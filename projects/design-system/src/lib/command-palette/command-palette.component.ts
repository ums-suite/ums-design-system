import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import { focusPanel, trapTabKey } from '../overlay/focus-trap.util';
import type { CommandPaletteItem } from './command-palette.types';

let nextCommandPaletteId = 0;

interface CommandPaletteGroup {
  readonly group: string | undefined;
  readonly items: readonly CommandPaletteItem[];
}

/**
 * DSYS-14 Command Palette (requirement-spec.md §6: "⌘K/Ctrl+K quick navigation and actions"; §8
 * names it among the ARIA-verified components).
 *
 * Controlled component, the same contract as Modal/Drawer (DSYS-15): `[open]` in,
 * `(openRequested)`/`(closed)` out -- this component never flips its own `open` state, it only
 * asks. The global Ctrl+K/Cmd+K listener lives here (not in each consuming app) because the
 * shortcut *is* this component's defining feature; it fires `(openRequested)` when closed, or
 * requests a close when already open (a second Ctrl+K toggles it shut, a common palette
 * convention), and always calls `preventDefault()` so it doesn't fall through to the browser's
 * own bookmark shortcut.
 *
 * Focus trap/restore-on-close reuses `overlay/focus-trap.util.ts` (`focusPanel`/`trapTabKey`) --
 * the exact same mechanism and `ngAfterViewChecked`-based (not `effect()`-based) open-detection
 * as `UmsModalComponent`/`UmsDrawerComponent`; see either's class doc for why `effect()` is
 * deliberately avoided for focus timing.
 *
 * Implements the WAI-ARIA "listbox with a combobox-style filter input" pattern: the input owns
 * `aria-activedescendant` pointing at the current `role="option"`, ArrowUp/ArrowDown/Home/End
 * move it, Enter activates it, and a visually-hidden `aria-live="polite"` region announces the
 * live result count on every keystroke -- a screen-reader user gets the same "3 results" feedback
 * a sighted user gets from the visible list shrinking.
 */
@Component({
  selector: 'ums-command-palette',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-command-palette',
    '(document:keydown)': 'onGlobalKeydown($event)',
    '(document:keydown.escape)': 'onDocumentEscape()',
  },
})
export class UmsCommandPaletteComponent implements AfterViewChecked {
  private readonly instanceId = `ums-command-palette-${++nextCommandPaletteId}`;
  private previouslyFocused: HTMLElement | null = null;
  private wasOpen = false;

  readonly open = input(false, { transform: booleanAttribute });
  readonly items = input.required<readonly CommandPaletteItem[]>();
  readonly placeholder = input<string>('Search commands...');
  readonly noResultsText = input<string>('No matching commands');
  readonly label = input<string>('Command palette');

  readonly openRequested = output();
  readonly closed = output();
  readonly commandSelected = output<string>();

  protected readonly titleId = `${this.instanceId}-label`;
  protected readonly listboxId = `${this.instanceId}-listbox`;
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly filteredItems = computed<readonly CommandPaletteItem[]>(() => {
    const needle = this.query().trim().toLowerCase();
    if (!needle) return this.items();
    return this.items().filter((item) => {
      const haystack = [item.label, item.group, ...(item.keywords ?? [])]
        .filter((value): value is string => !!value)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  });

  protected readonly groupedItems = computed<readonly CommandPaletteGroup[]>(() => {
    const groups: CommandPaletteGroup[] = [];
    for (const item of this.filteredItems()) {
      const last = groups[groups.length - 1];
      if (last && last.group === item.group) {
        (last.items as CommandPaletteItem[]).push(item);
      } else {
        groups.push({ group: item.group, items: [item] });
      }
    }
    return groups;
  });

  protected readonly activeItemId = computed<string | undefined>(() => {
    const items = this.filteredItems();
    const index = this.activeIndex();
    return index >= 0 && index < items.length ? this.optionId(items[index].id) : undefined;
  });

  ngAfterViewChecked(): void {
    const isOpen = this.open();
    if (isOpen && !this.wasOpen) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      this.query.set('');
      this.activeIndex.set(0);
      const input = this.inputRef()?.nativeElement;
      if (input) {
        input.focus();
      } else {
        const panel = this.panelRef()?.nativeElement;
        if (panel) focusPanel(panel);
      }
    }
    this.wasOpen = isOpen;
  }

  protected optionId(itemId: string): string {
    return `${this.instanceId}-option-${itemId}`;
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (!isShortcut) return;
    event.preventDefault();
    if (this.open()) {
      this.requestClose();
    } else {
      this.openRequested.emit();
    }
  }

  protected onDocumentEscape(): void {
    if (this.open()) {
      this.requestClose();
    }
  }

  protected onBackdropClick(): void {
    this.requestClose();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const panel = this.panelRef()?.nativeElement;
    if (panel) trapTabKey(panel, event);
  }

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const count = this.filteredItems().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((index) => (count === 0 ? -1 : Math.min(index + 1, count - 1)));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((index) => (count === 0 ? -1 : Math.max(index - 1, 0)));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(count === 0 ? -1 : 0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(count - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const active = this.filteredItems()[this.activeIndex()];
        if (active) this.selectItem(active);
        break;
      }
      // Escape is handled once, at the document level (onDocumentEscape) -- see its own comment.
    }
  }

  protected selectItem(item: CommandPaletteItem): void {
    this.commandSelected.emit(item.id);
    this.requestClose();
  }

  protected isActive(item: CommandPaletteItem): boolean {
    return this.filteredItems()[this.activeIndex()]?.id === item.id;
  }

  private requestClose(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
    this.closed.emit();
  }
}
