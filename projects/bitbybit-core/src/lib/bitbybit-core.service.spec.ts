import { TestBed } from '@angular/core/testing';

import { BitbybitCoreService } from './bitbybit-core.service';

describe('BitbybitCoreService', () => {
  let service: BitbybitCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitbybitCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
