/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { SessionDataService } from '../session-data.service';
/* Component */
import { DenominationComponent } from 'app/shared/denomination/denomination.component';
/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-allocate-cash',
  templateUrl: './allocate-cash.component.html',
  styleUrls: ['./allocate-cash.component.scss']
})
export class AllocateCashComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  targetAccounts: { id: number; name: string }[] = [];
  columnCodes: any;
  /** Cashier Form. */
  allocateCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal: boolean;
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private systemService: SystemService,
    private sessionDataService: SessionDataService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { cashierTemplate: any, columnCodes: any }) => {
      // Set data once it is available from the route
      this.cashierData = data.cashierTemplate;
      this.columnCodes = data.columnCodes;

      // Initialize the form after the data is received
      this.allocateCashForm = this.formBuilder.group({
        office: [{ value: this.cashierData.officeName, disabled: true }],
        tellerName: [{ value: this.cashierData.tellerName, disabled: true }],
        cashier: [{ value: this.cashierData.cashierName, disabled: true }],
        assignmentPeriod: [{
          value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' +
                this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'),
          disabled: true
        }],
        txnDate: [new Date(), Validators.required],
        currencyCode: ['', Validators.required],
        txnAmount: ['', Validators.required],
        bankName: ['', Validators.required],
        bankAccount: ['', Validators.required],
        txnNote: ['', Validators.required]
      });
    });
  }

  ngOnInit() {
    let code = this.columnCodes.filter((cod: { name: string; }) => cod.name === "Banque");
    this.systemService.getCodeValues(code[0]!.id).subscribe((response: any) => {
      this.targetAccounts = response;
    });
    this.maxDate = this.settingsService.businessDate;
    //this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.allocateCashForm = this.formBuilder.group({
      'office': [{ value: this.cashierData.officeName, disabled: true }],
      'tellerName': [{ value: this.cashierData.tellerName, disabled: true }],
      'cashier': [{ value: this.cashierData.cashierName, disabled: true }],
      'assignmentPeriod': [{ value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true }],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'txnAmount': ['', Validators.required],
      'txnNote': ['', Validators.required],
      'bankName': ['', Validators.required],
      'bankAccount': ['', Validators.required],
    });
  }

  onTotalAmountChange(total: number) {
    this.calculatedTotal = total;
    const transactionAmount =  this.allocateCashForm.get('txnAmount')?.value;
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
   * Submits the Allocate Cash form.
   */
  submit() {
    const allocateCashFormData = this.allocateCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.allocateCashForm.value.txnDate;

    if (allocateCashFormData.txnDate instanceof Date) {
      allocateCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }

    const txnAmount = allocateCashFormData.txnAmount;
    const txnNote = allocateCashFormData.txnNote;

    const data = {
      txnAmount,
      txnNote,
      txnDate,
      dateFormat,
      locale,
      billetage: this.billetage
    };

    this.organizationService.allocateCash(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
      let bank = this.targetAccounts.find((cod: { id: number; }) => cod.id === allocateCashFormData.bankName);
      allocateCashFormData.sourceCashier = bank.name + '(' + allocateCashFormData.bankAccount + ')';
      allocateCashFormData.targetCashier = this.cashierData.tellerName + '(' + this.cashierData.cashierName + ')';
      this.sessionDataService.setSessionData(allocateCashFormData);
      this.router.navigate(['../cashier-receipt'], { relativeTo: this.route });
    });
  }
}
