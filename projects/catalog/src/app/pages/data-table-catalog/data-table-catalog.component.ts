import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UmsDataTableComponent, type DataTableColumn } from '@ums/design-system';

interface Applicant {
  readonly id: number;
  readonly name: string;
  readonly program: string;
  readonly score: number;
}

const PROGRAMS = ['Computer Science', 'Electrical Engineering', 'Business Administration'];

function buildApplicants(count: number): Applicant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Applicant ${index + 1}`,
    program: PROGRAMS[index % PROGRAMS.length],
    score: Math.round(((index * 37) % 61) + 40),
  }));
}

/**
 * DSYS-18 visual-regression / a11y target for DSYS-12's Data Table -- sorting, filtering, column
 * resize/pin, sticky header, row selection, and CDK-virtualized rendering (`ScrollingModule`)
 * over a 60-row dataset (large enough that most rows only ever exist in the DOM while scrolled
 * into view). Score is a tabular-numeral column (`numeric: true`, requirement-spec.md §4's
 * `.ums-tnum` utility). Includes a long-form Bengali applicant-name row (design-decisions.md
 * "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-data-table-catalog',
  standalone: true,
  imports: [UmsDataTableComponent],
  templateUrl: './data-table-catalog.component.html',
  styleUrl: './data-table-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableCatalogComponent {
  protected readonly columns: readonly DataTableColumn<Applicant>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, filterable: true },
    {
      id: 'program',
      header: 'Program',
      accessor: (row) => row.program,
      sortable: true,
      filterable: true,
      width: 220,
      pinned: 'start',
    },
    {
      id: 'score',
      header: 'Score',
      accessor: (row) => row.score,
      sortable: true,
      numeric: true,
      width: 100,
    },
  ];

  protected readonly rows = signal<readonly Applicant[]>(buildApplicants(60));
  protected readonly rowId = (row: Applicant): number => row.id;

  protected readonly bengaliRows = signal<readonly Applicant[]>([
    { id: 1001, name: 'মোহাম্মদ আব্দুল করিম মিয়া', program: 'Computer Science', score: 88 },
    { id: 1002, name: 'ফাতিমা খাতুন চৌধুরী', program: 'Business Administration', score: 76 },
  ]);

  protected lastSelection: readonly (string | number)[] = [];
  protected lastSort: unknown;
  protected lastFilter: Readonly<Record<string, string>> | undefined;

  protected onSelectionChange(selection: readonly (string | number)[]): void {
    this.lastSelection = selection;
  }

  protected onSortChange(sort: unknown): void {
    this.lastSort = sort;
  }

  protected onFilterChange(filter: Readonly<Record<string, string>>): void {
    this.lastFilter = filter;
  }
}
