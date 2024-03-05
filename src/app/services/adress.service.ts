import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddressType } from '../components/todos/todos.component';

@Injectable({
  providedIn: 'root',
})
export class AdressService {
  private addressesSubject = new BehaviorSubject<AddressType[]>([]);

  adresses$ = this.addressesSubject.asObservable();

  constructor() {}

  addAddress(address: AddressType) {
    const addresses = this.addressesSubject.getValue();
    addresses.push(address);
    this.addressesSubject.next(addresses);
  }

  removeAddress(index: number) {
    const addresses = this.addressesSubject.getValue();
    this.addressesSubject.next(
      addresses.filter((address) => address.id !== index)
    );
  }

  editAddress(address: AddressType) {
    const addresses = this.addressesSubject.getValue();
    const index = addresses.findIndex((a) => a.id === address.id);
    addresses[index] = address;
    this.addressesSubject.next(addresses);
  }
}
