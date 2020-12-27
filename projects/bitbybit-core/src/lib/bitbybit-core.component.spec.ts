import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitbybitCoreComponent } from './bitbybit-core.component';

describe('BitbybitCoreComponent', () => {
  let component: BitbybitCoreComponent;
  let fixture: ComponentFixture<BitbybitCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitbybitCoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitbybitCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
