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
  selector: 'mifosx-close-cashier',
  templateUrl: './close-cashier.component.html',
  styleUrls: ['./close-cashier.component.scss']
})
export class CloseCashierComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  sessionCashForm: UntypedFormGroup;
  calculatedTotal: number = 0;
  isMismatchTotal : boolean;
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
      //'assignmentPeriod': [{value: this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'openingBalance': ['', Validators.required],
      'closingBalance': ['', Validators.required], 
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

    this.isMismatchTotal = this.calculatedTotal !== this.sessionCashForm.get('openingBalance').value;
  }
  /**
   * Submits open Cash form.
   */
  submit() {

    const sessionCashFormData = this.sessionCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = sessionCashFormData.txnDate;
  
    // Format transaction date
    if (txnDate instanceof Date) {
      sessionCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }
  
    // Prepare billetage array
    const billetage = [
      { denomination: 10000, count: sessionCashFormData.bill10000, tellerCount: sessionCashFormData.bill10000, cashierCount: sessionCashFormData.bill10000, difference: 0 },
      { denomination: 5000, count: sessionCashFormData.bill5000, tellerCount: sessionCashFormData.bill5000, cashierCount: sessionCashFormData.bill5000, difference: 0 },
      { denomination: 2000, count: sessionCashFormData.bill2000, tellerCount: sessionCashFormData.bill2000, cashierCount: sessionCashFormData.bill2000, difference: 0 },
      { denomination: 1000, count: sessionCashFormData.bill1000, tellerCount: sessionCashFormData.bill1000, cashierCount: sessionCashFormData.bill1000, difference: 0 },
      { denomination: 500, count: sessionCashFormData.coin500, tellerCount: sessionCashFormData.coin500, cashierCount: sessionCashFormData.coin500, difference: 0 },
      { denomination: 100, count: sessionCashFormData.coin100, tellerCount: sessionCashFormData.coin100, cashierCount: sessionCashFormData.coin100, difference: 0 },
      { denomination: 50, count: sessionCashFormData.coin50, tellerCount: sessionCashFormData.coin50, cashierCount: sessionCashFormData.coin50, difference: 0 },
      { denomination: 25, count: sessionCashFormData.coin200, tellerCount: sessionCashFormData.coin200, cashierCount: sessionCashFormData.coin200, difference: 0 },

    ];
  
    // Prepare the data object
    const data = {
      cashierId: this.cashierData.cashierId,
      openingAmount: sessionCashFormData.openingBalance,
      closingAmount: sessionCashFormData.closingAmount,
      currencyCode: sessionCashFormData.currencyCode,
      locale,
      startDate: sessionCashFormData.txnDate,  // already formatted above
      endDate: sessionCashFormData.txnDate,  // already formatted above
      dateFormat,
      description: "Closing cashier session",
      status: 0,  // Assuming status '1' means opening session
      billetage
    };
  
    // Call the service to open cashier session
    this.organizationService.closeCashierSession(this.cashierData.tellerId, this.cashierData.cashierId, data)
    .subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
