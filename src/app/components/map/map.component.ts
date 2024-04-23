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
export class MapComponent implements OnInit, OnDestroy {
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
            // signal: new Date(d.time_transmit).getTime() - new Date(d.time_rtc).getTime(),
            time: new Date(d.time_gps).getTime(),
          },
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(d.longitude), parseFloat(d.latitude)],
          },
        };
      });

      this.initializeMap();
    });
    this.subscriptions.push(sub);
    this.adressService.fetchAddresses();
  }

  ngAfterViewInit(): void {
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
  }

  initializeMap() {
    if (this.map) {
      this.map.addSource('location', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: this.locationData,
        },
      });

      this.map.addLayer({
        id: 'location-circle',
        type: 'circle',
        source: 'location',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'signal'],
            0,
            'rgb(255, 0, 0)',
            15,
            'rgb(255, 255, 102)',
            25,
            'rgb(144, 238, 144)',
            30,
            'rgb(0, 128, 0)',
          ],
          'circle-opacity': 0.5,
        },
      });

      // 3 HEATMAPS
      // this.map.addLayer({
      //   id: 'weak-heatmap',
      //   type: 'heatmap',
      //   source: 'location',
      //   filter: ['<=', ['get', 'signal'], 12],
      //   paint: {
      //     'heatmap-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['heatmap-density'],
      //       0,
      //       'rgba(255, 0, 0, 0)',
      //       1,
      //       'rgba(255, 0, 0, 1)',
      //     ],
      //     'heatmap-intensity': 1,
      //     'heatmap-radius': 15,
      //     'heatmap-opacity': 0.6,
      //   },
      // });

      // this.map.addLayer({
      //   id: 'medium-heatmap',
      //   type: 'heatmap',
      //   source: 'location',
      //   filter: [
      //     'all',
      //     ['>', ['get', 'signal'], 12],
      //     ['<=', ['get', 'signal'], 25],
      //   ],
      //   paint: {
      //     'heatmap-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['heatmap-density'],
      //       0,
      //       'rgba(255, 255, 0, 0)',
      //       1,
      //       'rgba(255, 255, 0, 1)',
      //     ],
      //     'heatmap-intensity': 1,
      //     'heatmap-radius': 15,
      //     'heatmap-opacity': 0.6,
      //   },
      // });

      // this.map.addLayer({
      //   id: 'strong-heatmap',
      //   type: 'heatmap',
      //   source: 'location',
      //   filter: ['>', ['get', 'signal'], 25],
      //   paint: {
      //     'heatmap-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['heatmap-density'],
      //       0,
      //       'rgba(0, 255, 0, 0)',
      //       1,
      //       'rgba(0, 255, 0, 1)',
      //     ],
      //     'heatmap-intensity': 1,
      //     'heatmap-radius': 15,
      //     'heatmap-opacity': 0.6,
      //   },
      // });
    }
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
