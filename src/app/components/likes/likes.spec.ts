import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Likes } from './likes';

describe('Likes', () => {
  let component: Likes;
  let fixture: ComponentFixture<Likes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Likes],
    }).compileComponents();

    fixture = TestBed.createComponent(Likes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
