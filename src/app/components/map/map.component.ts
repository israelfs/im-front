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
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AREACHARTICON, LINECHARTICON, mapTilerStyles } from './map-styles';
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
  prettybadTransmitnessLayer,
  mediumTransmitnessLayer,
  prettyGoodHeatmapTransmitnessLayer,
} from './layers';
import { SelectAllDirective } from '../../shared/directives/select-all.directive';
import { format } from 'date-fns';
import { PlaceAutocompleteComponent } from '../place-autocomplete/place-autocomplete.component';
import { MatDialog } from '@angular/material/dialog';
import { ChartDialog } from '../chart-dialog/chart-dialog.component';

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
    MatIconModule,
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
    PlaceAutocompleteComponent,
  ],
  providers: [provideNativeDateAdapter()],
})
export class MapComponent implements OnInit, OnDestroy {
  map: Map | undefined;
  markers: Marker[] = [];

  private addressSubscription: Subscription | null = null;
  private chartDataSubscription: Subscription | null = null;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('rangeInput') rangeInput!: MatDateRangeInput<Date>;

  private _geocodeFilter:
    | {
        latitude: number;
        longitude: number;
      }
    | undefined;

  get geocodeFilter() {
    return this._geocodeFilter;
  }

  set geocodeFilter(
    value: { latitude: number; longitude: number } | undefined
  ) {
    if (value !== this._geocodeFilter) {
      this._geocodeFilter = value;
      if (value) {
        this.map?.setCenter([value.longitude, value.latitude]);
        this.map?.setZoom(15);
      }
    }
  }

  displayFilterDrawer = false;

  makeNewRequest = false;

  minDate: Date = new Date(2024, 2, 15);
  maxDate: Date = new Date();

  private currentStyle = 0;
  private locationData: any[] = [];

  companiesList = [
    {
      name: 'Transtusa',
      operation: ['Urbano', 'Eficiente', 'Fretamento', 'Apoio', 'Ideal'],
    },
    {
      name: 'Rimatur',
      operation: ['Ideal', 'Fretamento'],
    },
    {
      name: 'Gidion',
      operation: ['Urbano', 'Eficiente', 'Fretamento', 'Ideal'],
    },
    {
      name: 'Fratelli',
      operation: ['Ideal'],
    },
  ];
  selectedCompanies = new FormControl<string[][] | undefined>([]);

  chipOperatorList = ['Único', 'Dual', 'Multi', 'Multi4G', 'Celular'];
  selectedOperators = new FormControl<string[] | undefined>([]);

  groupingList: { name: string; value: string }[] = [
    { name: 'Baixo', value: 'low' },
    { name: 'Médio', value: 'medium' },
    { name: 'Alto', value: 'high' },
  ];
  selectedGrouping: 'low' | 'medium' | 'high' = 'low';

  selectedLayerType: 'heatmap' | 'circle' = 'heatmap';

  selectedFilterType: 'signal' | 'delay' | 'transmitness' = 'signal';

  loading$: Observable<boolean>;

  constructor(
    private adressService: AdressService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    this.loading$ = this.loadingService.loading$;
    iconRegistry.addSvgIconLiteral(
      'area-chart',
      sanitizer.bypassSecurityTrustHtml(AREACHARTICON)
    );
    iconRegistry.addSvgIconLiteral(
      'line-chart',
      sanitizer.bypassSecurityTrustHtml(LINECHARTICON)
    );
  }

  ngOnInit(): void {}

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

  openDialog(typeOfChart: string): void {
    this.loadingService.loadingOn();

    if (this.chartDataSubscription) {
      this.chartDataSubscription.unsubscribe();
    }

    this.chartDataSubscription = this.adressService
      .getChartData(typeOfChart)
      .subscribe((chartData) => {
        console.log('chartData', chartData);

        const dialogRef = this.dialog.open(ChartDialog, {
          data: { typeOfGraph: typeOfChart },
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('The dialog was closed');
        });
        this.loadingService.loadingOff();
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
      } else if (this.selectedFilterType === 'delay') {
        this.map.addLayer(prettyGoodHeatmapDelayLayer);
        this.map.addLayer(goodHeatmapDelayLayer);
        this.map.addLayer(mediumHeatmapDelayLayer);
        this.map.addLayer(badHeatmapDelayLayer);
        this.map.addLayer(prettyBadHeatmapDelayLayer);
      } else {
        this.map.addLayer(prettybadTransmitnessLayer);
        this.map.addLayer(mediumTransmitnessLayer);
        this.map.addLayer(prettyGoodHeatmapTransmitnessLayer);
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
    const companies = this.selectedCompanies.value || [];
    const operators = (this.selectedOperators.value as string[]) || [];
    const grouping = this.selectedGrouping;
    const range: DateRange<Date> = this.rangeInput.value as DateRange<Date>;
    const startDate = format(range.start || new Date(), 'yyyy-MM-dd HH:mm:ss');
    const endOfDay = new Date(range.end || new Date());
    endOfDay.setHours(23, 59, 59);
    const endDate = format(endOfDay, 'yyyy-MM-dd HH:mm:ss');

    this.loadingService.loadingOn();
    this.clearMapLayers();
    if (this.makeNewRequest) {
      if (this.addressSubscription) {
        this.addressSubscription.unsubscribe();
      }

      this.addressSubscription = this.adressService
        .getLocations(companies, operators, startDate, endDate, grouping)
        .subscribe((addresses) => {
          console.log(addresses.length);
          this._snackBar.open(
            `Foram encontrados ${addresses.length} registros`,
            'Fechar',
            {
              duration: 5000,
            }
          );
          this.locationData = addresses.map((d: any, index: number) => {
            return {
              type: 'Feature',
              properties: {
                id: index,
                signal: parseFloat(d.gsm_signal),
                timeDelay: parseFloat(d.transmit_delay),
                transmitness: parseFloat(d.transmitness || -1),
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

      this.makeNewRequest = false;
    } else {
      this.initializeMap();
    }
  }

  ngOnDestroy() {
    if (this.addressSubscription) {
      this.addressSubscription.unsubscribe();
    }
    if (this.chartDataSubscription) {
      this.chartDataSubscription.unsubscribe();
    }
    this.map?.remove();
  }

  switchDisplayFilterDrawer() {
    this.displayFilterDrawer = !this.displayFilterDrawer;
  }

  getSelectedCompaniesNames() {
    const companyNames = [
      ...new Set(this.selectedCompanies.value?.map((option) => option[0])),
    ];
    return companyNames.map((company) => {
      return `${company}(${this.selectedCompanies.value
        ?.filter((option) => option[0] === company)
        .map((option) => option[1])
        .join(', ')})`;
    });
  }
}
