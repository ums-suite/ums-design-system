import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UmsEmptyStateComponent } from '../empty-state/empty-state.component';
import { UmsIconButtonComponent } from '../icon-button/icon-button.component';
import { UmsIconComponent } from '../icon/icon.component';
import type {
  DataTableColumn,
  DataTableSelectionMode,
  DataTableSortDirection,
  DataTableSortState,
} from './data-table.types';

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 80;
const MAX_COLUMN_WIDTH = 640;
const SELECTION_COLUMN_WIDTH = 44;

/**
 * DSYS-12 Data Table (requirement-spec.md §6: "sorting, filtering, column resize/pin, sticky
 * header, row selection, virtualized rendering... tabular-numeral columns"; §8 names it among
 * the densest surfaces needing reading-order verification).
 *
 * Deliberately built as an ARIA `table`/`rowgroup`/`row`/`columnheader`/`cell` grid of `<div>`s,
 * not a native `<table>`: virtualized rendering (CDK `ScrollingModule`/`cdk-virtual-scroll-
 * viewport`, per the ticket) only ever keeps the currently-visible row subset in the DOM, which
 * is incompatible with a native `<table>`'s all-rows-present layout algorithm. Column widths are
 * instead synchronized between the header and every body row via one shared CSS Grid
 * `grid-template-columns` string (`gridTemplateColumns()`), so header/body columns always align
 * pixel-for-pixel.
 *
 * **Sticky header, structurally, not via `position: sticky`:** the header row lives outside
 * `cdk-virtual-scroll-viewport` (which owns its own internal vertical scroll), so it never
 * scrolls out of view in the first place -- no sticky-positioning trick needed for the vertical
 * axis. The outer `.ums-data-table__scroll` wrapper owns horizontal overflow instead, scrolling
 * the header and viewport together as one unit; pinned columns (`column.pinned`) use
 * `position: sticky` with a computed inline-start/end offset against *that* wrapper so they stay
 * fixed during a horizontal scroll, the axis pinning actually addresses.
 *
 * **CDK/ARIA-table interop:** `cdk-virtual-scroll-viewport` inserts one internal
 * `.cdk-virtual-scroll-content-wrapper` element between itself and the rendered row `<div>`s,
 * which would otherwise break the required `rowgroup > row` direct-parent-child ARIA structure.
 * `ngAfterViewInit` tags that internal wrapper with `role="rowgroup"` directly (it's a single
 * persistent element CDK reuses across scroll positions, so this only needs to run once).
 *
 * Sorting/filtering are client-side by default (comparing/filtering the full `rows()` input),
 * mirroring `UmsComboboxComponent`'s own client-side-filter-with-escape-hatch-outputs pattern --
 * a consumer with server-side sorting/filtering/pagination can still drive this table by
 * ignoring the computed order and reacting to `(sortChange)`/`(filterChange)` instead.
 */
@Component({
  selector: 'ums-data-table',
  standalone: true,
  imports: [ScrollingModule, UmsIconComponent, UmsIconButtonComponent, UmsEmptyStateComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ums-data-table' },
})
export class UmsDataTableComponent<T> implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly rowId = input.required<(row: T) => string | number>();
  readonly rowAriaLabel = input<((row: T, index: number) => string) | undefined>(undefined);
  readonly selectionMode = input<DataTableSelectionMode>('none');
  readonly itemSizePx = input<number>(48);
  readonly viewportHeight = input<string>('420px');
  readonly emptyMessage = input<string>('No results');
  readonly caption = input<string | undefined>(undefined);

  readonly sortChange = output<DataTableSortState | null>();
  readonly filterChange = output<Readonly<Record<string, string>>>();
  readonly selectionChange = output<readonly (string | number)[]>();

  protected readonly sort = signal<DataTableSortState | null>(null);
  protected readonly filters = signal<Record<string, string>>({});
  protected readonly filtersOpen = signal(false);
  protected readonly columnWidths = signal<Record<string, number>>({});
  protected readonly selectedIds = signal<ReadonlySet<string | number>>(new Set());

  protected readonly hasFilterableColumn = computed(() =>
    this.columns().some((column) => column.filterable),
  );

  protected readonly filteredRows = computed<readonly T[]>(() => {
    const activeFilters = Object.entries(this.filters()).filter(([, value]) => value.trim());
    if (activeFilters.length === 0) return this.rows();
    const columnsById = new Map(this.columns().map((column) => [column.id, column]));
    return this.rows().filter((row) =>
      activeFilters.every(([columnId, needle]) => {
        const column = columnsById.get(columnId);
        if (!column) return true;
        const cellText = this.cellText(column, row).toLowerCase();
        return cellText.includes(needle.trim().toLowerCase());
      }),
    );
  });

  protected readonly sortedRows = computed<readonly T[]>(() => {
    const sortState = this.sort();
    const filtered = this.filteredRows();
    if (!sortState) return filtered;
    const column = this.columns().find((candidate) => candidate.id === sortState.columnId);
    if (!column) return filtered;

    const direction = sortState.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((rowA, rowB) => {
      const valueA = column.accessor(rowA);
      const valueB = column.accessor(rowB);
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * direction;
      }
      return String(valueA).localeCompare(String(valueB)) * direction;
    });
  });

  protected readonly gridTemplateColumns = computed<string>(() => {
    const widths = this.columnWidths();
    const tracks = this.columns().map(
      (column) => `${widths[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH}px`,
    );
    if (this.selectionMode() !== 'none') {
      tracks.unshift(`${SELECTION_COLUMN_WIDTH}px`);
    }
    return tracks.join(' ');
  });

  protected readonly allSelected = computed<boolean>(() => {
    const rows = this.sortedRows();
    return rows.length > 0 && rows.every((row) => this.selectedIds().has(this.rowId()(row)));
  });

  protected readonly someSelected = computed<boolean>(
    () => this.selectedIds().size > 0 && !this.allSelected(),
  );

  ngAfterViewInit(): void {
    const contentWrapper = this.elementRef.nativeElement.querySelector(
      '.cdk-virtual-scroll-content-wrapper',
    );
    contentWrapper?.setAttribute('role', 'rowgroup');
  }

  protected trackByRow = (_index: number, row: T): string | number => this.rowId()(row);

  protected cellText(column: DataTableColumn<T>, row: T): string {
    return column.formatter ? column.formatter(row) : String(column.accessor(row) ?? '');
  }

  protected ariaSortFor(column: DataTableColumn<T>): 'ascending' | 'descending' | 'none' {
    const sortState = this.sort();
    if (!column.sortable || sortState?.columnId !== column.id) return 'none';
    return sortState.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected pinOffset(column: DataTableColumn<T>): number | null {
    if (!column.pinned) return null;
    const widths = this.columnWidths();
    const selectionOffset = this.selectionMode() !== 'none' ? SELECTION_COLUMN_WIDTH : 0;
    const columns = this.columns();
    const index = columns.findIndex((candidate) => candidate.id === column.id);

    if (column.pinned === 'start') {
      let offset = selectionOffset;
      for (let i = 0; i < index; i++) {
        const candidate = columns[i];
        if (candidate.pinned === 'start') {
          offset += widths[candidate.id] ?? candidate.width ?? DEFAULT_COLUMN_WIDTH;
        }
      }
      return offset;
    }

    let offset = 0;
    for (let i = columns.length - 1; i > index; i--) {
      const candidate = columns[i];
      if (candidate.pinned === 'end') {
        offset += widths[candidate.id] ?? candidate.width ?? DEFAULT_COLUMN_WIDTH;
      }
    }
    return offset;
  }

  protected toggleSort(column: DataTableColumn<T>): void {
    if (!column.sortable) return;
    const current = this.sort();
    let next: DataTableSortState | null;
    if (current?.columnId !== column.id) {
      next = { columnId: column.id, direction: 'asc' };
    } else if (current.direction === 'asc') {
      next = { columnId: column.id, direction: 'desc' };
    } else {
      next = null;
    }
    this.sort.set(next);
    this.sortChange.emit(next);
  }

  protected sortDirectionLabel(direction: DataTableSortDirection): string {
    return direction === 'asc' ? 'ascending' : 'descending';
  }

  protected toggleFiltersOpen(): void {
    this.filtersOpen.update((open) => !open);
  }

  protected onFilterInput(columnId: string, value: string): void {
    const next = { ...this.filters(), [columnId]: value };
    this.filters.set(next);
    this.filterChange.emit(next);
  }

  protected onResizePointerDown(event: PointerEvent, column: DataTableColumn<T>): void {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.columnWidths()[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH;
    const minWidth = column.minWidth ?? MIN_COLUMN_WIDTH;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(MAX_COLUMN_WIDTH, Math.max(minWidth, startWidth + delta));
      this.columnWidths.update((widths) => ({ ...widths, [column.id]: nextWidth }));
    };
    const onPointerUp = (): void => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(this.rowId()(row));
  }

  protected toggleRowSelection(row: T): void {
    const id = this.rowId()(row);
    const mode = this.selectionMode();
    if (mode === 'none') return;

    if (mode === 'single') {
      const next = this.selectedIds().has(id) ? new Set<string | number>() : new Set([id]);
      this.selectedIds.set(next);
    } else {
      const next = new Set(this.selectedIds());
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      this.selectedIds.set(next);
    }
    this.selectionChange.emit([...this.selectedIds()]);
  }

  protected toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.sortedRows().map((row) => this.rowId()(row))));
    }
    this.selectionChange.emit([...this.selectedIds()]);
  }

  protected rowLabel(row: T, index: number): string {
    return this.rowAriaLabel()?.(row, index) ?? `Row ${index + 1}`;
  }
}
