import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionCashierComponent } from './session-cashier.component';

describe('SessionCashierComponent', () => {
  let component: SessionCashierComponent;
  let fixture: ComponentFixture<SessionCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionCashierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
