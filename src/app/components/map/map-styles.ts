import { environment } from '../../../environments/environment.development';

export const mapStyles = [
  `https://api.maptiler.com/maps/streets/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/bright-v2/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/basic-v2/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/openstreetmap/style.json?key=${environment.MAPTILER_KEY}`,
];

export const osmStyle = {
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

export const wikimediaStyle = {
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
