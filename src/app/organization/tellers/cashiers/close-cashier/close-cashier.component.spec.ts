import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCashierComponent } from './close-cashier.component';

describe('CloseCashierComponent', () => {
  let component: CloseCashierComponent;
  let fixture: ComponentFixture<CloseCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseCashierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
