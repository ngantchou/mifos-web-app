import { Component, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

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
    private dateUtils: Dates,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.sessionData = data.cashierTemplate;
    });
  }
  calculateTotal(): number {
    const {
      bill10000, bill5000, bill2000, bill1000,
      coin500, coin100, coin50, coin25
    } = this.sessionData;

    return (
      bill10000 * 10000 +
      bill5000 * 5000 +
      bill2000 * 2000 +
      bill1000 * 1000 +
      coin500 * 500 +
      coin100 * 100 +
      coin50 * 50 +
      coin25 * 25
    );
  }

  get difference(): number {
    return this.calculateTotal() - this.sessionData.closingBalance;
  }
}
