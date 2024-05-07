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

  private companiesSubject = new BehaviorSubject<any[]>([]);

  companies$ = this.companiesSubject.asObservable();

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

  getChartData(typeOfChart: string): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/locationChart`);
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
