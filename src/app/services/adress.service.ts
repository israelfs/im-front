import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddressType } from '../components/todos/todos.component';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AdressService {
  private addressesSubject = new BehaviorSubject<AddressType[]>([]);

  adresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  addAddress(address: AddressType) {
    const addresses = this.addressesSubject.getValue();
    addresses.push(address);
    this.addressesSubject.next(addresses);
    this.createTodo(address).subscribe(
      (data) => {
        console.log('Created:', data);
        this.notifyServerOfChange();
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  removeAddress(index: number) {
    const addresses = this.addressesSubject.getValue();
    this.addressesSubject.next(
      addresses.filter((address) => address.id !== index)
    );
    this.removeTodo(index).subscribe(
      (data) => {
        console.log('Deleted:', data);
        this.notifyServerOfChange();
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  editAddress(address: AddressType) {
    const addresses = this.addressesSubject.getValue();
    const index = addresses.findIndex((a) => a.id === address.id);
    this.editTodo(address).subscribe(
      (data) => {
        console.log('Updated:', data);
        this.notifyServerOfChange();
        addresses[index] = address;
        this.addressesSubject.next(addresses);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  setAddresses(addresses: AddressType[]) {
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
    });
  }

  editTodo(todo: AddressType): Observable<any> {
    return this.http.put(`${environment.BACKEND_URL}/todo/${todo.id}`, {
      title: todo.title,
    });
  }

  removeTodo(id: number): Observable<any> {
    return this.http.delete(`${environment.BACKEND_URL}/todo/${id}`);
  }
}
