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
import { Observable, Subscription, finalize } from 'rxjs';
import { OsrmService } from '../../services/osrm.service';
import { colors } from '../../shared/colors';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  mapStyles,
  mapTilerStyles,
  osmStyle,
  wikimediaStyle,
} from './map-styles';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

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
  imports: [
    SharedComponentsModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSelectModule,
    MatTooltipModule,
    AsyncPipe,
    NgIf,
    NgClass,
    NgTemplateOutlet,
  ],
})
export class MapComponent implements OnInit, OnDestroy {
  map: Map | undefined;
  private subscriptions: Subscription[] = [];
  markers: Marker[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  private currentStyle = 0;
  private locationData: any[] = [];

  displayFilterDrawer = false;

  selected: 'all' | 'mono' | 'bi' | 'multi' = 'all';

  loading$: Observable<boolean>;

  constructor(
    private photonService: PhotonKomootService,
    private adressService: AdressService,
    private osrmService: OsrmService,
    private loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    this.loadingService.loadingOn();

    const sub = this.adressService.addresses$.subscribe((addresses) => {
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
    this.adressService.fetchAddresses(this.selected);
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

  useCircleLayer() {
    if (this.map) {
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
            22,
            'rgb(144, 238, 144)',
            27,
            'rgb(0, 128, 0)',
          ],
          'circle-opacity': 0.5,
        },
      });
    }
  }

  useHeatmapLayer() {
    if (this.map) {
      this.map.addLayer({
        id: 'weak-heatmap',
        type: 'heatmap',
        source: 'location',
        filter: ['<=', ['get', 'signal'], 10],
        paint: {
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(255, 0, 0, 0)',
            1,
            'rgba(255, 0, 0, 1)',
          ],
          'heatmap-intensity': 1,
          'heatmap-radius': 15,
          'heatmap-opacity': 0.6,
        },
      });

      this.map.addLayer({
        id: 'medium-heatmap',
        type: 'heatmap',
        source: 'location',
        filter: [
          'all',
          ['>', ['get', 'signal'], 10],
          ['<=', ['get', 'signal'], 20],
        ],
        paint: {
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(255, 255, 0, 0)',
            1,
            'rgba(255, 255, 0, 1)',
          ],
          'heatmap-intensity': 1,
          'heatmap-radius': 15,
          'heatmap-opacity': 0.6,
        },
      });

      this.map.addLayer({
        id: 'strong-heatmap',
        type: 'heatmap',
        source: 'location',
        filter: ['>', ['get', 'signal'], 20],
        paint: {
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 255, 0, 0)',
            1,
            'rgba(0, 255, 0, 1)',
          ],
          'heatmap-intensity': 1,
          'heatmap-radius': 15,
          'heatmap-opacity': 0.6,
        },
      });
    }
  }

  initializeMap() {
    if (this.map) {
      const source = this.map.getSource('location') as any;

      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: this.locationData,
        });
      } else {
        this.map.addSource('location', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.locationData,
          },
        });
      }

      this.useHeatmapLayer();
      this.loadingService.loadingOff();
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

  clearMapLayers() {
    if (this.map) {
      const layers = this.map.getStyle().layers;
      layers.forEach((layer) => {
        if (this.map && (layer.type === 'heatmap' || layer.type === 'circle')) {
          this.map.removeLayer(layer.id);
        }
      });
    }
  }

  onManageFilters(event: any) {
    this.selected = event.value;

    this.loadingService.loadingOn();

    this.clearMapLayers();

    this.adressService.fetchAddresses(this.selected);
  }

  switchDisplayFilterDrawer() {
    this.displayFilterDrawer = !this.displayFilterDrawer;
  }
}
