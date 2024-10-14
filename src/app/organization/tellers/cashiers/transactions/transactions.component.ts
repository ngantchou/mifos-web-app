/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, UntypedFormControl } from '@angular/forms';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Cashier Transactions Component.
 */
@Component({
  selector: 'mifosx-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  /** Currency selector. */
  currencySelector = new UntypedFormControl();
  /** Cashier Id */
  cashierId: any;
  /** Teller Id */
  tellerId: any;
  /** Cashier data. */
  cashierData: any;
  /** Currencys data. */
  currencyData: any;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['date', 'transactions', 'allocation', 'cashIn', 'cashOut', 'settlement','action'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;
  /** Date filter form group */
  dateFilterForm: FormGroup;
  /** Paginator for transactions table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for transactions table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { currencies: any }) => {
      this.currencyData = data.currencies.selectedCurrencyOptions;
    });
    this.tellerId = this.route.parent.parent.parent.snapshot.params['id'];
    this.cashierId = this.route.parent.snapshot.params['id'];
    // Initialize the date filter form group
    this.dateFilterForm = new FormGroup({
      fromDate: new FormControl(new Date()),  // Default to today's date
      toDate: new FormControl(new Date())     // Default to today's date
    });
  }

  /**
   * Filters data in transactions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Retrieves transactions data on changing currency.
   */
  ngOnInit() {
    this.onFilterChange();
  }

  onFilterChange() {
    // Listen for changes in both currency and date range
    this.currencySelector.valueChanges.subscribe((currencyCode: any) => {
      this.fetchTransactions(currencyCode, this.dateFilterForm.value.fromDate, this.dateFilterForm.value.toDate);
    });

    // Listen for changes in the date filter form
    this.dateFilterForm.valueChanges.subscribe(values => {
      if (this.currencySelector.value) {
        this.fetchTransactions(this.currencySelector.value, values.fromDate, values.toDate);
      }
    });
  }

  fetchTransactions(currencyCode: string, fromDate: Date, toDate: Date): void {
    this.organizationService.getCashierSummaryAndTransactionsByDateRange(
      this.tellerId,
      this.cashierId,
      currencyCode,
      fromDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
      toDate.toISOString().split('T')[0]
    ).subscribe((response: any) => {
      this.cashierData = response;
      this.setTransactions();
    });
  }

  /**
   * Initializes the data source, paginator and sorter for transactions table.
   */
  setTransactions() {
    this.dataSource = new MatTableDataSource(this.cashierData.cashierTransactions.pageItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
