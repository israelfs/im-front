import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdressService } from '../../services/adress.service';

export type AddressType = {
  id: number;
  address: string;
};

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent {
  address: AddressType[] = [];

  inputAddress = '';

  constructor(private addressService: AdressService) {}

  ngOnInit() {
    // call api here also
    this.addressService.adresses$.subscribe((addresses) => {
      this.address = addresses;
    });
  }
  addAddress() {
    const id = this.address.length;
    const newAddress: AddressType = {
      id: id,
      address: this.inputAddress,
    };
    this.addressService.addAddress(newAddress);
    this.inputAddress = '';
  }

  onRemoveAddress(id: number) {
    this.addressService.removeAddress(id);
  }

  onEditAddress(updatedAddress: AddressType) {
    this.addressService.editAddress(updatedAddress);
  }
}
