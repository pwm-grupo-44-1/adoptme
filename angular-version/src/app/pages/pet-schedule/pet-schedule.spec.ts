import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetSchedule } from './pet-schedule';

describe('PetSchedule', () => {
  let component: PetSchedule;
  let fixture: ComponentFixture<PetSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetSchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(PetSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
