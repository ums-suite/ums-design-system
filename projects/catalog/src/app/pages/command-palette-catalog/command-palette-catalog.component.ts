import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UmsCommandPaletteComponent, type CommandPaletteItem } from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for DSYS-14's Command Palette. Triggerable both via
 * the real Ctrl+K/Cmd+K global shortcut (the component's own document-level listener) and a
 * plain button, so the e2e suite can exercise either path. Includes a long-form Bengali item
 * label (design-decisions.md "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-command-palette-catalog',
  standalone: true,
  imports: [UmsCommandPaletteComponent],
  templateUrl: './command-palette-catalog.component.html',
  styleUrl: './command-palette-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteCatalogComponent {
  protected readonly items: readonly CommandPaletteItem[] = [
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      group: 'Navigate',
      icon: 'grid-four',
      keywords: ['home'],
    },
    { id: 'go-students', label: 'Go to Students', group: 'Navigate', icon: 'student' },
    { id: 'new-notice', label: 'Create Notice', group: 'Actions', icon: 'file-text' },
    {
      id: 'bn-item',
      label: 'শিক্ষার্থী ভর্তি আবেদনপত্রের তালিকা দেখুন',
      group: 'Actions',
      icon: 'clipboard-text',
    },
  ];

  protected readonly open = signal(false);
  protected readonly lastSelected = signal<string | undefined>(undefined);

  protected openPalette(): void {
    this.open.set(true);
  }

  protected closePalette(): void {
    this.open.set(false);
  }

  protected onCommandSelected(id: string): void {
    this.lastSelected.set(id);
  }
}
