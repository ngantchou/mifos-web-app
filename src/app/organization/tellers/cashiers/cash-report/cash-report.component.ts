import { Component, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SessionDataService } from '../session-data.service';

@Component({
  selector: 'app-cash-report',
  templateUrl: './cash-report.component.html',
  styleUrls: ['./cash-report.component.scss']
})
export class CashReportComponent {
  @Input() sessionData: any;
  cashierData: any;

  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private sessionDataService: SessionDataService,
    private router: Router) {

    // Retrieve the session data from the service
    this.cashierData = this.sessionDataService.getSessionData();


    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.sessionData = data.cashierTemplate;
    });
    this.sessionData.billetage = this.cashierData;

    // Redirect if no session data is available (e.g., page refresh)
    if (!this.cashierData) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  calculateTotal(): number {
    const billetage = this.sessionData.billetage;
    const total = (billetage.bill10000 * 10000) +
    (billetage.bill5000 * 5000) +
    (billetage.bill2000 * 2000) +
    (billetage.bill1000 * 1000) +
    (billetage.coin500 * 500) +
    (billetage.coin200 * 200) +
    (billetage.coin100 * 100) +
    (billetage.coin50 * 50);
    return total;
  }

  get difference(): number {
    return this.calculateTotal() - this.sessionData.billetage.closingBalance;
  }

  printReport(): void {
    const printContent = document.querySelector('.printable-area')?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent; // Replace the body content with the component content
      window.print(); // Trigger the print dialog
      document.body.innerHTML = originalContent; // Restore the original content after printing
    }
  }
}
