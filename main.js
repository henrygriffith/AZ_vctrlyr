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

import {pnameConversionChart} from './util'


// 'npm start' for live server in browser
let year = 2022;
let contest_arr = ["GOVERNOR", "U.S. SENATOR", "ATTORNEY GENERAL"]
let selectedContest, defaultContest = "GOVERNOR";
let elec_results;

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
    center: fromLonLat([-112, 34]),
    zoom: 7,
  }),
});

const AZPrecincts = new VectorLayer({
  source: new VectorSource({
    url: './data/ts-updated-az-precinct-shape-file_aug2022.geojson',
    format: new GeoJSON(),
  }),
  style: new Style({
    fill: new Fill({
      color: 'red',
    }),
    stroke: new Stroke({
      color: 'charcoal',
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
  const county_ele = document.getElementById("county-name");
  const symbol_ele = document.getElementById("symbol");
  const pname_ele = document.getElementById("prec-name");

  if (feature) {
    // From geometry file
    let county = feature.get('County').toUpperCase();
    let code = feature.get('pct_num');
    let pname = feature.get('pct_name')
    //

    pname = county == 'COCONINO' ? pnameConversionChart[county][year](pname, code) 
      : county == 'PIMA' ? pnameConversionChart[county][year](code) 
      : pnameConversionChart[county][year](pname);

    county_ele.innerHTML = county
    symbol_ele.innerHTML = "::"
    pname_ele.innerHTML = pname || '&nbsp;';

    const prec_obj = getPrecinctVotes(county, pname);
    const curr_contest = selectedContest || defaultContest;
    getAndWriteCandidates(prec_obj, county, pname, curr_contest);
    // then contest selector
    // then color matching - follow marks
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

const getPrecinctVotes = (county, pname) => {
  return elec_results[county][pname]
};

const getAndWriteCandidates = (prec_obj, county, pname, contest) => {
  const votes_box = document.getElementById('votes-cont')
  if (votes_box.hasChildNodes()) {
    votes_box.innerHTML = ''
  }
  const tot_votes_ele = document.getElementById("tot-votes");
  const curr_contest = prec_obj["contests"][contest]
  tot_votes_ele.innerHTML = curr_contest["total"]

  curr_contest.candidates.forEach((cand) => {
    const candLine = document.createElement("span")
    candLine.setAttribute('class', 'cand-line')
    const candName = document.createElement("span")
    candName.innerHTML = cand.name
    const candVotesCont = document.createElement('div');
    const candVotes = document.createElement("span")
    candVotes.innerHTML = cand.votes
    const candPerc = document.createElement("span")
    candPerc.setAttribute('class', 'percentage')
    candPerc.innerHTML = `${(cand.votes / curr_contest["total"] * 100).toFixed(2)} %`

    // const bar = document.createElement('div')
    // bar.setAttribute('class', 'vote-progress-bar')
    // const party = cand.party;
    // const votes_bar = document.createElement('div')
    // const color = party == 'DEM' ? "red" : party == 'REP' ? "blue" : "white"
    // votes_bar.style.backgroundColor = color;

    // console.log(bar.offsetWidth);
    // const widthy = bar.style.width * cand.votes / curr_contest["total"] * 100
    // votes_bar.style.width = widthy;

    candLine.appendChild(candName)
    candVotesCont.appendChild(candVotes)
    candVotesCont.appendChild(candPerc)
    // bar.appendChild(votes_bar)
    // candLine.appendChild(bar)
    candLine.appendChild(candVotesCont)
    votes_box.appendChild(candLine)
  })
}

const displayContests = () => {
  console.log('called')
  const contestContainer = document.getElementById('contest-select')
  for (const cont_name of contest_arr) {
    const contest = document.createElement('span')
    contest.innerHTML = cont_name;
    contest.setAttribute('class', 'contest');
    contest.addEventListener('click', function() {
      selectedContest = contest.innerHTML;
    })
    contestContainer.appendChild(contest)
  }
}

// ############ EVENTS #############
map.on('loadstart',async function(evt){
  fetch('./data/er2022.json')
    .then((response) => response.json())
    .then((json) => {
      elec_results = json
      // console.log(elec_results)
    });
  displayContests();
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