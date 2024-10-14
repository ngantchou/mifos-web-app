import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionDetailComponent } from './view-transaction.component';

describe('TransactionsComponent', () => {
  let component: ViewTransactionDetailComponent;
  let fixture: ComponentFixture<ViewTransactionDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTransactionDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTransactionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
