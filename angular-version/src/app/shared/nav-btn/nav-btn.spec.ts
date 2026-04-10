import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBtn } from './nav-btn';

describe('NavBtn', () => {
  let component: NavBtn;
  let fixture: ComponentFixture<NavBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
