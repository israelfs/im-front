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
  private companiesSubject = new BehaviorSubject<any[]>([]);

  addresses$ = this.addressesSubject.asObservable();
  companies$ = this.companiesSubject.asObservable();

  fetchAddresses(
    type: 'all' | 'mono' | 'bi' | 'multi',
    seletctedCompany: string
  ): void {
    let obs: Observable<any>;
    switch (type) {
      case 'all':
        obs = this.getLocations(seletctedCompany);
        break;
      case 'mono':
        obs = this.getMonoOperatorLocations(seletctedCompany);
        break;
      case 'bi':
        obs = this.getBiOperatorLocations(seletctedCompany);
        break;
      case 'multi':
        obs = this.getTripleOperatorLocations(seletctedCompany);
        break;
    }
    obs.subscribe((locations) => {
      this.addressesSubject.next(locations);
    });
  }

  getCompanies(): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/getAllCompanies`);
  }

  getLocations(selectedCompany: string): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/locations`, {
      params: { selectedCompany },
    });
  }

  getMonoOperatorLocations(selectedCompany: string): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/monoOperatorLocations`, {
      params: { selectedCompany },
    });
  }

  getBiOperatorLocations(selectedCompany: string): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/biOperatorLocations`, {
      params: { selectedCompany },
    });
  }

  getTripleOperatorLocations(selectedCompany: string): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/tripleOperatorLocations`, {
      params: { selectedCompany },
    });
  }

  fetchCompanies(): void {
    this.getCompanies().subscribe((companies) => {
      this.companiesSubject.next(companies);
    });
  }
}
