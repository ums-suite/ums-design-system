import type { IconName } from '../icon/icon.component';

/** requirement-spec.md §6 (Navigation): "Command Palette (⌘K/Ctrl+K quick navigation and actions)". */
export interface CommandPaletteItem {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: IconName;
  /** A display-only hint, e.g. "G then D" -- not itself a bound keyboard shortcut. */
  readonly shortcutHint?: string;
  /** Extra terms matched during filtering but never displayed (aliases, synonyms). */
  readonly keywords?: readonly string[];
}
