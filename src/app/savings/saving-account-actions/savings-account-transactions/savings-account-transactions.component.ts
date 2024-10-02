/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl, FormControl,AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Custums } from 'app/core/utils/custom';
/**
 * Create savings account transactions component.
 */
@Component({
  selector: 'mifosx-savings-transactions',
  templateUrl: './savings-account-transactions.component.html',
  styleUrls: ['./savings-account-transactions.component.scss']
})
export class SavingsAccountTransactionsComponent implements OnInit {

  @Input() currencyCode: string;

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Savings account transaction form. */
  savingAccountTransactionForm: UntypedFormGroup;
  /** savings account transaction payment options. */
  paymentTypeOptions: {
    id: number,
    name: string,
    description: string,
    isCashPayment: boolean,
    position: number
  }[];
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag: Boolean = false;
  isDeposit: Boolean = false;
  /** transaction type flag to render required UI */
  transactionType: { deposit: boolean, withdrawal: boolean } = { deposit: false, withdrawal: false };
  /** transaction command for submit request */
  transactionCommand: string;
  /** saving account's Id */
  savingAccountId: string;
  totalAmountInWords: string;
  totalDepositAmount: number;
  transactionAmount: number;
  // Add this for bill denominations
  displayedColumns: string[] = ['denomination', 'numberOfBills', 'total'];

  // Bill denominations (notes)
  billsDenominations = [
    { denomination: 10000 },
    { denomination: 5000 },
    { denomination: 2000 },
    { denomination: 1000 },
    { denomination: 500 }
  ];

  // Small coins (optional)
  smallCoins = [
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
    { denomination: 10000 },
    { denomination: 5000 },
    { denomination: 2000 },
    { denomination: 1000 },
    { denomination: 500 },
    { denomination: 100 },
    { denomination: 50 },
    { denomination: 25 },
    { denomination: 10 },
    { denomination: 5 },
    { denomination: 2 },
    { denomination: 1 }
  ];
  // Add this for sources of funds options
  sourcesOfFundsOptions = [
    'Salaire',
    'Recette',
    'Economie',
    'Tontine',
    'Autres'
  ];
  /**
   * Retrieves the Saving Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SavingsService} savingsService Savings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private customUtils: Custums,
              private savingsService: SavingsService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.paymentTypeOptions = data.savingsAccountActionData.paymentTypeOptions;
    });
    this.transactionCommand = this.route.snapshot.params['name'].toLowerCase();
    this.isDeposit = this.transactionCommand === 'deposit';
    this.transactionType[this.transactionCommand] = true;
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
    this.totalDepositAmount = 0;
  }

  /**
   * Creates the Saving account transaction form when component loads.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createSavingAccountTransactionForm();
    // Find the 'Cash' payment option by name
    this.paymentTypeOptions = this.paymentTypeOptions.filter(pt => pt.name === 'Cash');
    this.savingAccountTransactionForm.get('paymentTypeId')?.setValue(this.paymentTypeOptions[0]!.id);
    if(this.isDeposit) {
      this.allDenominations.forEach(bill => {
        this.savingAccountTransactionForm.addControl(
          `numberOfBills_${bill.denomination}`,
          new FormControl('')
        );

        this.savingAccountTransactionForm.addControl(
          `totalAmount_${bill.denomination}`,
          new FormControl({ value: '', disabled: true })
        );

        const numberOfBillsControl = this.savingAccountTransactionForm.get(`numberOfBills_${bill.denomination}`);
        const totalAmountControl = this.savingAccountTransactionForm.get(`totalAmount_${bill.denomination}`);

        numberOfBillsControl?.valueChanges.subscribe(value => {
          if (value && bill.denomination) {
            totalAmountControl?.setValue(value * bill.denomination);
            this.updateTotalDepositAmount();
          }
        });
      });
    }
  }
  updateTotalDepositAmount() {
    let total = 0;
    this.billsDenominations.concat(this.smallCoins).forEach(bill => {
      const totalAmountControl = this.savingAccountTransactionForm.get(`totalAmount_${bill.denomination}`);
      if (totalAmountControl?.value) {
        total += totalAmountControl.value;
      }
    });

    this.savingAccountTransactionForm.get('totalDepositAmount')?.setValue(total);
    let totalInWord = this.customUtils.numberToWordsFr(this.savingAccountTransactionForm.get('totalDepositAmount').value)
    this.savingAccountTransactionForm.get('amountInWords')?.setValue(totalInWord);
    this.totalAmountInWords = totalInWord;
    this.totalDepositAmount = this.savingAccountTransactionForm.get('totalDepositAmount').value;
  }
  /**
   * Method to create the Saving Account Transaction Form.
   */
  createSavingAccountTransactionForm() {
    this.savingAccountTransactionForm = this.formBuilder.group({
      'transactionDate': [this.settingsService.businessDate, Validators.required],
      'transactionAmount': [0, Validators.required],
      'paymentTypeId': [''],
      'numberOfBills_10000': [0],
      'totalAmount_10000': [0],
      'numberOfBills_5000': [0],
      'totalAmount_5000': [0],
      // add all denominations
      'totalDepositAmount': [0],
      'amountInWords': [''],
      'sourceOfFunds': this.formBuilder.array(this.sourcesOfFundsOptions.map(() => this.formBuilder.control(false))),
      'depositName': [''],
      // Dynamically add form controls for each denomination
      numberOfBills_2000: [0],
      totalAmount_2000: [0],
      numberOfBills_1000: [0],
      totalAmount_1000: [0],
      numberOfBills_500: [0],
      totalAmount_500: [0],
      numberOfBills_200: [0],
      totalAmount_200: [0],
      numberOfBills_100: [0],
      totalAmount_100: [0],
      numberOfBills_50: [0],
      totalAmount_50: [0],
      numberOfBills_20: [0],
      totalAmount_20: [0],
      numberOfBills_10: [0],
      totalAmount_10: [0],
      'note': ['']
    }, { validators: this.amountMatchValidator()});
  }

  amountMatchValidator(): ValidatorFn {
    if (!this.isDeposit) {
      return null;
    }
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const transactionAmount = formGroup.get('transactionAmount')?.value;
      const totalDepositAmount = formGroup.get('totalDepositAmount')?.value;

      // Check if both fields are filled and if they match
      if (transactionAmount !== null && totalDepositAmount !== null && transactionAmount !== totalDepositAmount) {
        return { amountMismatch: true }; // Validation error
      }
      return null; // No validation error
    };
  }
  // Method to get checked values
  getSourceOfFundCheckedValues(): string {
    const sourceOfFundsArray = this.savingAccountTransactionForm.get('sourceOfFunds') as FormArray;
    const checkedValues = this.sourcesOfFundsOptions
      .filter((option, i) => sourceOfFundsArray.at(i).value)
      .join(', '); // Join the selected values with a comma and space
    return checkedValues;
  }

  /**
   * Method to add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.addPaymentDetailsFlag = !this.addPaymentDetailsFlag;
    if (this.addPaymentDetailsFlag) {
      this.savingAccountTransactionForm.addControl('accountNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('checkNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('routingCode', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.savingAccountTransactionForm.removeControl('accountNumber');
      this.savingAccountTransactionForm.removeControl('checkNumber');
      this.savingAccountTransactionForm.removeControl('routingCode');
      this.savingAccountTransactionForm.removeControl('receiptNumber');
      this.savingAccountTransactionForm.removeControl('bankNumber');
    }
  }

  /**
   * Method to submit the transaction details.
   */
  submit() {
    const savingAccountTransactionFormData = this.savingAccountTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.savingAccountTransactionForm.value.transactionDate;

    // Define the list of denominations and map them to the form values
    const billetage = [
      { denomination: 10000, count: this.savingAccountTransactionForm.value.numberOfBills_10000 },
      { denomination: 5000, count: this.savingAccountTransactionForm.value.numberOfBills_5000 },
      { denomination: 2000, count: this.savingAccountTransactionForm.value.numberOfBills_2000 },
      { denomination: 1000, count: this.savingAccountTransactionForm.value.numberOfBills_1000 },
      { denomination: 500, count: this.savingAccountTransactionForm.value.numberOfBills_500 },
      { denomination: 200, count: this.savingAccountTransactionForm.value.numberOfBills_200 },
      { denomination: 100, count: this.savingAccountTransactionForm.value.numberOfBills_100 },
      { denomination: 50, count: this.savingAccountTransactionForm.value.numberOfBills_50 },
      { denomination: 20, count: this.savingAccountTransactionForm.value.numberOfBills_20 },
      { denomination: 10, count: this.savingAccountTransactionForm.value.numberOfBills_10 }
    ]
    .filter(item => item.count > 0) // Only include denominations where the count is greater than 0
    .map(item => ({
      ...item,
      tellerCount: item.count,  // Use the same count for tellerCount
      cashierCount: item.count, // Use the same count for cashierCount
      difference: 0             // Default the difference to 0
    }));
    // Remove unsupported parameters from the form data
    const unsupportedKeys = [
      'numberOfBills_10000', 'totalAmount_10000', 'numberOfBills_5000', 'totalAmount_5000',
      'totalDepositAmount', 'numberOfBills_2000',
      'totalAmount_2000', 'numberOfBills_1000', 'totalAmount_1000', 'numberOfBills_500',
      'totalAmount_500', 'numberOfBills_200', 'totalAmount_200', 'numberOfBills_100',
      'totalAmount_100', 'numberOfBills_50', 'totalAmount_50', 'numberOfBills_20',
      'totalAmount_20', 'numberOfBills_10', 'totalAmount_10', 'numberOfBills_25',
      'numberOfBills_5', 'numberOfBills_2', 'numberOfBills_1'
    ];
   // if(!this.isDeposit) {
      unsupportedKeys.forEach(key => delete savingAccountTransactionFormData[key]);
    //}
    if (savingAccountTransactionFormData.transactionDate instanceof Date) {
      savingAccountTransactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    if(savingAccountTransactionFormData.sourceOfFunds !== null) {
      savingAccountTransactionFormData.sourceOfFunds = this.getSourceOfFundCheckedValues();
    }
    const data = {
      ...savingAccountTransactionFormData,
      dateFormat,
      locale,
      billetage
    };
    this.savingsService.executeSavingsAccountTransactionsCommand(this.savingAccountId, this.transactionCommand, data).subscribe(res => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}
