import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Map, Marker, NavigationControl } from 'maplibre-gl';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  private myAPIKey = 'a33609accdc248588025ae32858d52e2';
  private currentStyle = 0;
  private mapStyles = [
    `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-bright-grey/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/maptiler-3d/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/dark-matter-purple-roads/style.json?apiKey=${this.myAPIKey}`,
  ];

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    const initialState = { lng: 139.753, lat: 35.6844, zoom: 10 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.mapStyles[this.currentStyle],
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    this.map.addControl(new NavigationControl(), 'top-right');

    new Marker({ color: '#FF0000' })
      .setLngLat([139.7525, 35.6846])
      .addTo(this.map);
  }

  onChangeMapStyle() {
    this.currentStyle = (this.currentStyle + 1) % this.mapStyles.length;
    if (this.map) {
      this.map.setStyle(this.mapStyles[this.currentStyle]);
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
