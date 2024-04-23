import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { PhotonKomootService } from '../../services/photon-komoot.service';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { AdressService } from '../../services/adress.service';
import { Subscription } from 'rxjs';
import { OsrmService } from '../../services/osrm.service';
import { colors } from '../../shared/colors';

import {
  mapStyles,
  mapTilerStyles,
  osmStyle,
  wikimediaStyle,
} from './map-styles';

type gtfsType = {
  gsm_signal: number;
  heading: number;
  idposition: string;
  idvehicle: number;
  latitude: number;
  longitude: number;
  time_gps: string;
  time_rtc: string;
  time_transmit: string;
};

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [SharedComponentsModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  private subscriptions: Subscription[] = [];
  markers: Marker[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  private currentStyle = 0;
  private locationData: any[] = [];

  constructor(
    private photonService: PhotonKomootService,
    private adressService: AdressService,
    private osrmService: OsrmService
  ) {}

  ngOnInit(): void {
    const sub = this.adressService.addresses$.subscribe((addresses) => {
      // this.locationData = addresses;

      this.locationData = addresses.map((d: any, index) => {
        return {
          type: 'Feature',
          properties: {
            id: index,
            signal: parseFloat(d.gsm_signal),
            time: new Date(d.time_gps).getTime(),
          },
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(d.longitude), parseFloat(d.latitude)],
          },
        };
      });
    });
    this.subscriptions.push(sub);
    this.adressService.fetchAddresses();
  }

  ngAfterViewInit() {
    const initialState = {
      lng: -48.8,
      lat: -26.3,
      zoom: 10,
    };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      style: mapTilerStyles[this.currentStyle],
    });

    this.map.on('load', () => {
      if (this.map) {
        this.map.addSource('location', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.locationData,
          },
        });

        this.map.addLayer({
          id: 'location-heat',
          type: 'heatmap',
          source: 'location',
          maxzoom: 18,
          paint: {
            // Increase the heatmap color weight weight by zoom level
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              1,
              0,
              16,
              3,
            ],

            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.2,
              'rgb(103,169,207)',
              0.5,
              'rgb(209,229,240)',
              0.8,
              'rgb(253,219,199)',
              0.9,
              'rgb(239,138,98)',
              1,
              'rgb(178,24,43)',
            ],

            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              0,
              12,
              3,
              15,
              8,
            ],

            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12,
              1,
              15,
              0.7,
            ],
          },
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.map?.remove();
  }

  onChangeStyle() {
    this.currentStyle = (this.currentStyle + 1) % mapTilerStyles.length;
    this.map?.setStyle(mapTilerStyles[this.currentStyle]);
  }
}
