/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/* Component */
import { DenominationComponent } from 'app/shared/denomination/denomination.component';
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
  status: 'open' | 'close';  // Define status for opening or closing
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
    this.status = 'open';
    this.setCashierForm();
  }

  // Bill denominations (notes)
  billsData = [
    { denomination: 10000 },
    { denomination: 5000 },
    { denomination: 2000 },
    { denomination: 1000 },
    { denomination: 500 }
  ];

  // Small coins (optional)
  coinsData = [
    { denomination: 500 },
    { denomination: 100 },
    { denomination: 50 },
    { denomination: 25 },
    { denomination: 10 },
    { denomination: 5 },
    { denomination: 2 },
    { denomination: 1 }
  ];

  // Bill denominations (notes)
  allDenominations = [
    { denomination: 10000 , count: 0 },
    { denomination: 5000 , count: 0 },
    { denomination: 2000 , count: 0 },
    { denomination: 1000 , count: 0 },
    { denomination: 500 , count: 0 },
    { denomination: 100 , count: 0 },
    { denomination: 50 , count: 0 },
    { denomination: 25 , count: 0 },
    { denomination: 10 , count: 0 },
    { denomination: 5 , count: 0 },
    { denomination: 2 , count: 0 },
    { denomination: 1 , count: 0 }
  ];

  onTotalAmountChange(total: number) {
    this.calculatedTotal = total;
    const transactionAmount =  this.sessionCashForm.get('openingBalance')?.value;
    const totalDepositAmount = this.calculatedTotal;
    // Check if both fields are filled and if they match
    if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount != totalDepositAmount) {
       this.isMismatchTotal = true ; // Validation error
    }
  }

  onAmountInWordsChange(amountInWord: string) {

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
      'bill10000': [0],
      'bill5000': [0],
      'bill2000': [0],
      'bill1000': [0],
      'coin500': [0],
      'coin200': [0],
      'coin100': [0],
      'coin50': [0],
      'txnNote': ['', Validators.required]
    });
  }

  amountMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const transactionAmount = formGroup.get('openingBalance')?.value;
      const totalDepositAmount = this.calculatedTotal;
      console.log(totalDepositAmount,transactionAmount)
      // Check if both fields are filled and if they match
      if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount != totalDepositAmount) {
        return { amountMismatch: true }; // Validation error
      }
      return null; // No validation error
    };
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

    // Prepare billetage array
    let billetage:any = [];

    this.allDenominations.forEach(coin => {
      const numberControl = this.sessionCashForm.get('numberOfBills_' + coin.denomination).value;
      const totalControl = this.sessionCashForm.get('totalAmount_' + coin.denomination).value;
      // Listen to changes in the number of coins and update the total
      if (numberControl > 0 && numberControl != null && numberControl !== undefined) {
        billetage.push(
          { denomination: coin.denomination, count: numberControl, tellerCount: numberControl, cashierCount: numberControl, difference: 0 },
        )
      }
    });
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
      billetage
    };

    // Call the service to open cashier session
    this.organizationService.openCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
