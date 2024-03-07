import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdressService } from '../../services/adress.service';
import { PhotonKomootService } from '../../services/photon-komoot.service';
import { Subscription } from 'rxjs';
import { colors } from '../../shared/colors';

export type AddressType = {
  id: number;
  title: string;
  lat?: number;
  lng?: number;
  address?: string;
};

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnDestroy {
  address: AddressType[] = [];

  addressColors: string[] = [];

  private subscriptions: Subscription[] = [];

  inputTitle = '';
  inputAddress = '';

  constructor(
    private addressService: AdressService,
    private photonService: PhotonKomootService
  ) {}

  ngOnInit() {
    this.addressService.adresses$.subscribe((addresses) => {
      this.address = addresses;
      this.addressColors = this.address.map(
        (address) => colors[Math.abs(address.id) % colors.length]
      );
    });
  }
  addAddress() {
    // generate a temporary id wich is not in use
    const id = -(this.addAddress.length + 1);
    const newAddress: AddressType = {
      id: id,
      title: this.inputTitle,
      address: this.inputAddress,
    };
    this.addressService.addAddress(newAddress);
    this.inputTitle = '';
    this.inputAddress = '';
  }

  validateAndAddAddress(): void {
    if (!this.inputTitle || !this.inputAddress) {
      alert('Both fields are required!');
      return;
    }

    this.photonService.getCoordinates(this.inputAddress).subscribe((data) => {
      if (data.features && data.features.length > 0) {
        const country = data.features[0].properties.country;
        if (country !== 'Brazil') {
          alert('Address must be valid and inside Brazil');
          return;
        }
        this.addAddress();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onRemoveAddress(id: number) {
    this.addressService.removeAddress(id);
  }

  onEditAddress(updatedAddress: AddressType) {
    this.addressService.editAddress(updatedAddress);
  }
}
