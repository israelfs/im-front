import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhotonKomootService {
  constructor(private http: HttpClient) {}

  public getCoordinates(query: string): Observable<any> {
    return this.http.get(`https://photon.komoot.io/api/?q=${query}&limit=5`);
  }
}
