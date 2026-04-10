import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAnimal } from './card-animal';

describe('CardAnimal', () => {
  let component: CardAnimal;
  let fixture: ComponentFixture<CardAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAnimal],
    }).compileComponents();

    fixture = TestBed.createComponent(CardAnimal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
