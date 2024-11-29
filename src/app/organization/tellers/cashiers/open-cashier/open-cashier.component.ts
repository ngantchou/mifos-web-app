/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import {  UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/* Component */
import { Billetage } from 'app/shared/billetage/billetage.component';
/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-close-cashier',
  templateUrl: './open-cashier.component.html',
  styleUrls: ['./open-cashier.component.scss']
})
export class OpenCashierComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  totalBilletage: number = 0;
  sessionCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal : boolean;
  billetage:any = [];
  currencyCode = 'XAF'; // Or your desired currency code
  totalAmount: number = 0;
  /**
   * Get cashier data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route ActivateRoute.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private dateUtils: Dates,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
    this.calculateTotalAmount(); // Calculate total amount

  }

  calculateTotalAmount(): number {
    this.totalAmount = this.billetage.reduce((sum: number, item: any) => {
      return sum + item.denomination * item.count;
    }, 0);

    const closingBalanceControl = this.sessionCashForm?.get('openingBalance');
    this.isMismatchTotal = closingBalanceControl ? this.totalAmount != closingBalanceControl.value : false;
    //this.onTotalAmountChange(this.totalAmount);
    return this.totalAmount;
  }

  handleBilletageChange(billetage: Billetage[]) {
    this.billetage = billetage;
    console.log('Billetage data:', this.billetage);
    this.calculateTotalAmount();
  }
  // This method receives the billetage array from the child component
  onBilletageChange(billetage: any[]): void {
    this.billetage = billetage || [];
    this.calculateTotalAmount();
  }
  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.sessionCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'openingBalance': [this.cashierData.cashierData.ClosingAmount, Validators.required],
      'closingBalance': [''],
      'txnNote': ['', Validators.required]
    });
  }

  /**
   * Submits open Cash form.
   */
  submit() {

    const sessionCashFormData = this.sessionCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = sessionCashFormData.txnDate;

    // Format transaction date
    if (txnDate instanceof Date) {
      sessionCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }

    // Prepare the data object
    const data = {
      cashierId: this.cashierData.cashierId,
      openingAmount: sessionCashFormData.openingBalance,
      currencyCode: sessionCashFormData.currencyCode,
      locale,
      startDate: sessionCashFormData.txnDate,  // already formatted above
      dateFormat,
      description: "Opening cashier session",
      status: 1,  // Assuming status '1' means opening session
      billetage:this.billetage
    };

    // Call the service to open cashier session
    this.organizationService.openCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
