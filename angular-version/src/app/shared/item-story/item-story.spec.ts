import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemStory } from './item-story';

describe('ItemStory', () => {
  let component: ItemStory;
  let fixture: ComponentFixture<ItemStory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemStory],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemStory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
