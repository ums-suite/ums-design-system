import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { AvatarSize } from './avatar.types';

/**
 * DSYS-11 Avatar. Renders an image when `imageUrl` is provided; otherwise falls back to up to
 * two initials derived from `name`, then to a generic person icon if no name is given either.
 * The image always gets `alt=""` (decorative) because `name`/`label` -- rendered as the host's
 * own accessible name via `aria-label` -- is the real accessible identity, avoiding a duplicated
 * or conflicting announcement between the image and the surrounding label.
 */
@Component({
  selector: 'ums-avatar',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ums-avatar',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'name() ?? null',
    '[attr.role]': 'name() ? "img" : null',
  },
})
export class UmsAvatarComponent {
  readonly name = input<string | undefined>(undefined);
  readonly imageUrl = input<string | undefined>(undefined);
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => {
    const value = this.name()?.trim();
    if (!value) return '';
    const parts = value.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  });
}
