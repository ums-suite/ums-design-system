import type { BadgeVariant } from '../badge/badge.types';

export interface ToastMessage {
  readonly id: number;
  readonly message: string;
  readonly variant: BadgeVariant;
  readonly actionLabel?: string;
}

export interface ToastOptions {
  readonly variant?: BadgeVariant;
  readonly durationMs?: number;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}
