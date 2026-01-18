import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSimpleMaps } from './ng-simple-maps';

describe('NgSimpleMaps', () => {
  let component: NgSimpleMaps;
  let fixture: ComponentFixture<NgSimpleMaps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSimpleMaps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgSimpleMaps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
