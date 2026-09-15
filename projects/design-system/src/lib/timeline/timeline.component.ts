import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TimelineEntry } from './timeline.types';

/**
 * DSYS-11 Timeline -- an ordered audit-trail/status-history list (requirement-spec.md §6). Marked
 * up as an `<ol>` (a real ordered sequence, not decorative), each entry a `<li>` with a
 * semantically-colored status dot (reusing Badge's color vocabulary) that is purely visual --
 * the entry's own title/description text is the accessible content, never the dot's color alone.
 */
@Component({
  selector: 'ums-timeline',
  standalone: true,
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-timeline' },
})
export class UmsTimelineComponent {
  readonly entries = input<readonly TimelineEntry[]>([]);
}
