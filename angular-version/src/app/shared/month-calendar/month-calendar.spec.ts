import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCalendar } from './month-calendar';

describe('MonthCalendar', () => {
  let component: MonthCalendar;
  let fixture: ComponentFixture<MonthCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
