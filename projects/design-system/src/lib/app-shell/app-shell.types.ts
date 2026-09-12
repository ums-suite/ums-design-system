import type { IconName } from '../icon/icon.component';

/** requirement-spec.md §6 (Navigation): operational apps get a top bar + collapsible side nav; public-facing apps get a top bar + mega-menu. */
export type AppShellMode = 'operational' | 'public';

export interface AppShellNavItem {
  readonly label: string;
  readonly icon?: IconName;
  readonly href?: string;
  readonly active?: boolean;
  /** Public-mode mega-menu items only -- a top-level item with children renders a dropdown panel. */
  readonly children?: readonly AppShellNavItem[];
}
