import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj.js';
import {Fill, Stroke, Style} from 'ol/style.js'

// 'npm start' for live server in browser

const style = new Style({
  fill: new Fill({
    color: '#eeeeee'
  })
})

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
      // visible: false,
    }),
  ],
  view: new View({
    center: fromLonLat([-112, 33]),
    zoom: 5.75,
  }),
});

const AZPrecincts = new VectorLayer({
  source: new VectorSource({
    url: './data/ts-updated-az-precinct-shape-file_aug2022.geojson',
    format: new GeoJSON(),
  }),
  style: new Style({
    // fill: new Fill({
    //   color: 'red',
    // }),
    stroke: new Stroke({
      color: 'blue',
    }),
  }),
  visible: true,
  title: '2022 AZ Precincts'
});

map.addLayer(AZPrecincts);

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  }),
})

let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById("info");
  if (feature) {
    info.innerHTML = feature.get('pct_name').toUpperCase() || '&nbsp;';
    console.log(info.innerHTML)
  } else {
    info.innerHTML = '&nbsp;';
  }
  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
}

map.on('postcompose',function(evt){
  // document.querySelector('canvas').style.filter="grayscale(100%)";
  // const mLayers = map.getLayersByClass
});

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
})

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
})



