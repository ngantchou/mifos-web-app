import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';

export interface Billetage {
  denomination: number;
  count: number;
  tellerCount: number; // Assuming you need these for your backend
  cashierCount: number;
  difference: number;
}
interface Denomination {
  denomination: number;
  label: string;
  type: 'note' | 'coin';
}

@Component({
  selector: 'app-billetage',
  templateUrl: './billetage.component.html',
  styleUrls: ['./billetage.component.scss']
})
export class BilletageComponent implements OnInit {
  @Input() currencyCode: string = '';
  @Output() billetageChange = new EventEmitter<Billetage[]>();

  billetageForm: FormGroup;
  displayedColumns: string[] = ['denomination', 'numberOfBills', 'total'];
  totalAmount = 0;

  denominations: Denomination[] = [
    { denomination: 10000, type: 'note', label: 'labels.inputs.Bill1000FCFA', },
    { denomination: 5000, type: 'note', label: 'labels.inputs.Bill5000FCFA' },
    { denomination: 2000, type: 'note', label: 'labels.inputs.Bill2000FCFA' },
    { denomination: 1000, type: 'note', label: 'labels.inputs.Bill1000FCFA' },
    { denomination: 500, type: 'note', label: 'labels.inputs.Bill500FCFA' },
    { denomination: 100, type: 'coin', label: 'labels.inputs.Coin100FCFA' },
    { denomination: 50, type: 'coin', label: 'labels.inputs.Coin50FCFA' },
    { denomination: 25, type: 'coin', label: 'labels.inputs.Coin25FCFA' },
    { denomination: 10, type: 'coin', label: 'labels.inputs.Coin10FCFA' },
    { denomination: 5, type: 'coin',  label: 'labels.inputs.Coin5FCFA' },
    { denomination: 2, type: 'coin', label: 'labels.inputs.Coin2FCFA' },
    { denomination: 1, type: 'coin', label: 'labels.inputs.Coin1FCFA' }
  ];

  constructor(private fb: FormBuilder) {
    this.billetageForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const group: { [key: string]: FormControl } = {};

    this.denominations.forEach(denomination => {
      group[this.getDenominationControlName(denomination.denomination)] = new FormControl('', [
        Validators.min(0),
        Validators.max(9999),
        Validators.pattern('^[0-9]*$')
      ]);
    });

    this.billetageForm = this.fb.group(group);
  }

  getDenominationControlName(denomination: number): string {
    return `numberOfBills_${denomination}`;
  }

  calculateTotal(billetage: any): number {
    this.totalAmount = billetage.reduce((sum: number, item: any) => {
      return sum + item.denomination * item.count;
    }, 0);
    return this.totalAmount;
  }

  updateBilletage(): void {
    const billetage: Billetage[] = this.denominations
      .map(item => {
        const count = this.billetageForm.get(this.getDenominationControlName(item.denomination))?.value || 0;
        return {
          denomination: item.denomination,
          count: count,
          tellerCount: count,
          cashierCount: count,
          difference: 0
        };
      })
      .filter(item => item.count > 0);
    this.calculateTotal(billetage);
    this.billetageChange.emit(billetage);
  }
}
