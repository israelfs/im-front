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

  public getGeoCoding(lat: number, lon: number): Observable<any> {
    return this.http.get(
      `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`
    );
  }

  public getFormatedString(data: any): string {
    const newStreet =
      data.features[0].properties.street || data.features[0].properties.name;
    const newNumber = data.features[0].properties.housenumber || '';
    const newCity = data.features[0].properties.city;
    const newCountryCode = data.features[0].properties.countrycode;

    const newText = newNumber
      ? `${newStreet}, ${newNumber}, ${newCity}, ${newCountryCode}`
      : `${newStreet}, ${newCity}, ${newCountryCode}`;

    return newText;
  }
}
