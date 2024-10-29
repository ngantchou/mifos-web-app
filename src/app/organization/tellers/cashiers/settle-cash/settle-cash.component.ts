/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Customer Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { SessionDataService } from '../session-data.service';

@Component({
  selector: 'mifosx-settle-cash',
  templateUrl: './settle-cash.component.html',
  styleUrls: ['./settle-cash.component.scss']
})
export class SettleCashComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  columnCodes: any;
  /** Cashier Form. */
  settleCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal : boolean;
  targetAccounts: { id: number; name: string }[] = [];
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
              private systemService: SystemService,
              private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any,columnCodes: any}) => {
      this.cashierData = data.cashierTemplate;
      this.columnCodes = data.columnCodes;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    let code = this.columnCodes.filter((cod: { name: string; }) => cod.name === "Banque" );
    console.log(code[0])
    this.systemService.getCodeValues(code[0].id).subscribe((response: any) => {
      this.targetAccounts = response;
    });
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.settleCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'txnAmount': ['', Validators.required],
      'txnNote': ['-'],
      'bankName': ['', Validators.required],
      'bankAccount': ['', Validators.required],
      'bill10000': [0],
      'bill5000': [0],
      'bill2000': [0],
      'bill1000': [0],
      'coin500': [0],
      'coin200': [0],
      'coin100': [0],
      'coin50': [0],
      'coin25': [0],
    });
  }

  amountMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const transactionAmount = formGroup.get('txnAmount')?.value;
      const totalDepositAmount = this.calculatedTotal;

      // Check if both fields are filled and if they match
      if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount !== totalDepositAmount) {
        return { amountMismatch: true }; // Validation error
      }
      return null; // No validation error
    };
  }
  // Fonction pour calculer le total des billets et pièces FCFA
  calculateTotal() {
    const bill10000 = this.settleCashForm.get('bill10000').value || 0;
    const bill5000 = this.settleCashForm.get('bill5000').value || 0;
    const bill2000 = this.settleCashForm.get('bill2000').value || 0;
    const bill1000 = this.settleCashForm.get('bill1000').value || 0;

    const coin500 = this.settleCashForm.get('coin500').value || 0;
    const coin100 = this.settleCashForm.get('coin100').value || 0;
    const coin50 = this.settleCashForm.get('coin50').value || 0;
    const coin25 = this.settleCashForm.get('coin25').value || 0;

    // Calcul total en fonction des billets et pièces
    this.calculatedTotal = (bill10000 * 10000) + (bill5000 * 5000) +
                            (bill2000 * 2000) + (bill1000 * 1000) +
                            (coin500 * 500) + (coin100 * 100) +
                            (coin50 * 50) + (coin25 * 25);
    this.isMismatchTotal = this.calculatedTotal !== this.settleCashForm.get('txnAmount').value;
  }
  /**
   * Submits Settle Cash form.
   */
  submit() {
    const settleCashFormData = this.settleCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTxnDate: Date = this.settleCashForm.value.txnDate;
    const entity_type = this.settleCashForm.value.bankAccount;
    const entity_id = this.settleCashForm.value.bankName;
    if (settleCashFormData.txnDate instanceof Date) {
      settleCashFormData.txnDate = this.dateUtils.formatDate(prevTxnDate, dateFormat);
    }
    const txnDate = settleCashFormData.txnDate;
    const txnAmount = settleCashFormData.txnAmount;
    const txnNote = settleCashFormData.txnNote;
    // Prepare billetage array
    const billetage = [
      { denomination: 10000, count: settleCashFormData.bill10000, tellerCount: settleCashFormData.bill10000, cashierCount: settleCashFormData.bill10000, difference: 0 },
      { denomination: 5000, count: settleCashFormData.bill5000, tellerCount: settleCashFormData.bill5000, cashierCount: settleCashFormData.bill5000, difference: 0 },
      { denomination: 2000, count: settleCashFormData.bill2000, tellerCount: settleCashFormData.bill2000, cashierCount: settleCashFormData.bill2000, difference: 0 },
      { denomination: 1000, count: settleCashFormData.bill1000, tellerCount: settleCashFormData.bill1000, cashierCount: settleCashFormData.bill1000, difference: 0 },
      { denomination: 500, count: settleCashFormData.coin500, tellerCount: settleCashFormData.coin500, cashierCount: settleCashFormData.coin500, difference: 0 },
      { denomination: 100, count: settleCashFormData.coin100, tellerCount: settleCashFormData.coin100, cashierCount: settleCashFormData.coin100, difference: 0 },
      { denomination: 50, count: settleCashFormData.coin50, tellerCount: settleCashFormData.coin50, cashierCount: settleCashFormData.coin50, difference: 0 },
      { denomination: 25, count: settleCashFormData.coin25, tellerCount: settleCashFormData.coin25, cashierCount: settleCashFormData.coin25, difference: 0 },
    ];

    const data = {
      dateFormat,
      locale,
      billetage,
      txnAmount,
      txnDate,
      txnNote,
    };

    this.organizationService.settleCash(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
      let bank = this.targetAccounts.find((cod: { id: number; }) => cod.id === settleCashFormData.bankName );
      settleCashFormData.targetCashier = bank.name+'('+settleCashFormData.bankAccount+')';
      settleCashFormData.sourceCashier =  this.cashierData.tellerName+'('+this.cashierData.cashierName+')';
      this.sessionDataService.setSessionData(settleCashFormData);
      this.router.navigate(['../cashier-receipt'], {relativeTo: this.route});
    });
  }

}
