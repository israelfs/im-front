import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { PhotonKomootService } from '../../services/photon-komoot.service';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { AdressService } from '../../services/adress.service';
import { Observable, Subscription, finalize } from 'rxjs';
import { OsrmService } from '../../services/osrm.service';
import { colors } from '../../shared/colors';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import {
  DateRange,
  MatDateRangeInput,
  MatDateRangePicker,
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { mapTilerStyles } from './map-styles';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import {
  circleDelayLayer,
  circleSignalLayer,
  mediumHeatmapSignalLayer,
  goodHeatmapSignalLayer,
  badHeatmapSignalLayer,
  badHeatmapDelayLayer,
  mediumHeatmapDelayLayer,
  goodHeatmapDelayLayer,
  prettyBadHeatmapSignalLayer,
  prettyBadHeatmapDelayLayer,
  prettyGoodHeatmapSignalLayer,
  prettyGoodHeatmapDelayLayer,
} from './layers';
import { SelectAllDirective } from '../../shared/directives/select-all.directive';

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
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    MatSidenavModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    FormsModule,
    AsyncPipe,
    NgIf,
    NgClass,
    NgTemplateOutlet,
    SelectAllDirective,
  ],
  providers: [provideNativeDateAdapter()],
})
export class MapComponent implements OnInit, OnDestroy {
  map: Map | undefined;
  private subscriptions: Subscription[] = [];
  markers: Marker[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('rangeInput') rangeInput!: MatDateRangeInput<Date>;

  private currentStyle = 0;
  private locationData: any[] = [];

  displayFilterDrawer = false;

  companiesList: string[] = ['Prefetch'];
  selectedCompanies = new FormControl<string[] | undefined>([]);

  chipOperatorList: string[] = ['Único', 'Dual', 'Multi'];
  selectedOperators = new FormControl<string[] | undefined>([]);

  groupingList: { name: string; value: string }[] = [
    { name: 'Baixo', value: 'low' },
    { name: 'Médio', value: 'medium' },
    { name: 'Alto', value: 'high' },
  ];
  selectedGrouping: 'low' | 'medium' | 'high' = 'low';

  selectedLayerType: 'heatmap' | 'circle' = 'heatmap';

  selectedFilterType: 'signal' | 'delay' = 'signal';

  loading$: Observable<boolean>;

  constructor(
    private photonService: PhotonKomootService,
    private adressService: AdressService,
    private osrmService: OsrmService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    const sub = this.adressService.addresses$.subscribe((addresses) => {
      this.locationData = addresses.map((d: any, index) => {
        return {
          type: 'Feature',
          properties: {
            id: index,
            signal: parseFloat(d.gsm_signal),
            timeDelay: parseFloat(d.transmit_delay),
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

    const companySub = this.adressService.companies$.subscribe(
      (companies: { empresa: string }[]) => {
        if (companies.length > 0) {
          this.companiesList = companies.map((d) => d.empresa);
        }
      }
    );

    this.subscriptions.push(sub, companySub);

    this.adressService.fetchCompanies();
    // this.adressService.fetchAddresses(
    //   this.selectedOpeartorType,
    //   this.selectedCompany
    // );
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
    this.loading$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  useCircleLayer() {
    if (this.map) {
      if (this.selectedFilterType === 'signal') {
        this.map.addLayer(circleSignalLayer);
      } else {
        this.map.addLayer(circleDelayLayer);
      }
    }
  }

  useHeatmapLayer() {
    if (this.map) {
      if (this.selectedFilterType === 'signal') {
        this.map.addLayer(prettyBadHeatmapSignalLayer);
        this.map.addLayer(badHeatmapSignalLayer);
        this.map.addLayer(mediumHeatmapSignalLayer);
        this.map.addLayer(goodHeatmapSignalLayer);
        this.map.addLayer(prettyGoodHeatmapSignalLayer);
      } else {
        this.map.addLayer(prettyGoodHeatmapDelayLayer);
        this.map.addLayer(goodHeatmapDelayLayer);
        this.map.addLayer(mediumHeatmapDelayLayer);
        this.map.addLayer(badHeatmapDelayLayer);
        this.map.addLayer(prettyBadHeatmapDelayLayer);
      }
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
      this.selectedLayerType === 'circle'
        ? this.useCircleLayer()
        : this.useHeatmapLayer();
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

  onManageFilters(e: any) {
    const selectedCompanies = this.selectedCompanies.value;
    const selectedOperators = this.selectedOperators.value;

    const range: DateRange<Date> = this.rangeInput.value as DateRange<Date>;
    const startDate = range.start;
    const endDate = range.end;

    console.log(selectedCompanies, selectedOperators, startDate, endDate);

    // this.loadingService.loadingOn();
    // this.clearMapLayers();
    // this.adressService.fetchAddresses(
    //   this.selectedOpeartorType,
    //   this.selectedCompany
    // );
  }

  switchDisplayFilterDrawer() {
    this.displayFilterDrawer = !this.displayFilterDrawer;
  }
}
