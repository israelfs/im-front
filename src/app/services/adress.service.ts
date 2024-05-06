import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
    companies: string[][],
    operators: string[],
    startDate: string,
    endDate: string,
    grouping: string
  ): void {
    this.getLocations(
      companies,
      operators,
      startDate,
      endDate,
      grouping
    ).subscribe((addresses) => {
      this.addressesSubject.next(addresses);
    });
  }

  getLocations(
    companies: string[][],
    operators: string[],
    startDate: string,
    endDate: string,
    grouping: string
  ): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/locations`, {
      params: {
        companies: JSON.stringify(companies),
        operators,
        startDate,
        endDate,
        grouping,
      },
    });
  }

  fetchCompanies(): void {
    this.getCompanies().subscribe((companies) => {
      this.companiesSubject.next(companies);
    });
  }

  getCompanies(): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/getAllCompanies`);
  }
}
