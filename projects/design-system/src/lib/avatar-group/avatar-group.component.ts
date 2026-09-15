import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UmsAvatarComponent } from '../avatar/avatar.component';
import type { AvatarSize } from '../avatar/avatar.types';
import type { AvatarGroupMember } from './avatar-group.types';

/**
 * DSYS-11 Avatar group -- a stack of overlapping Avatars (e.g. "who's enrolled in this course")
 * with a "+N" overflow badge once `members` exceeds `max`. The overflow badge carries its own
 * `aria-label` naming the hidden members so the truncation is not a silent loss of information
 * for a screen-reader user.
 */
@Component({
  selector: 'ums-avatar-group',
  standalone: true,
  imports: [UmsAvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-avatar-group', '[attr.data-size]': 'size()' },
})
export class UmsAvatarGroupComponent {
  readonly members = input<readonly AvatarGroupMember[]>([]);
  readonly max = input<number>(4);
  readonly size = input<AvatarSize>('md');

  protected readonly visibleMembers = computed(() => this.members().slice(0, this.max()));
  protected readonly overflowCount = computed(() =>
    Math.max(0, this.members().length - this.max()),
  );
  protected readonly overflowLabel = computed(() =>
    this.members()
      .slice(this.max())
      .map((member) => member.name)
      .join(', '),
  );
}
