import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stories } from './stories';

describe('Stories', () => {
  let component: Stories;
  let fixture: ComponentFixture<Stories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stories],
    }).compileComponents();

    fixture = TestBed.createComponent(Stories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
