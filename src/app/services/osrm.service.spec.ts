import { TestBed } from '@angular/core/testing';

import { OsrmService } from './osrm.service';

describe('OsrmService', () => {
  let service: OsrmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsrmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
