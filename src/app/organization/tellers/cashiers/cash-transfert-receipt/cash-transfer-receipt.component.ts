import { Component, Input } from '@angular/core';
import { SessionDataService } from '../session-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-cash-transfer-receipt',
  templateUrl: './cash-transfer-receipt.component.html',
  styleUrls: ['./cash-transfer-receipt.component.scss']
})
export class CashTransferReceiptComponent {

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

  // Method to print the receipt
  printReceipt() {
    const printContents = document.getElementById('receipt-section').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  }
}
