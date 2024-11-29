// savings-account-transactions.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup,UntypedFormControl, UntypedFormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Custums } from 'app/core/utils/custom';
import { SessionDataService } from 'app/organization/tellers/cashiers/session-data.service';
import { Billetage } from 'app/shared/billetage/billetage.component'; // Import Billetage interface

@Component({
  selector: 'mifosx-savings-transactions',
  templateUrl: './savings-account-transactions.component.html',
  styleUrls: ['./savings-account-transactions.component.scss']
})
export class SavingsAccountTransactionsComponent implements OnInit, OnDestroy {

  @Input() currencyCode: string;

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();

  /** Form */
  savingAccountTransactionForm: UntypedFormGroup;

  paymentTypeOptions: {
    id: number,
    name: string,
    description: string,
    isCashPayment: boolean,
    position: number
  }[];

  /** State */
  addPaymentDetailsFlag = false;
  isDeposit = false;
  transactionType: { deposit: boolean, withdrawal: boolean } = { deposit: false, withdrawal: false };
  transactionCommand: string;
  savingAccountId: string;
  totalAmountInWords = '';
  totalDepositAmount = 0;
  depositNam = '-';
  billetageData: Billetage[] = []; // To store billetage data from child component

  /** Display */
  sourcesOfFundsOptions = [
    'Salaire',
    'Recette',
    'Economie',
    'Tontine',
    'Autres'
  ];

  /** Cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private customUtils: Custums,
    private savingsService: SavingsService,
    private sessionDataService: SessionDataService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.paymentTypeOptions = data.savingsAccountActionData.paymentTypeOptions;
    });

    this.transactionCommand = this.route.snapshot.params['name'].toLowerCase();
    this.isDeposit = this.transactionCommand === 'deposit';
    this.depositNam = this.isDeposit ? '' : '-';
    this.transactionType[this.transactionCommand] = true;
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.initializeForm();
    this.setupPaymentTypes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.savingAccountTransactionForm = this.formBuilder.group({
      transactionDate: [this.settingsService.businessDate, Validators.required],
      transactionAmount: [0, [Validators.required, Validators.min(0)]],
      paymentTypeId: [''],
      totalDepositAmount: [{ value: 0, disabled: true }],
      amountInWords: [{ value: '', disabled: true }],
      sourceOfFunds: this.formBuilder.array(
        this.sourcesOfFundsOptions.map(() => this.formBuilder.control(false))
      ),
      depositName: [this.depositNam, Validators.required],
      note: ['']
    }, { validators: this.amountMatchValidator() });
  }

  private setupPaymentTypes() {
    this.paymentTypeOptions = this.paymentTypeOptions.filter(pt => pt.name === 'Cash');
    this.savingAccountTransactionForm.get('paymentTypeId')?.setValue(this.paymentTypeOptions[0]?.id);
  }

  // Method to handle billetage data from the child component
  handleBilletageChange(billetage: Billetage[]) {
    this.billetageData = billetage;

    // Calculate total deposit amount from billetage data
    this.totalDepositAmount = this.billetageData.reduce((sum, item) => sum + (item.count * item.denomination), 0);
    this.savingAccountTransactionForm.get('totalDepositAmount')?.setValue(this.totalDepositAmount);

    const totalInWords = this.customUtils.numberToWordsFr(this.totalDepositAmount);
    this.savingAccountTransactionForm.get('amountInWords')?.setValue(totalInWords);
    this.totalAmountInWords = totalInWords;

    // Validate against transaction amount
    const transactionAmount = this.savingAccountTransactionForm.get('transactionAmount')?.value;
    if (transactionAmount && this.totalDepositAmount !== transactionAmount) {
      this.savingAccountTransactionForm.setErrors({ amountMismatch: true });
    } else {
      this.savingAccountTransactionForm.setErrors(null);
    }
  }

  amountMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const transactionAmount = formGroup.get('transactionAmount')?.value;
      const totalDepositAmount = formGroup.get('totalDepositAmount')?.value;

      if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount !== totalDepositAmount) {
        return { amountMismatch: true };
      }
      return null;
    };
  }

  getSourceOfFundCheckedValues(): string {
    const sourceOfFundsArray = this.savingAccountTransactionForm.get('sourceOfFunds') as FormArray;
    return this.sourcesOfFundsOptions
      .filter((_, i) => sourceOfFundsArray.at(i).value)
      .join(', ');
  }

  addPaymentDetails() {
    this.addPaymentDetailsFlag = !this.addPaymentDetailsFlag;
    const paymentFields = ['accountNumber', 'checkNumber', 'routingCode', 'receiptNumber', 'bankNumber'];

    if (this.addPaymentDetailsFlag) {
      paymentFields.forEach(field => {
        this.savingAccountTransactionForm.addControl(field, new UntypedFormControl(''));
      });
    } else {
      paymentFields.forEach(field => {
        this.savingAccountTransactionForm.removeControl(field);
      });
    }
  }

  submit() {
    if (this.savingAccountTransactionForm.invalid) {
      return;
    }

    const formData = this.savingAccountTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    // Format transaction date
    if (formData.transactionDate instanceof Date) {
      formData.transactionDate = this.dateUtils.formatDate(formData.transactionDate, dateFormat);
    }

    // Process source of funds
    if (formData.sourceOfFunds !== null) {
      formData.sourceOfFunds = this.getSourceOfFundCheckedValues();
    }

    // Use billetageData from the child component
    const billetage = this.billetageData;

    // Clean up form data (no need to remove denomination fields now)
    delete formData.totalDepositAmount;

    const data = {
      ...formData,
      dateFormat,
      locale,
      billetage
    };

    // Get current date and time for receipt
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    this.savingsService
      .executeSavingsAccountTransactionsCommand(this.savingAccountId, this.transactionCommand, data)
      .subscribe(res => {
        if (res.changes) {
          const receiptData = {
            receiptNumber: res.changes.receiptNumber,
            date,
            time,
            transactionType: this.transactionCommand,
            agency: res.changes.agency,
            transaction: res.changes.transaction,
            paymentDetails: billetage,
          };

          this.sessionDataService.setSessionData(receiptData);
          this.router.navigate(
            ['/organization/tellers/session/1/cashiers/1/cashier-receipt/', this.savingAccountId],
            { relativeTo: this.route }
          );
        }
      });
  }
}
