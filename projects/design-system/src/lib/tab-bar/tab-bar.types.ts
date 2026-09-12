import type { IconName } from '../icon/icon.component';

export interface TabBarItem {
  readonly label: string;
  readonly icon?: IconName;
  readonly disabled?: boolean;
}
