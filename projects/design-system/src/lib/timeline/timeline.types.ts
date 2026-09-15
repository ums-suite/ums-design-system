import type { BadgeVariant } from '../badge/badge.types';

/** requirement-spec.md §6 (Data Display): "Timeline (audit trail, status history)". */
export interface TimelineEntry {
  readonly title: string;
  readonly timestamp: string;
  readonly description?: string;
  /** Reuses Badge's semantic vocabulary so a status-history dot means the same thing everywhere. */
  readonly status?: BadgeVariant;
}
