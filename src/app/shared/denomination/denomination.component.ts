import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Custums } from 'app/core/utils/custom';

@Component({
  selector: 'app-denomination',
  templateUrl: './denomination.component.html',
  styleUrls: ['./denomination.component.scss']
})
export class DenominationComponent implements OnInit {
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

  @Input() currencyCode: string = 'CFA';
  @Output() totalAmountChange = new EventEmitter<number>();
  @Output() amountInWordsChange = new EventEmitter<string>();
  @Output() billetageChange = new EventEmitter<any[]>();
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
    // Method to return the billetage array
  getBilletage(): any[] {
    let billetage: any[] = [];

    // Loop through all denominations and extract values from the form
    this.allDenominations.forEach(coin => {
      const numberControl = this.denominationFormGroup.get(`numberOfBills_${coin.denomination}`)?.value;

      // If the number of bills is greater than 0, push to billetage array
      if (numberControl > 0) {
        billetage.push({
          denomination: coin.denomination,
          count: numberControl,
          tellerCount: numberControl, // Adjust based on logic
          cashierCount: numberControl, // Adjust based on logic
          difference: 0 // Set logic for calculating difference if needed
        });
      }
    });
    this.billetageChange.emit(billetage);  // Emit the billetage array
    return billetage;  // Return the billetage array
  }
}
