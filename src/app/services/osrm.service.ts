import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OsrmService {
  constructor(private http: HttpClient) {}

  public getRouting(coordinates: [number, number][]): Observable<any> {
    const coordinatesString = coordinates.map((c) => c.join(',')).join(';');
    return this.http.get(
      `http://router.project-osrm.org/route/v1/driving/${coordinatesString}?geometries=geojson`
    );
  }
}
