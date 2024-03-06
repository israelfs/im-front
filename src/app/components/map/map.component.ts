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
import { AddressType } from '../todos/todos.component';
import { OsrmService } from '../../services/osrm.service';
import { colors } from '../../shared/colors';

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
  private mapStyles = [
    `https://api.maptiler.com/maps/bright-v2/style.json?key=nQRKKp2gwKsJ368E7KAJ`,
    `https://api.maptiler.com/maps/basic-v2/style.json?key=nQRKKp2gwKsJ368E7KAJ`,
    'https://api.maptiler.com/maps/streets/style.json?key=nQRKKp2gwKsJ368E7KAJ',
    'https://api.maptiler.com/maps/openstreetmap/style.json?key=nQRKKp2gwKsJ368E7KAJ',
    // `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/osm-bright-grey/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/osm-liberty/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/maptiler-3d/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
    // `https://maps.geoapify.com/v1/styles/dark-matter-purple-roads/style.json?apiKey=${a33609accdc248588025ae32858d52e2}`,
  ];

  constructor(
    private photonService: PhotonKomootService,
    private adressService: AdressService,
    private osrmService: OsrmService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.adressService.getTodos().subscribe(
        (data) => {
          this.adressService.setAddresses(data);
        },
        (error) => {
          console.error('Error:', error);
        }
      )
    );
    this.subscriptions.push(
      this.adressService.adresses$.subscribe((addresses) => {
        this.updateMarkers(addresses);
      })
    );
  }

  ngAfterViewInit() {
    const initialState = {
      lng: -48.85326977116436,
      lat: -26.30014974440676,
      zoom: 12,
    };

    const osmStyle = {
      // OSM ja usado hoje no editor
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm', // This must match the source key above
        },
      ],
    };

    const wikimediaStyle = {
      version: 8,
      sources: {
        wikimedia: {
          type: 'raster',
          tiles: ['https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; Wikimedia Contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'wikimedia',
          type: 'raster',
          source: 'wikimedia',
        },
      ],
    };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      // style: this.mapStyles[this.currentStyle], // this is to work with maptiler with ready to use styler
      style: 'assets/data.json', // this is to work with maptiler but with custom style
      // style: osmStyle as any, // this is to work with openStreetMap directly
      // style: wikimediaStyle as any, // this is to work with wikimedia directly
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    // new Marker()
    //   .setLngLat([initialState.lng, initialState.lat])
    //   .addTo(this.map);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.map?.remove();
  }

  onChangeStyle() {
    this.currentStyle = (this.currentStyle + 1) % this.mapStyles.length;
    this.map?.setStyle(this.mapStyles[this.currentStyle]);
    this.updateRoute();
  }

  updateGeoJsonLine(data?: any) {
    const geoJson = {
      type: 'Feature',
      properties: {},
      geometry: data?.routes[0].geometry,
    };
    this.map!.addSource('route', {
      type: 'geojson',
      data: geoJson as any,
    });
    this.map!.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#FF0000',
        'line-width': 5,
        'line-opacity': 0.5,
      },
    });
  }

  async updateMarkers(addresses: AddressType[]) {
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];

    await Promise.all(
      addresses.map((address, index) =>
        this.generateMarker(address.title, address.id)
      )
    );

    this.updateRoute();
  }

  updateRoute() {
    if (!this.map) {
      return;
    }

    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

    const coordinates = this.markers.map((marker) =>
      marker.getLngLat().toArray()
    );

    if (coordinates.length > 1) {
      this.subscriptions.push(
        this.osrmService.getRouting(coordinates).subscribe(
          (data) => {
            this.updateGeoJsonLine(data);
          },
          (error) => {
            console.error('Error:', error);
          }
        )
      );
    }
  }

  generateMarker(query: string, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscriptions.push(
        this.photonService.getCoordinates(query).subscribe(
          (data) => {
            if (data.features && data.features.length > 0) {
              const coordinates = data.features[0].geometry.coordinates;
              const latitude = coordinates[1];
              const longitude = coordinates[0];
              if (this.map) {
                const popup = new maplibregl.Popup({ offset: 25 }).setText(
                  query
                );

                const marker = new Marker({
                  color: colors[index % colors.length],
                  draggable: true,
                })
                  .setLngLat([longitude, latitude])
                  .setPopup(popup)
                  .addTo(this.map)
                  .on('dragend', () => {
                    const newCoordinates = marker.getLngLat();
                    this.subscriptions.push(
                      this.photonService
                        .getGeoCoding(newCoordinates.lat, newCoordinates.lng)
                        .subscribe(
                          (newData) => {
                            if (
                              newData.features &&
                              newData.features.length > 0
                            ) {
                              const newStreet =
                                newData.features[0].properties.street ||
                                newData.features[0].properties.name;
                              const newNumber =
                                newData.features[0].properties.housenumber ||
                                '';
                              const newCity =
                                newData.features[0].properties.city;
                              const newCountryCode =
                                newData.features[0].properties.countrycode;

                              const newText = newNumber
                                ? `${newStreet}, ${newNumber}, ${newCity}, ${newCountryCode}`
                                : `${newStreet}, ${newCity}, ${newCountryCode}`;

                              popup.setText(newText);
                              this.adressService.editAddress({
                                id: index,
                                title: newText,
                              });
                            } else {
                              popup.setText('No address found.');
                              this.adressService.editAddress({
                                id: index,
                                title: 'No address found.',
                              });
                            }
                          },
                          (error) => {
                            console.error('Error:', error);
                          }
                        )
                    );
                  });

                this.markers.push(marker);
                resolve();
              }
            } else {
              console.log('No coordinates found.');
            }
          },
          (error) => {
            console.error('Error:', error);
            reject(error);
          }
        )
      );
    });
  }
}
