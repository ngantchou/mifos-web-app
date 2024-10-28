import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Custums } from 'app/core/utils/custom';

@Component({
  selector: 'app-denomination',
  templateUrl: './denomination.component.html',
  styleUrls: ['./denomination.component.scss']
})
export class DenominationComponent implements OnInit {
  @Input() allDenominations: { denomination: number, count: number }[] = [];
  @Input() billsDenominations: { denomination: number, count: number }[] = [];
  @Input() smallCoins: { denomination: number, count: number }[] = [];
  @Input() currencyCode: string = 'CFA';
  @Output() totalAmountChange = new EventEmitter<number>();
  @Output() amountInWordsChange = new EventEmitter<string>();
  @Input() denominationFormGroup!: FormGroup;  // Accept the FormGroup from the parent

  totalDepositAmount: number = 0;
  totalAmountInWords: string = '';

  constructor(private fb: FormBuilder,private customUtils: Custums) {
    this.denominationFormGroup = this.fb.group({});
  }

  displayedColumns: string[] = ['denomination', 'numberOfBills', 'total'];

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Initialize controls for each denomination based on input data
    this.allDenominations.forEach(denomination => {
      const numberOfBills = `numberOfBills_${denomination.denomination}`;
      const totalAmount = `totalAmount_${denomination.denomination}`;
      this.denominationFormGroup.addControl(numberOfBills, this.fb.control(null));
      this.denominationFormGroup.addControl(totalAmount, this.fb.control(null));
    });
    this.updateTotalAmount();
    this.allDenominations.forEach(coin => {
      const numberControl = this.denominationFormGroup.get('numberOfBills_' + coin.denomination);
      const totalControl = this.denominationFormGroup.get('totalAmount_' + coin.denomination);

      // Listen to changes in the number of coins and update the total
      if (numberControl && totalControl) {
        numberControl.valueChanges.subscribe((count: number) => {
          const total = count * coin.denomination;
          totalControl.setValue(total, { emitEvent: false });
        });
      }
    });
  }

  updateTotalAmount(): void {
    this.totalDepositAmount = this.calculateTotalAmount();
    this.totalAmountChange.emit(this.totalDepositAmount);
    this.totalAmountInWords = this.convertAmountToWords(this.totalDepositAmount);
    this.amountInWordsChange.emit(this.totalAmountInWords);
  }

  calculateTotalAmount(): number {
    let total = 0;
    this.allDenominations.forEach(bill => {
      const count = this.denominationFormGroup.get(`numberOfBills_${bill.denomination}`)?.value || 0;
      total += count * bill.denomination;
    });
    return total;
  }

  convertAmountToWords(amount: number): string {
    let totalInWord = this.customUtils.numberToWordsFr(amount)
    this.totalAmountInWords = totalInWord;
    return totalInWord;
  }
}
