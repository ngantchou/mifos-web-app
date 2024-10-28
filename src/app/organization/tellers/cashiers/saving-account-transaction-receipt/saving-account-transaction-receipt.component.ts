// advans-receipt.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionDataService } from '../session-data.service';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'saving-account-transaction-receipt',
  templateUrl: './saving-account-transaction-receipt.component.html',
  styleUrls: ['./saving-account-transaction-receipt.component.scss']
})
export class SavingAccountTransactionReceiptComponent {

  receiptData: any;

  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private sessionDataService: SessionDataService,
    private router: Router) {

    // Retrieve the session data from the service
    this.receiptData = this.sessionDataService.getSessionData();
    console.log(this.receiptData)
    // Redirect if no session data is available (e.g., page refresh)
    if (!this.receiptData) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  receiptData1 = {
    receiptNumber: '14247',
    date: '21/10/2024',
    time: '17:11',
    agency: {
      name: 'AKWA',
      cashierNumber: '103',
      accountNumber: '005001388444',
      clientName: 'CHEUDJUI NGAKO BLAISE',
      agencyCode: '00120',
      amount: 150000,
      taxes: 0,
      stamp: 0,
      depositorName: 'NGANTCHOU'
    },
    transaction: {
      cashierName: 'MTAYO',
      clientKey: '0',
      managerCode: '361TAYO DJOMO MARCEL',
      currency: 'XAF',
      description: 'REGLEMENT LOYER',
      amountInWords: 'cent cinquante mille'
    },
    paymentDetails: {
      noteValue: 10000,
      billsReceived: '0015',
      amountReceived: 150000,
      billsReturned: '',
      amountReturned: 0
    }
  };

  // Table columns definition for mat-table
  displayedColumns: string[] = ['notes', 'billsReceived', 'amountReceived', 'billsReturned', 'amountReturned'];
  // Add the printReceipt method
  @ViewChild('receiptContent', { static: false }) receiptContent!: ElementRef;

  // This ensures the ViewChild is available after the view initializes
  ngAfterViewInit() {
    if (!this.receiptContent) {
      console.error('Receipt content is not available.');
    }
  }
  getType(type:string){
    return type === "deposit" ? "Versement" : "Retrait";
  }
  printComponent() {
    if (this.receiptContent) {
      const printContent = this.receiptContent.nativeElement.innerHTML;
      const windowPrint = window.open('', '', 'width=800,height=600');

      windowPrint?.document.write(`
        <html>
        <head>
          <title>Print Receipt</title>
          <style>
            /* General print styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 12px;
              color: #000;
            }

            /* Specific styles for your receipt content */
            .receipt {
              border: 1px solid #000;
              padding: 10px;
              margin-bottom: 10px;
            }

            .header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            }

            .items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }

            .items th, .items td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }

            .items th {
              background-color: #f2f2f2;
            }

            .totals {
              text-align: right;
              font-size: 12px;
              font-weight: bold;
            }

            /* Hide buttons and other interactive elements */
            .no-print {
              display: none;
            }
            @media print {
              .receipt-card {
                width: 100%;
                padding: 0;
                margin: 0;
                border: none;
                box-shadow: none;
                font-family: Arial, sans-serif;
              }

              .header-section {
                font-weight: bold;
                font-size: 10pt;
                display: flex;
                justify-content: space-between;
              }

              .title-section {
                text-align: center;
                font-weight: bold;
                font-size: 10pt;
                margin-bottom: 10px;
              }

              .details-section {
                margin-bottom: 13px;
                font-size: 8pt;
                border-collapse: collapse;
              }

              .mat-list-item {
                padding: 2px 0;
                line-break: strict;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              table, th, td {
                border: 1px solid black;
              }

              th, td {
                text-align: left;
                padding: 8px;
              }

              .totals-card {
                margin-top: 15px;
                font-size: 10pt;
                text-align: right;
                padding: 10px;
              }

              .signature-block {
                margin-top: 20px;
              }
              .signature-line {
                border-bottom: 1px solid #666;
                margin-top: 40px;
                border-top: 1px solid black;
              }

              .footer-section {
                text-align: center;
                font-size: 8pt;
              }
              /* Break the second receipt onto a new page */
              .receipt + .receipt {
                page-break-before: always;
              }
            }

            /* Print-specific media query */
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }

              .receipt {
                 width: 95%;
                // page-break-after: always;
              }
              .details-section {
                display: block;
                margin: 0;
                padding: 0;
              }

              .details-section mat-list {
                list-style-type: none; /* Remove bullets */
                padding: 0; /* Remove padding */
              }

              .details-section mat-list-item {
                border: none; /* Remove dividers for print */
                margin: 0; /* Remove margin */
                padding: 5px 0; /* Add some spacing */
                font-size: 12pt; /* Adjust font size for better readability */
              }

              .details-section mat-divider {
                display: none; /* Hide dividers when printing */
              }
            }

          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt">
            ${printContent}
          </div>
          <div class="receipt">
            ${printContent}
          </div>
        </body>
        </html>
      `);
      windowPrint?.document.close();
    } else {
      console.error('Receipt content not found.');
    }
  }
}
