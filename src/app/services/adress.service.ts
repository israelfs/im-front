import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddressType } from '../components/todos/todos.component';

@Injectable({
  providedIn: 'root',
})
export class AdressService {
  private addressesSubject = new BehaviorSubject<AddressType[]>([]);

  adresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) {}

  addAddress(address: AddressType) {
    const addresses = this.addressesSubject.getValue();
    addresses.push(address);
    this.addressesSubject.next(addresses);
    this.createTodo(address).subscribe(
      (data) => {
        console.log('Created:', data);
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
    return this.http.get('http://localhost:3000/todos');
  }

  getTodoById(id: number): Observable<any> {
    return this.http.get(`http://localhost:3000/todos/${id}`);
  }

  createTodo(todo: AddressType): Observable<any> {
    return this.http.post('http://localhost:3000/todo', {
      title: todo.title,
    });
  }

  editTodo(todo: AddressType): Observable<any> {
    return this.http.put(`http://localhost:3000/todo/${todo.id}`, {
      title: todo.title,
    });
  }

  removeTodo(id: number): Observable<any> {
    return this.http.delete(`http://localhost:3000/todo/${id}`);
  }
}
