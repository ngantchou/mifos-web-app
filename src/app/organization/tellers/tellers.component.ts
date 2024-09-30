/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

/** rxjs Imports */
import { debounceTime } from 'rxjs/operators';

/**
 * Tellers component.
 */
@Component({
  selector: 'mifosx-tellers',
  templateUrl: './tellers.component.html',
  styleUrls: ['./tellers.component.scss']
})
export class TellersComponent implements OnInit {

  /** Columns to be displayed in tellers table. */
  displayedColumns: string[] = ['officeName', 'name', 'status', 'startDate', 'actions'];
  /** Data source for tellers table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tellers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for tellers table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the tellers data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {}

  /**
   * Filters data in tellers table based on passed value with debounce.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    of(filterValue)
      .pipe(debounceTime(300))  // Debounce to prevent excessive filter calls
      .subscribe(value => {
        this.dataSource.filter = value.trim().toLowerCase();
      });
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.route.data.subscribe((data: { tellers: any }) => {
      if (data?.tellers) {
        this.dataSource = new MatTableDataSource(data.tellers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
}
