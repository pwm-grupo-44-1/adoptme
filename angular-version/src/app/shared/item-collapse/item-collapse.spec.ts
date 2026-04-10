import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCollapse } from './item-collapse';

describe('ItemCollapse', () => {
  let component: ItemCollapse;
  let fixture: ComponentFixture<ItemCollapse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCollapse],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCollapse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
