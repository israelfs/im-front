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
    // call api here
  }

  addAddress() {
    const id = this.address.length;
    this.address.push({
      id: id,
      address: this.inputAddress,
    });
    this.addressService.addAddress({
      id: id,
      address: this.inputAddress,
    });
    this.inputAddress = '';
  }

  onRemoveAddress(index: number) {
    this.address = this.address.filter((item) => item.id !== index);
    this.addressService.removeAddress(index);
  }
}
