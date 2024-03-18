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
import { mapStyles, osmStyle, wikimediaStyle } from './map-styles';

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

  constructor(
    private photonService: PhotonKomootService,
    private adressService: AdressService,
    private osrmService: OsrmService
  ) {}

  ngOnInit(): void {
    this.adressService.openWebSocket();
    this.subscriptions.push(
      this.adressService.getTodos().subscribe(
        (data: AddressType[]) => {
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
      lng: -48.8,
      lat: -26.3,
      zoom: 10,
    };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      style: '/assets/data.json',
      // style: 'http://localhost:8080/styles/street/style.json'
    });
  }

  ngOnDestroy() {
    this.adressService.closeWebSocket();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.map?.remove();
  }

  onChangeStyle() {
    this.currentStyle = (this.currentStyle + 1) % mapStyles.length;
    this.map?.setStyle(mapStyles[this.currentStyle]);
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
        'line-width': 4,
        'line-opacity': 0.75,
        'line-blur': 0.6,
      },
    });
  }

  async updateMarkers(addresses: AddressType[]) {
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];

    await Promise.all(
      addresses.map((address, index) => this.generateMarker(address))
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

  generateMarker(address: AddressType): Promise<void> {
    return new Promise((resolve, reject) => {
      const { lat, lng, id } = address;

      if (this.map) {
        const popup = new maplibregl.Popup({ offset: 25 });

        this.subscriptions.push(
          this.photonService.getGeoCoding(lat!, lng!).subscribe((data) => {
            if (data.features && data.features.length > 0) {
              const newText = this.photonService.getFormatedString(data);
              popup.setHTML(
                `<div class="text-xs text-gray-700">
                  ${newText}
                </div>`
              );
            }
          })
        );

        const marker = new maplibregl.Marker({
          color: colors[Math.abs(id) % colors.length],
          draggable: true,
        })
          .setLngLat([lng!, lat!])
          .setPopup(popup)
          .addTo(this.map)
          .on('dragend', () => {
            const newCoordinates = marker.getLngLat();
            this.subscriptions.push(
              this.photonService
                .getGeoCoding(newCoordinates.lat, newCoordinates.lng)
                .subscribe(
                  (newData) => {
                    const hasFeatures =
                      newData.features && newData.features.length > 0;
                    const newText = hasFeatures
                      ? this.photonService.getFormatedString(newData)
                      : 'No address found.';

                    const newAddress = {
                      ...address,
                      address: newText,
                      lat: newCoordinates.lat,
                      lng: newCoordinates.lng,
                    };

                    popup.setText(newText);

                    if (newAddress.id < 0) {
                      this.adressService.addAddress(newAddress);
                    } else {
                      this.adressService.editAddress(newAddress);
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
      } else {
        console.log('No map instance found.');
        reject(new Error('No map instance found.'));
      }
    });
  }
}
