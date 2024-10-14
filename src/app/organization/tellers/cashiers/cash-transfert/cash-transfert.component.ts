/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-transfert-cash',
  templateUrl: './cash-transfert.component.html',
  styleUrls: ['./cash-transfert.component.scss']
})
export class TransfertCashComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  cashiersData: any;
  /** Cashier Form. */
  cashTransferForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal : boolean;
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
                this.route.data.subscribe(( data: { cashiersData: any }) => {
                  this.cashiersData = data.cashiersData;
                });
  }

  ngOnInit() {
    // Retrieve the last parameter (cashierId) from the route
    this.cashierData = this.cashiersData.filter((cashier: { id: number; }) => cashier.id === +this.route.snapshot.params['id']);
    this.cashierData = this.cashierData[0];
    this.cashiersData = this.cashiersData.filter((cashier: { id: number; }) => cashier.id !== +this.route.snapshot.params['id']);
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.cashTransferForm = this.formBuilder.group({
      // 'office': [{value: this.cashierData.officeName, disabled: true}],
      // 'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      // 'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      //'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      //'currencyCode': ['', Validators.required],
      'txnAmount': ['', Validators.required],
      'txnNote': ['', Validators.required],
      'sourceCashier': ['', Validators.required],
      'targetCashier': ['', Validators.required],
      'bill10000': [0],
      'bill5000': [0],
      'bill2000': [0],
      'bill1000': [0],
      'coin500': [0],
      'coin200': [0],
      'coin100': [0],
      'coin50': [0],
    });
  }
  // Fonction pour calculer le total des billets et pièces FCFA
  calculateTotal() {
    const bill10000 = this.cashTransferForm.get('bill10000').value || 0;
    const bill5000 = this.cashTransferForm.get('bill5000').value || 0;
    const bill2000 = this.cashTransferForm.get('bill2000').value || 0;
    const bill1000 = this.cashTransferForm.get('bill1000').value || 0;

    const coin500 = this.cashTransferForm.get('coin500').value || 0;
    const coin200 = this.cashTransferForm.get('coin200').value || 0;
    const coin100 = this.cashTransferForm.get('coin100').value || 0;
    const coin50 = this.cashTransferForm.get('coin50').value || 0;

    // Calcul total en fonction des billets et pièces
    this.calculatedTotal = (bill10000 * 10000) + (bill5000 * 5000) +
                            (bill2000 * 2000) + (bill1000 * 1000) +
                            (coin500 * 500) + (coin200 * 200) +
                            (coin100 * 100) + (coin50 * 50);
    this.isMismatchTotal = this.calculatedTotal !== this.cashTransferForm.get('txnAmount').value;
  }

  /**
   * Submits Allocate Cash form.
   */
  submitTransfer() {
    const cashTransferFormData = this.cashTransferForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.cashTransferForm.value.txnDate;
    const txnAmount = this.cashTransferForm.value.txnAmount;
    const txnNote = this.cashTransferForm.value.txnNote;
    const sourceCashier = this.cashTransferForm.value.sourceCashier;
    const targetCashier = this.cashTransferForm.value.targetCashier;
    const currencyCode = 'XAF';
    if (cashTransferFormData.txnDate instanceof Date) {
      cashTransferFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }
    // Prepare billetage array
    const billetage = [
      { denomination: 10000, count: cashTransferFormData.bill10000, tellerCount: cashTransferFormData.bill10000, cashierCount: cashTransferFormData.bill10000, difference: 0 },
      { denomination: 5000, count: cashTransferFormData.bill5000, tellerCount: cashTransferFormData.bill5000, cashierCount: cashTransferFormData.bill5000, difference: 0 },
      { denomination: 2000, count: cashTransferFormData.bill2000, tellerCount: cashTransferFormData.bill2000, cashierCount: cashTransferFormData.bill2000, difference: 0 },
      { denomination: 1000, count: cashTransferFormData.bill1000, tellerCount: cashTransferFormData.bill1000, cashierCount: cashTransferFormData.bill1000, difference: 0 },
      { denomination: 500, count: cashTransferFormData.coin500, tellerCount: cashTransferFormData.coin500, cashierCount: cashTransferFormData.coin500, difference: 0 },
      { denomination: 100, count: cashTransferFormData.coin100, tellerCount: cashTransferFormData.coin100, cashierCount: cashTransferFormData.coin100, difference: 0 },
      { denomination: 50, count: cashTransferFormData.coin50, tellerCount: cashTransferFormData.coin50, cashierCount: cashTransferFormData.coin50, difference: 0 },
      { denomination: 25, count: cashTransferFormData.coin200, tellerCount: cashTransferFormData.coin200, cashierCount: cashTransferFormData.coin200, difference: 0 },

    ];
    const data = {
      txnDate,
      currencyCode,
      txnAmount,
      txnNote,
      sourceCashier,
      targetCashier,
      dateFormat,
      locale,
      billetage
    };
    this.organizationService.transfertCash(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
