import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { AddressType } from '../components/todos/todos.component';
import { environment } from '../../environments/environment.development';
import { PhotonKomootService } from './photon-komoot.service';

@Injectable({
  providedIn: 'root',
})
export class AdressService {
  private addressesSubject = new BehaviorSubject<AddressType[]>([]);

  adresses$ = this.addressesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private photonService: PhotonKomootService
  ) {}

  private ws!: WebSocket;

  openWebSocket() {
    this.ws = new WebSocket(environment.WEBSOCKET_URL);

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      console.log(event.data);
      if (event.data === 'Refetch Data') {
        this.getTodos().subscribe(
          // Refetch data
          (data) => {
            this.setAddresses(data);
          },
          (error) => {
            console.error('Error:', error);
          }
        );
      }
    };
  }

  closeWebSocket() {
    if (this.ws) {
      this.ws.close();
    }
  }

  notifyServerOfChange() {
    this.ws.send('Refetch Data');
  }

  addAddress(address: AddressType): void {
    this.photonService
      .getCoordinates(address.address!)
      .pipe(
        switchMap((data) => {
          if (data.features && data.features.length > 0) {
            const newAddress = {
              ...address,
              lat: data.features[0].geometry.coordinates[1],
              lng: data.features[0].geometry.coordinates[0],
            };

            return this.createTodo(newAddress);
          } else {
            throw new Error('No features returned from getCoordinates');
          }
        }),
        switchMap((response) => {
          return this.photonService
            .getGeoCoding(response.lat, response.lng)
            .pipe(
              map((geoCodingData) => ({
                ...response,
                address: this.photonService.getFormatedString(geoCodingData),
              }))
            );
        }),
        tap(() => this.notifyServerOfChange())
      )
      .subscribe((response) => {
        if (response) {
          this.addressesSubject.next([
            ...this.addressesSubject.getValue(),
            response,
          ]);
        }
      });
  }

  removeAddress(index: number) {
    this.removeTodo(index).subscribe(
      (data) => {
        const addresses = this.addressesSubject.getValue();
        this.addressesSubject.next(
          addresses.filter((address) => address.id !== index)
        );
        this.notifyServerOfChange();
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  editAddress(address: AddressType) {
    this.editTodo(address).subscribe(
      (data) => {
        const addresses = this.addressesSubject.getValue();
        const index = addresses.findIndex((a) => a.id === address.id);
        addresses[index] = address;
        this.addressesSubject.next(addresses);
        this.notifyServerOfChange();
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  setAddresses(addresses: AddressType[]) {
    addresses.forEach((address) => {
      this.photonService
        .getGeoCoding(address.lat!, address.lng!)
        .subscribe((data) => {
          if (data.features && data.features.length > 0) {
            const newText = this.photonService.getFormatedString(data);
            address.address = newText;
          }
        });
    });
    this.addressesSubject.next(addresses);
  }

  getTodos(): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/todos`);
  }

  getTodoById(id: number): Observable<any> {
    return this.http.get(`${environment.BACKEND_URL}/todos/${id}`);
  }

  createTodo(todo: AddressType): Observable<any> {
    return this.http.post(`${environment.BACKEND_URL}/todo`, {
      title: todo.title,
      lat: todo.lat,
      lng: todo.lng,
    });
  }

  editTodo(todo: AddressType): Observable<any> {
    return this.http.put(`${environment.BACKEND_URL}/todo/${todo.id}`, {
      title: todo.title,
      lat: todo.lat,
      lng: todo.lng,
    });
  }

  removeTodo(id: number): Observable<any> {
    return this.http.delete(`${environment.BACKEND_URL}/todo/${id}`);
  }
}
