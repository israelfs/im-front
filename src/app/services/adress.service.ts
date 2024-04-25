import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  switchMap,
  tap,
  of,
} from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PhotonKomootService } from './photon-komoot.service';

@Injectable({
  providedIn: 'root',
})
export class AdressService {
  constructor(
    private http: HttpClient,
    private photonService: PhotonKomootService
  ) {}

  private addressesSubject = new BehaviorSubject<any[]>([]);

  addresses$ = this.addressesSubject.asObservable();

  fetchAddresses(type: 'all' | 'mono' | 'bi' | 'multi'): void {
    let obs: Observable<any>;
    switch (type) {
      case 'all':
        obs = this.getLocations();
        break;
      case 'mono':
        obs = this.getMonoOperatorLocations();
        break;
      case 'bi':
        obs = this.getBiOperatorLocations();
        break;
      case 'multi':
        obs = this.getTripleOperatorLocations();
        break;
    }
    obs.subscribe((locations) => {
      this.addressesSubject.next(locations);
    });
  }

  getLocations(): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/locations`);
  }

  getMonoOperatorLocations = (): Observable<any> => {
    return this.http.get(`${environment.BACKEND_URL}/monoOperatorLocations`);
  };

  getBiOperatorLocations = (): Observable<any> => {
    return this.http.get(`${environment.BACKEND_URL}/biOperatorLocations`);
  };

  getTripleOperatorLocations = (): Observable<any> => {
    return this.http.get(`${environment.BACKEND_URL}/tripleOperatorLocations`);
  };
}
