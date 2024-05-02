import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-place-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    GoogleMapsModule,
    MatIconModule,
  ],
  templateUrl: './place-autocomplete.component.html',
  styleUrl: './place-autocomplete.component.css',
})
export class PlaceAutocompleteComponent implements OnInit {
  @ViewChild('inputField')
  inputField!: ElementRef;

  @Input() placeholder = 'Pesquise um local...';

  @Output() placeSelected = new EventEmitter<{
    latitude: number;
    longitude: number;
  }>();

  autocomplete: google.maps.places.Autocomplete | undefined;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(
      this.inputField.nativeElement
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        const result = { latitude, longitude };
        this.placeSelected.emit(result);
      }
    });
  }
}
