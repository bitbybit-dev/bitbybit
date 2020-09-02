/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExplanationOfAlgorithmsComponent } from './explanation-of-algorithms.component';

describe('ExplanationOfAlgorithmsComponent', () => {
  let component: ExplanationOfAlgorithmsComponent;
  let fixture: ComponentFixture<ExplanationOfAlgorithmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplanationOfAlgorithmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplanationOfAlgorithmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
