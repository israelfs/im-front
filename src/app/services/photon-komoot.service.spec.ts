import { TestBed } from '@angular/core/testing';

import { PhotonKomootService } from './photon-komoot.service';

describe('PhotonKomootService', () => {
  let service: PhotonKomootService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotonKomootService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
