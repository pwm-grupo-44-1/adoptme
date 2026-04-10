import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptionList } from './adoption-list';

describe('AdoptionList', () => {
  let component: AdoptionList;
  let fixture: ComponentFixture<AdoptionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdoptionList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdoptionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
