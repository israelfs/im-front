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

  fetchAddresses(): void {
    this.getLocations().subscribe((locations) => {
      this.addressesSubject.next(locations);
    });
  }

  getLocations(): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/locations`);
  }
}
