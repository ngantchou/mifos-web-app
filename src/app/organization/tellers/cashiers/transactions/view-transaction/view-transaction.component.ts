/** Angular Imports */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Cashier Transactions Component.
 */
@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss']
})

export class ViewTransactionDetailComponent implements OnInit {

   // Data sources for the tables
   transactionDataSource: MatTableDataSource<any>;
   billetageDataSource: MatTableDataSource<any>;

   // Columns to be displayed in the transaction table
   transactionDisplayedColumns: string[] = ['date', 'amount', 'refNo', 'accountId', 'clientName', 'depositName'];

   // Columns to be displayed in the billetage table
   billetageDisplayedColumns: string[] = ['denomination', 'count', 'amount','tellerCount', 'cashierCount', 'difference', 'status'];
   @ViewChild('printSection', { static: false }) printSection: ElementRef;

   transaction: any;
   billetageArray: any[] = [];

   constructor() { }

   ngOnInit(): void {
     // Mock transaction data
     this.transaction = {
       id: 1,
       txnDate: '2024-09-30T10:45:00',
       amount: 1500.00,
       refNo: 'TXN123456',
       accountId: '3021000000010',
       clientName: 'Ngantchou',
       depositName:'Ngantchou joel'
     };

     // Mock billetage data
     this.billetageArray = [
       { denomination_id: 100, count: 15, amount: 100*15, teller_count: 15, cashier_count: 14, difference: -1, status: 'Reconciled' },
       { denomination_id: 500, count: 20, amount: 500*20, teller_count: 20, cashier_count: 20, difference: 0, status: 'Reconciled' },
       { denomination_id: 1000, count: 5, amount: 1000*5, teller_count: 5, cashier_count: 5, difference: 0, status: 'Reconciled' }
     ];

     // Initialize the data sources
     this.transactionDataSource = new MatTableDataSource([this.transaction]);
     this.billetageDataSource = new MatTableDataSource(this.billetageArray);
   }
  // Method to fetch transaction details

  // Print receipt method
  printReceipt(): void {
    const printContent = this.printSection.nativeElement.innerHTML;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write('<html><head><title>Receipt</title>');
    WindowPrt.document.write('</head><body>');
    WindowPrt.document.write(printContent);
    WindowPrt.document.write('</body></html>');
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }
}
