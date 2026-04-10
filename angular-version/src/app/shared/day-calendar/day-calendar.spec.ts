import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayCalendar } from './day-calendar';

describe('DayCalendar', () => {
  let component: DayCalendar;
  let fixture: ComponentFixture<DayCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(DayCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
