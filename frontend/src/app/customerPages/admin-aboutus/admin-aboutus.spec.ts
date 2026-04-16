import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAboutus } from './admin-aboutus';

describe('AdminAboutus', () => {
  let component: AdminAboutus;
  let fixture: ComponentFixture<AdminAboutus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAboutus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAboutus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
