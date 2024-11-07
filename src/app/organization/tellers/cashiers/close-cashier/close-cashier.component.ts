/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { DenominationComponent } from 'app/shared/denomination/denomination.component';
/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SessionDataService } from '../session-data.service';

/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-close-cashier',
  templateUrl: './close-cashier.component.html',
  styleUrls: ['./close-cashier.component.scss']
})
export class CloseCashierComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  sessionCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal : boolean;
  billetage:any = [];
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
              private sessionDataService: SessionDataService,
              private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;

    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    //console.log(this.cashierData)
    this.sessionCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      //'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'openingBalance': [{value: this.cashierData.cashierData.OpeningAmount, disabled: true}],
      'closingBalance': ['', Validators.required],
      'txnNote': ['', Validators.required]
    });
  }

  onTotalAmountChange(total: number) {
    this.calculatedTotal = total;
    const transactionAmount =  this.sessionCashForm.get('closingBalance')?.value;
    const totalDepositAmount = this.calculatedTotal;
    // Check if both fields are filled and if they match
    if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount != totalDepositAmount) {
       this.isMismatchTotal = true ; // Validation error
    }
  }

  onAmountInWordsChange(amountInWord: string) {

  }
  // This method receives the billetage array from the child component
  onBilletageChange(billetage: any[]): void {
    this.billetage = billetage;
    console.log('Billetage array received:', this.billetage);
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
      openingAmount: this.cashierData.cashierData.OpeningAmount,
      closingAmount: sessionCashFormData.closingBalance,
      currencyCode: sessionCashFormData.currencyCode,
      locale,
      startDate: sessionCashFormData.txnDate,  // already formatted above
      endDate: sessionCashFormData.txnDate,  // already formatted above
      dateFormat,
      description: "Closing cashier session",
      status: 0,  // Assuming status '1' means opening session
      billetage: this.billetage
    };
    const sessionData = this.sessionCashForm.value;

    // Call the service to open cashier session
    this.organizationService.closeCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data)
    .subscribe((response: any) => {
    this.sessionDataService.setSessionData(sessionData);

      this.router.navigate(['../report'], { relativeTo: this.route ,state: { sessionData: sessionData }});
    });
  }
}
