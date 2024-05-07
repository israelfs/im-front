import { environment } from '../../../environments/environment.development';

// TILESERVER-GL (LOCALLY)
export const mapStyles = [
  'http://localhost:8080/styles/street/style.json',
  'http://localhost:8080/styles/basic/style.json',
  'http://localhost:8080/styles/bright/style.json',
];

export const mapTilerStyles = [
  `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/streets/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/bright-v2/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/basic-v2/style.json?key=${environment.MAPTILER_KEY}`,
  `https://api.maptiler.com/maps/openstreetmap/style.json?key=${environment.MAPTILER_KEY}`,
];

export const osmStyle = {
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
      source: 'osm',
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

export const AREACHARTICON = `
  <svg fill="#000000" width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon">
    <path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm-616-64h536c4.4 0 8-3.6 8-8V284c0-7.2-8.7-10.7-13.7-5.7L592 488.6l-125.4-124a8.03 8.03 0 0 0-11.3 0l-189 189.6a7.87 7.87 0 0 0-2.3 5.6V720c0 4.4 3.6 8 8 8z"/>
  </svg>
`;

export const LINECHARTICON = `
  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M20 8L16.0811 12.1827C15.9326 12.3412 15.8584 12.4204 15.7688 12.4614C15.6897 12.4976 15.6026 12.5125 15.516 12.5047C15.4179 12.4958 15.3215 12.4458 15.1287 12.3457L11.8713 10.6543C11.6785 10.5542 11.5821 10.5042 11.484 10.4953C11.3974 10.4875 11.3103 10.5024 11.2312 10.5386C11.1416 10.5796 11.0674 10.6588 10.9189 10.8173L7 15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
