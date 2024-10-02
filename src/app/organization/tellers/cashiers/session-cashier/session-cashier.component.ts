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
  selector: 'mifosx-session-cashier',
  templateUrl: './session-cashier.component.html',
  styleUrls: ['./session-cashier.component.scss']
})
export class SessionCashierComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  sessionCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  status: 'open' | 'close';  // Define status for opening or closing
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
    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.status = 'close';
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.sessionCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'openingBalance': ['', Validators.required],
      'closingBalance': [''], 
      'bill10000': [0],
      'bill5000': [0],
      'bill2000': [0],
      'bill1000': [0],
      'coin500': [0],
      'coin200': [0],
      'coin100': [0],
      'coin50': [0],
      'txnNote': ['', Validators.required]
    });

    // Adjust form validation if session is closing
    if (this.status === 'close') {
      this.sessionCashForm.get('openingBalance').disable();
      this.sessionCashForm.get('closingBalance').setValidators([Validators.required]);
    }
  }
  // Fonction pour calculer le total des billets et pièces FCFA
  calculateTotal() {
    const bill10000 = this.sessionCashForm.get('bill10000').value || 0;
    const bill5000 = this.sessionCashForm.get('bill5000').value || 0;
    const bill2000 = this.sessionCashForm.get('bill2000').value || 0;
    const bill1000 = this.sessionCashForm.get('bill1000').value || 0;

    const coin500 = this.sessionCashForm.get('coin500').value || 0;
    const coin200 = this.sessionCashForm.get('coin200').value || 0;
    const coin100 = this.sessionCashForm.get('coin100').value || 0;
    const coin50 = this.sessionCashForm.get('coin50').value || 0;

    // Calcul total en fonction des billets et pièces
    this.calculatedTotal = (bill10000 * 10000) + (bill5000 * 5000) + 
                            (bill2000 * 2000) + (bill1000 * 1000) + 
                            (coin500 * 500) + (coin200 * 200) + 
                            (coin100 * 100) + (coin50 * 50);
  }
  /**
   * Submits open Cash form.
   */
  submit() {
    if (this.calculatedTotal !== this.sessionCashForm.get('closingBalance').value) {
      alert('Le billetage ne correspond pas au montant de clôture.');
      return;
    }
    const sessionCashFormData = this.sessionCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.sessionCashForm.value.txnDate;
    if (sessionCashFormData.txnDate instanceof Date) {
      sessionCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }
    const data = {
      ...sessionCashFormData,
      dateFormat,
      locale
    };
    if (this.status === 'open') {
      this.organizationService.openCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
        this.router.navigate(['../'], {relativeTo: this.route});
      });
    } else {
      this.organizationService.closeCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data).subscribe((response: any) => {
        this.router.navigate(['../'], {relativeTo: this.route});
      });
    }

  }
}
