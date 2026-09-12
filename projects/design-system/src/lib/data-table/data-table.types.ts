/** requirement-spec.md §6 (Data Display): "Data Table... sorting... column resize/pin". */
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableSortState {
  readonly columnId: string;
  readonly direction: DataTableSortDirection;
}

/** 'single' renders a radio-like exclusive selection; 'multiple' adds a header select-all. */
export type DataTableSelectionMode = 'none' | 'single' | 'multiple';

/** Logical edge (RTL-readiness posture, requirement-spec.md §8), not left/right. */
export type DataTableColumnPin = 'start' | 'end';

export interface DataTableColumn<T> {
  readonly id: string;
  readonly header: string;
  readonly accessor: (row: T) => unknown;
  /** Renders the cell's display text; defaults to `String(accessor(row))`. */
  readonly formatter?: (row: T) => string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  /** Applies the `.ums-tnum` tabular-figure utility (requirement-spec.md §4) to this column. */
  readonly numeric?: boolean;
  readonly width?: number;
  readonly minWidth?: number;
  readonly pinned?: DataTableColumnPin;
}
