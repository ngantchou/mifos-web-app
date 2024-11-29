import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SessionDataService } from '../session-data.service';

@Component({
  selector: 'mifosx-close-cashier',
  templateUrl: './close-cashier.component.html',
  styleUrls: ['./close-cashier.component.scss']
})
export class CloseCashierComponent implements OnInit {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  cashierData: any;
  sessionCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal: boolean = false;
  billetage: any[] = [];
  currencyCode = 'XAF'; // Default currency code
  totalAmount: number = 0;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private sessionDataService: SessionDataService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
    this.calculateTotalAmount(); // Calculate total amount
  }

  setCashierForm() {
    this.sessionCashForm = this.formBuilder.group({
      office: [{ value: this.cashierData.officeName, disabled: true }],
      tellerName: [{ value: this.cashierData.tellerName, disabled: true }],
      cashier: [{ value: this.cashierData.cashierName, disabled: true }],
      txnDate: [new Date(), Validators.required],
      currencyCode: ['', Validators.required],
      openingBalance: [{ value: this.cashierData.cashierData.OpeningAmount, disabled: true }],
      closingBalance: ['', Validators.required],
      txnNote: ['', Validators.required]
    });
  }

  // onTotalAmountChange(total: number) {
  //   this.calculatedTotal = total;
  //   const transactionAmount = this.sessionCashForm?.get('closingBalance')?.value;
  //   this.isMismatchTotal = transactionAmount !== null && total !== transactionAmount;
  // }

  calculateTotalAmount(): number {
    this.totalAmount = this.billetage.reduce((sum: number, item: any) => {
      return sum + item.denomination * item.count;
    }, 0);

    const closingBalanceControl = this.sessionCashForm?.get('closingBalance');
    this.isMismatchTotal = closingBalanceControl ? this.totalAmount != closingBalanceControl.value : false;
    //this.onTotalAmountChange(this.totalAmount);
    return this.totalAmount;
  }

  handleBilletageChange(billetage: any[]) {
    this.billetage = billetage || [];
    this.calculateTotalAmount();
  }

  onBilletageChange(billetage: any[]): void {
    this.billetage = billetage || [];
    this.calculateTotalAmount();
  }

  submit() {
    const sessionCashFormData = this.sessionCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = sessionCashFormData.txnDate;

    if (txnDate instanceof Date) {
      sessionCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }

    const data = {
      cashierId: this.cashierData.cashierId,
      openingAmount: this.cashierData.cashierData.OpeningAmount,
      closingAmount: sessionCashFormData.closingBalance,
      currencyCode: sessionCashFormData.currencyCode,
      locale,
      startDate: sessionCashFormData.txnDate,
      endDate: sessionCashFormData.txnDate,
      dateFormat,
      description: "Closing cashier session",
      status: 0,
      sessionCashFormData: sessionCashFormData,
      billetage: this.billetage
    };

    this.organizationService.closeCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data)
      .subscribe((response: any) => {
        this.sessionDataService.setSessionData(data);
        this.router.navigate(['../report'], {
          relativeTo: this.route,
          state: { sessionData: sessionCashFormData }
        });
      });
  }
}
