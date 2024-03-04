import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Map, Marker } from 'maplibre-gl';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  private myAPIKey = 'a33609accdc248588025ae32858d52e2';
  private currentStyle = 0;
  private mapStyles = [
    // `https://tile.opennstreetmap.org/{z}/{x}/{y}.png`,
    'https://api.maptiler.com/maps/streets/style.json?key=nQRKKp2gwKsJ368E7KAJ',
    `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-bright-grey/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/maptiler-3d/style.json?apiKey=${this.myAPIKey}`,
    `https://maps.geoapify.com/v1/styles/dark-matter-purple-roads/style.json?apiKey=${this.myAPIKey}`,
  ];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.mapStyles[this.currentStyle],
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    new Marker()
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  onChangeStyle() {
    this.currentStyle = (this.currentStyle + 1) % this.mapStyles.length;
    this.map?.setStyle(this.mapStyles[this.currentStyle]);
  }
}
