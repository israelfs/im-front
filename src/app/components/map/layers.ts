export const circleSignalLayer: maplibregl.AddLayerObject = {
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
      10,
      'rgb(255, 255, 102)',
      20,
      'rgb(144, 238, 144)',
      25,
      'rgb(0, 128, 0)',
    ],
    'circle-opacity': 0.5,
  },
};

export const circleDelayLayer = (
  minDelay: number,
  maxDelay: number
): maplibregl.AddLayerObject => {
  const variance = maxDelay - minDelay;
  const quartile = variance / 4;

  return {
    id: 'location-circle-delay',
    type: 'circle',
    source: 'location',
    paint: {
      'circle-radius': 10,
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'timeDelay'],
        minDelay,
        'rgb(0, 128, 0)',
        minDelay + quartile,
        'rgb(144, 238, 144)',
        minDelay + 2 * quartile,
        'rgb(255, 255, 102)',
        minDelay + 3 * quartile,
        'rgb(255, 0, 0)',
      ],
      'circle-opacity': 0.5,
    },
  };
};

export const badHeatmapSignalLayer: maplibregl.AddLayerObject = {
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
};

export const mediumHeatmapSignalLayer: maplibregl.AddLayerObject = {
  id: 'medium-heatmap',
  type: 'heatmap',
  source: 'location',
  filter: ['all', ['>', ['get', 'signal'], 10], ['<=', ['get', 'signal'], 22]],
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
};

export const goodHeatmapSignalLayer: maplibregl.AddLayerObject = {
  id: 'strong-heatmap',
  type: 'heatmap',
  source: 'location',
  filter: ['>', ['get', 'signal'], 22],
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
};

export const goodHeatmapDelayLayer = (
  minDelay: number,
  maxDelay: number
): maplibregl.AddLayerObject => {
  const variance = maxDelay - minDelay;
  const quartile = variance / 4;

  return {
    id: 'good-heatmap-delay',
    type: 'heatmap',
    source: 'location',
    filter: ['<=', ['get', 'timeDelay'], minDelay + quartile],
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
      'heatmap-radius': 15,
      'heatmap-opacity': 0.8,
    },
  };
};

export const mediumHeatmapDelayLayer = (
  minDelay: number,
  maxDelay: number
): maplibregl.AddLayerObject => {
  const variance = maxDelay - minDelay;
  const quartile = variance / 4;

  return {
    id: 'medium-heatmap-delay',
    type: 'heatmap',
    source: 'location',
    filter: [
      'all',
      ['>', ['get', 'timeDelay'], minDelay + quartile],
      ['<=', ['get', 'timeDelay'], minDelay + 2 * quartile],
    ],
    paint: {
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(255, 255, 102, 0)',
        1,
        'rgba(255, 255, 102, 1)',
      ],
      'heatmap-intensity': 1,
      'heatmap-radius': 15,
      'heatmap-opacity': 0.8,
    },
  };
};

export const badHeatmapDelayLayer = (
  minDelay: number,
  maxDelay: number
): maplibregl.AddLayerObject => {
  const variance = maxDelay - minDelay;
  const quartile = variance / 4;

  return {
    id: 'bad-heatmap-delay',
    type: 'heatmap',
    source: 'location',
    filter: ['>', ['get', 'timeDelay'], minDelay + 2 * quartile],
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
      'heatmap-opacity': 0.8,
    },
  };
};
