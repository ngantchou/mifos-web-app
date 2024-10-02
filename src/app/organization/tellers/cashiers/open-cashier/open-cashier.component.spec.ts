import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCashierComponent } from './open-cashier.component';

describe('OpenCashierComponent', () => {
  let component: OpenCashierComponent;
  let fixture: ComponentFixture<OpenCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCashierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
