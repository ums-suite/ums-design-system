import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsDataTableComponent } from './data-table.component';
import type { DataTableColumn, DataTableSelectionMode } from './data-table.types';

interface Applicant {
  readonly id: number;
  readonly name: string;
  readonly score: number;
}

const APPLICANTS: readonly Applicant[] = [
  { id: 1, name: 'Farida Rahman', score: 78 },
  { id: 2, name: 'Amit Chowdhury', score: 92 },
  { id: 3, name: 'Nusrat Jahan', score: 65 },
];

@Component({
  standalone: true,
  imports: [UmsDataTableComponent],
  template: `
    <ums-data-table
      [columns]="columns"
      [rows]="rows()"
      [rowId]="rowId"
      [selectionMode]="selectionMode()"
      [itemSizePx]="40"
      viewportHeight="200px"
      (selectionChange)="lastSelection = $event"
      (sortChange)="lastSort = $event"
      (filterChange)="lastFilter = $event"
    />
  `,
})
class HostComponent {
  readonly columns: DataTableColumn<Applicant>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, filterable: true },
    { id: 'score', header: 'Score', accessor: (row) => row.score, sortable: true, numeric: true },
  ];
  readonly rows = signal<readonly Applicant[]>(APPLICANTS);
  readonly rowId = (row: Applicant): number => row.id;
  readonly selectionMode = signal<DataTableSelectionMode>('multiple');

  lastSelection: readonly (string | number)[] | undefined;
  lastSort: unknown;
  lastFilter: Readonly<Record<string, string>> | undefined;
}

/**
 * Assertions here deliberately stop at this component's own computed state (sortedRows,
 * filteredRows, selection signals) and the immediately-rendered (non-virtualized) header/toolbar
 * DOM, rather than asserting on `cdk-virtual-scroll-viewport`'s rendered body-row DOM: CDK's
 * virtual-scroll viewport measures/renders via ResizeObserver + requestAnimationFrame, which
 * Karma/Jasmine's zone-based `fixture.whenStable()`/`fakeAsync` do not reliably flush -- the
 * resulting body-row assertions are flaky by construction, not a real signal of a bug. Full,
 * real-browser virtualized-row rendering (row count, tabular-numeral cell class, sort/filter
 * reflected in actual DOM order) is instead covered by e2e/data-table.spec.ts, which runs against
 * a real Playwright-driven Chromium with real frame timing.
 */
describe('UmsDataTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function tableInstance(): UmsDataTableComponent<Applicant> {
    return fixture.debugElement.query(By.directive(UmsDataTableComponent))
      .componentInstance as UmsDataTableComponent<Applicant>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a column header per configured column, plus the selection column', () => {
    const headers = fixture.debugElement.queryAll(By.css('[role="columnheader"]'));
    expect(headers.length).toBe(3);
    expect(headers[1].nativeElement.textContent).toContain('Name');
    expect(headers[2].nativeElement.textContent).toContain('Score');
  });

  it('computes every row as visible when no filter is active', () => {
    const table = tableInstance() as unknown as { sortedRows: () => readonly Applicant[] };
    expect(table.sortedRows().length).toBe(3);
  });

  it('sorts ascending then descending then back to unsorted on repeated header clicks', () => {
    const sortButtons = fixture.debugElement.queryAll(By.css('.ums-data-table__sort-button'));
    const scoreSortButton = sortButtons[1].nativeElement as HTMLButtonElement;
    const table = tableInstance() as unknown as { sortedRows: () => readonly Applicant[] };

    scoreSortButton.click();
    fixture.detectChanges();
    expect(host.lastSort).toEqual({ columnId: 'score', direction: 'asc' });
    expect(table.sortedRows().map((row) => row.score)).toEqual([65, 78, 92]);

    scoreSortButton.click();
    fixture.detectChanges();
    expect(host.lastSort).toEqual({ columnId: 'score', direction: 'desc' });
    expect(table.sortedRows().map((row) => row.score)).toEqual([92, 78, 65]);

    scoreSortButton.click();
    fixture.detectChanges();
    expect(host.lastSort).toBeNull();
    expect(table.sortedRows().map((row) => row.score)).toEqual([78, 92, 65]);
  });

  it('sets aria-sort on the active sort column header', () => {
    const sortButtons = fixture.debugElement.queryAll(By.css('.ums-data-table__sort-button'));
    (sortButtons[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('[role="columnheader"]'));
    expect(headers[2].nativeElement.getAttribute('aria-sort')).toBe('ascending');
  });

  it('filters rows once a column filter value is entered', () => {
    const filterToggle = fixture.debugElement.query(By.css('.ums-data-table__toolbar button'));
    (filterToggle.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const filterInput = fixture.debugElement.query(By.css('.ums-data-table__filter-input'))
      .nativeElement as HTMLInputElement;
    filterInput.value = 'Amit';
    filterInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.lastFilter).toEqual({ name: 'Amit' });
    const table = tableInstance() as unknown as { sortedRows: () => readonly Applicant[] };
    expect(table.sortedRows().map((row) => row.name)).toEqual(['Amit Chowdhury']);
  });

  it('toggles a single row selection and emits selectionChange', () => {
    const table = tableInstance() as unknown as {
      toggleRowSelection: (row: Applicant) => void;
      isSelected: (row: Applicant) => boolean;
    };
    table.toggleRowSelection(APPLICANTS[0]);
    fixture.detectChanges();

    expect(host.lastSelection).toEqual([1]);
    expect(table.isSelected(APPLICANTS[0])).toBeTrue();

    table.toggleRowSelection(APPLICANTS[0]);
    fixture.detectChanges();
    expect(host.lastSelection).toEqual([]);
  });

  it('select-all header checkbox selects and deselects every row', () => {
    const selectAll = fixture.debugElement.query(
      By.css('[role="columnheader"] input[type="checkbox"]'),
    ).nativeElement as HTMLInputElement;

    selectAll.click();
    fixture.detectChanges();
    expect(host.lastSelection?.length).toBe(3);

    selectAll.click();
    fixture.detectChanges();
    expect(host.lastSelection?.length).toBe(0);
  });

  it('single selection mode replaces the previous selection rather than accumulating', () => {
    host.selectionMode.set('single');
    fixture.detectChanges();
    const table = tableInstance() as unknown as { toggleRowSelection: (row: Applicant) => void };

    table.toggleRowSelection(APPLICANTS[0]);
    fixture.detectChanges();
    expect(host.lastSelection).toEqual([1]);

    table.toggleRowSelection(APPLICANTS[1]);
    fixture.detectChanges();
    expect(host.lastSelection).toEqual([2]);
  });

  it('shows the empty state when no rows match', () => {
    host.rows.set([]);
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('[data-testid="data-table-empty"]'));
    expect(empty).toBeTruthy();
  });
});
