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
  billetage : any = [];
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
      });
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    let code = this.columnCodes.filter((cod: { name: string; }) => cod.name === "Banque" );
    console.log(code[0])
    this.systemService.getCodeValues(code[0].id).subscribe((response: any) => {
      this.targetAccounts = response;
    });
    //this.setCashierForm();
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
    });
  }
  onTotalAmountChange(total: number) {
    this.calculatedTotal = total;
    const transactionAmount =  this.settleCashForm.get('txnAmount')?.value;
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

    const data = {
      dateFormat,
      locale,
      billetage: this.billetage,
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
