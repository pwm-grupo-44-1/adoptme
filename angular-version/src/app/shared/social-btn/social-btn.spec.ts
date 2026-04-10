import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialBtn } from './social-btn';

describe('SocialBtn', () => {
  let component: SocialBtn;
  let fixture: ComponentFixture<SocialBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
