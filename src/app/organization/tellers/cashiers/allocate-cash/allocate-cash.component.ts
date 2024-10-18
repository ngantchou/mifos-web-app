/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { SessionDataService } from '../session-data.service';

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
              private systemService: SystemService,
              private sessionDataService: SessionDataService,
              private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any,columnCodes: any}) => {
      this.cashierData = data.cashierTemplate;
      this.columnCodes = data.columnCodes;
    });
  }

  ngOnInit() {
    let code = this.columnCodes.filter((cod: { name: string; }) => cod.name === "Banque" );
    this.systemService.getCodeValues(code[0].id).subscribe((response: any) => {
      this.targetAccounts = response;
    });
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.allocateCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'txnAmount': ['', Validators.required],
      'txnNote': ['', Validators.required],
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
    });
  }
  // Fonction pour calculer le total des billets et pièces FCFA
  calculateTotal() {
    const bill10000 = this.allocateCashForm.get('bill10000').value || 0;
    const bill5000 = this.allocateCashForm.get('bill5000').value || 0;
    const bill2000 = this.allocateCashForm.get('bill2000').value || 0;
    const bill1000 = this.allocateCashForm.get('bill1000').value || 0;

    const coin500 = this.allocateCashForm.get('coin500').value || 0;
    const coin200 = this.allocateCashForm.get('coin200').value || 0;
    const coin100 = this.allocateCashForm.get('coin100').value || 0;
    const coin50 = this.allocateCashForm.get('coin50').value || 0;

    // Calcul total en fonction des billets et pièces
    this.calculatedTotal = (bill10000 * 10000) + (bill5000 * 5000) +
                            (bill2000 * 2000) + (bill1000 * 1000) +
                            (coin500 * 500) + (coin200 * 200) +
                            (coin100 * 100) + (coin50 * 50);
    this.isMismatchTotal = this.calculatedTotal !== this.allocateCashForm.get('txnAmount').value;
  }
  /**
   * Submits Allocate Cash form.
   */
  submit() {
    const allocateCashFormData = this.allocateCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.allocateCashForm.value.txnDate;

    // Prepare billetage array
    const billetage = [
      { denomination: 10000, count: allocateCashFormData.bill10000, tellerCount: allocateCashFormData.bill10000, cashierCount: allocateCashFormData.bill10000, difference: 0 },
      { denomination: 5000, count: allocateCashFormData.bill5000, tellerCount: allocateCashFormData.bill5000, cashierCount: allocateCashFormData.bill5000, difference: 0 },
      { denomination: 2000, count: allocateCashFormData.bill2000, tellerCount: allocateCashFormData.bill2000, cashierCount: allocateCashFormData.bill2000, difference: 0 },
      { denomination: 1000, count: allocateCashFormData.bill1000, tellerCount: allocateCashFormData.bill1000, cashierCount: allocateCashFormData.bill1000, difference: 0 },
      { denomination: 500, count: allocateCashFormData.coin500, tellerCount: allocateCashFormData.coin500, cashierCount: allocateCashFormData.coin500, difference: 0 },
      { denomination: 100, count: allocateCashFormData.coin100, tellerCount: allocateCashFormData.coin100, cashierCount: allocateCashFormData.coin100, difference: 0 },
      { denomination: 50, count: allocateCashFormData.coin50, tellerCount: allocateCashFormData.coin50, cashierCount: allocateCashFormData.coin50, difference: 0 },
      { denomination: 25, count: allocateCashFormData.coin200, tellerCount: allocateCashFormData.coin200, cashierCount: allocateCashFormData.coin200, difference: 0 },

    ];
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
      billetage
    };

    let bank = this.targetAccounts.find((cod: { id: number; }) => cod.id === allocateCashFormData.bankName );
    allocateCashFormData.sourceCashier = bank.name+'('+allocateCashFormData.bankAccount+')';
    allocateCashFormData.targetCashier =  this.cashierData.tellerName+'('+this.cashierData.cashierName+')';
    this.sessionDataService.setSessionData(allocateCashFormData);

    this.organizationService.allocateCash(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
      this.router.navigate(['../cashier-receipt'], {relativeTo: this.route});
    });
  }

}
