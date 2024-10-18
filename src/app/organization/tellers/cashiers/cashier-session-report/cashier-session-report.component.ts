// cashier-session-report.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cashier-session-report',
  templateUrl: './cashier-session-report.component.html',
  styleUrls: ['./cashier-session-report.component.scss']
})
export class CashierSessionReportComponent implements OnInit {

  sessionData: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Retrieve the session data passed through the route
    this.sessionData = this.route.snapshot.data['sessionData'];
  }

  printReport(): void {
    window.print();
  }

}
