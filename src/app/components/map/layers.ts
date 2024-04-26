export const circleSignalLayer: maplibregl.AddLayerObject = {
  id: 'location-circle',
  type: 'circle',
  source: 'location',
  paint: {
    'circle-radius': 15,
    'circle-color': [
      'step',
      ['get', 'signal'],
      'rgb(255, 0, 0)',
      6,
      'rgba(255, 100, 100)',
      12,
      'rgb(144, 238, 144)',
      20,
      'rgb(0, 128, 0)',
    ],
    'circle-opacity': 0.5,
  },
};

export const circleDelayLayer: maplibregl.AddLayerObject = {
  id: 'location-circle-delay',
  type: 'circle',
  source: 'location',
  paint: {
    'circle-radius': 15,
    'circle-color': [
      'step',
      ['get', 'timeDelay'],
      'rgb(0, 128, 0)',
      60,
      'rgb(144, 238, 144)',
      300,
      'rgba(255, 100, 100)',
      900,
      'rgb(255, 0, 0)',
    ],
    'circle-opacity': 0.5,
  },
};

// muito bom > 20
// bom > 12
// ruim > 6
// muito ruim > 0

export const prettyBadHeatmapSignalLayer: maplibregl.AddLayerObject = {
  id: 'pretty-weak-heatmap',
  type: 'heatmap',
  source: 'location',
  filter: ['<=', ['get', 'signal'], 6],
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
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const badHeatmapSignalLayer: maplibregl.AddLayerObject = {
  id: 'weak-heatmap',
  type: 'heatmap',
  source: 'location',
  filter: ['all', ['>', ['get', 'signal'], 6], ['<=', ['get', 'signal'], 12]],
  paint: {
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(255, 0, 0, 0)',
      1,
      'rgba(255, 100, 100, 1)',
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const mediumHeatmapSignalLayer: maplibregl.AddLayerObject = {
  id: 'medium-heatmap',
  type: 'heatmap',
  source: 'location',
  filter: ['all', ['>', ['get', 'signal'], 12], ['<=', ['get', 'signal'], 20]],
  paint: {
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(255, 255, 0, 0)',
      1,
      'rgb(144, 238, 144)',
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const goodHeatmapSignalLayer: maplibregl.AddLayerObject = {
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
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

// delay bom < 60s
// delay medio < 300s
// delay ruim < 15*60s
// delay muito ruim > 3600s

export const goodHeatmapDelayLayer: maplibregl.AddLayerObject = {
  id: 'good-heatmap-delay',
  type: 'heatmap',
  source: 'location',
  filter: ['<=', ['get', 'timeDelay'], 60],
  paint: {
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(0, 128, 0, 0)',
      1,
      'rgba(0, 128, 0, 1)',
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const mediumHeatmapDelayLayer: maplibregl.AddLayerObject = {
  id: 'medium-heatmap-delay',
  type: 'heatmap',
  source: 'location',
  filter: [
    'all',
    ['>', ['get', 'timeDelay'], 60],
    ['<=', ['get', 'timeDelay'], 300],
  ],
  paint: {
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(255, 255, 102, 0)',
      1,
      'rgb(144, 238, 144)',
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const badHeatmapDelayLayer: maplibregl.AddLayerObject = {
  id: 'bad-heatmap-delay',
  type: 'heatmap',
  source: 'location',
  filter: [
    'all',
    ['>', ['get', 'timeDelay'], 300],
    ['<=', ['get', 'timeDelay'], 900],
  ],
  paint: {
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(255, 255, 102, 0)',
      1,
      'rgba(255, 100, 100, 1)',
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};

export const prettyBadHeatmapDelayLayer: maplibregl.AddLayerObject = {
  id: 'pretty-bad-heatmap-delay',
  type: 'heatmap',
  source: 'location',
  filter: ['>', ['get', 'timeDelay'], 900],
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
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
  },
};
