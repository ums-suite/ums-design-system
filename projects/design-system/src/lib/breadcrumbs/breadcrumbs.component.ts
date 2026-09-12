import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UmsIconComponent } from '../icon/icon.component';
import type { BreadcrumbItem } from './breadcrumbs.types';

/**
 * DSYS-11 Breadcrumbs. A `<nav aria-label="Breadcrumb">` containing an ordered list
 * (`<ol>`) per the WAI-ARIA breadcrumb pattern; the last item renders as the current page
 * (`aria-current="page"`, not a link) regardless of whether the caller supplied an `href` for
 * it, since a breadcrumb never links to itself.
 */
@Component({
  selector: 'ums-breadcrumbs',
  standalone: true,
  imports: [UmsIconComponent],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-breadcrumbs' },
})
export class UmsBreadcrumbsComponent {
  readonly items = input<readonly BreadcrumbItem[]>([]);

  /** Emitted when a non-final crumb (a real link) is activated, so a consumer can navigate. */
  readonly itemClick = output<BreadcrumbItem>();

  protected readonly lastIndex = computed(() => this.items().length - 1);

  protected onItemClick(event: Event, item: BreadcrumbItem): void {
    event.preventDefault();
    this.itemClick.emit(item);
  }
}
